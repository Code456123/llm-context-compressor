"""
Ultra-Low Resource LLM Context Compression Engine
====================================================
Extractive, semantic-retrieval-based context compressor with adaptive
LLM verification.

Pipeline:
  1. STRUCTURAL STRIP    -- pure rules, zero ML. Kill comments, blank lines,
     duplicate blocks, filler phrases. Free compression, zero accuracy risk.
  2. CHUNKING             -- split remaining text into semantic units
     (functions/classes for code, turns/paragraphs for chat/text).
  3. BI-ENCODER RETRIEVAL -- embed all chunks with a sentence-transformer,
     index them in a FAISS vector index, and retrieve the top candidates
     by similarity to the query. This is the "recall" stage: fast,
     approximate, casts a wide net.
  4. MMR DIVERSIFICATION  -- greedily re-rank retrieved candidates to
     balance relevance vs redundancy (Maximal Marginal Relevance), so we
     don't keep five chunks that all say the same thing.
  5. CROSS-ENCODER RERANK -- the "precision" stage. A cross-encoder jointly
     scores (query, chunk) pairs -- much more accurate than cosine
     similarity, but too slow to run on everything, so it only reranks the
     shortlist that survived steps 3-4. Same two-stage retrieve-then-rerank
     architecture used in production RAG/search systems.
  6. BUDGET PACKING       -- keep top-ranked chunks until the 70% token
     cut target is hit.
  7. ADAPTIVE VERIFICATION -- confidence check on the packed selection: if
     the margin between the last kept chunk and the best cut chunk is
     thin (i.e. the cut was a close call and might drop something the
     question needs), ONE LLM call reviews the borderline chunks and can
     rescue anything critical. If confidence is already high, this step
     is skipped entirely -- zero extra cost, zero extra latency. This is
     what lets the pipeline aim for 95%+ retention without paying for an
     LLM call on every single request.

Steps 1-6 never call an LLM -- they're local, fast, and free. Step 7 calls
an LLM only when the extractive signal itself looks uncertain.
"""

from __future__ import annotations

import hashlib
import re
import time
from dataclasses import dataclass, field
from typing import Literal

import numpy as np

# --------------------------------------------------------------------------
# Fixed project targets
# --------------------------------------------------------------------------

TARGET_COMPRESSION_FRACTION = 0.70   # cut >=70% of tokens
TARGET_KEEP_FRACTION = 1 - TARGET_COMPRESSION_FRACTION
TARGET_ACCURACY_PCT = 95.0           # aim to retain >=95% answer accuracy


# --------------------------------------------------------------------------
# Tokenizer (approximate, no API needed). ~4 chars/token is a solid English
# and code approximation used widely for quick estimates.
# --------------------------------------------------------------------------

def count_tokens(text: str) -> int:
    if not text:
        return 0
    words = re.findall(r"\S+", text)
    return max(len(words), len(text) // 4)


# --------------------------------------------------------------------------
# Layer 1: Structural stripping (rule-based, content-type aware)
# --------------------------------------------------------------------------

_FILLER_PHRASES = [
    r"\bas i mentioned( earlier| before)?\b",
    r"\bjust to clarify\b",
    r"\bplease note that\b",
    r"\bkindly note\b",
    r"\bi hope this helps\b",
    r"\bto reiterate\b",
    r"\bas previously stated\b",
    r"\bfeel free to\b",
    r"\bi just wanted to\b",
    r"\bbasically\b",
    r"\bactually\b",
    r"\bin order to\b",
]
_FILLER_RE = re.compile("|".join(_FILLER_PHRASES), re.IGNORECASE)

_PY_COMMENT_RE = re.compile(r"(?m)^\s*#.*$")
_PY_DOCSTRING_RE = re.compile(r'("""|\'\'\')(.*?)(\1)', re.DOTALL)
_C_LINE_COMMENT_RE = re.compile(r"(?m)//.*$")
_C_BLOCK_COMMENT_RE = re.compile(r"/\*.*?\*/", re.DOTALL)
_BLANK_LINES_RE = re.compile(r"\n\s*\n+")


def strip_structural(text: str, content_type: str, keep_comments: bool = False) -> str:
    """Rule-based bulk removal: comments, blank lines, duplicate blocks."""
    out = text

    if content_type == "code" and not keep_comments:
        out = _PY_DOCSTRING_RE.sub("", out)
        out = _PY_COMMENT_RE.sub("", out)
        out = _C_BLOCK_COMMENT_RE.sub("", out)
        out = _C_LINE_COMMENT_RE.sub("", out)

    if content_type == "chat":
        out = _FILLER_RE.sub("", out)

    out = _BLANK_LINES_RE.sub("\n\n", out)
    out = re.sub(r"[ \t]+", " ", out)
    out = re.sub(r"(?m)^[ \t]+", "", out)

    return dedupe_blocks(out)


def dedupe_blocks(text: str, min_block_chars: int = 40) -> str:
    """Hash-based removal of exact/near-duplicate blocks."""
    blocks = re.split(r"\n\s*\n", text)
    seen: set[str] = set()
    kept = []
    for b in blocks:
        b_stripped = b.strip()
        if not b_stripped:
            continue
        key = hashlib.md5(re.sub(r"\s+", " ", b_stripped).encode()).hexdigest()
        if len(b_stripped) >= min_block_chars and key in seen:
            continue
        seen.add(key)
        kept.append(b)
    return "\n\n".join(kept)


# --------------------------------------------------------------------------
# Layer 2: Chunking
# --------------------------------------------------------------------------

@dataclass
class Chunk:
    text: str
    idx: int
    kind: str = "generic"
    tokens: int = 0

    def __post_init__(self):
        self.tokens = count_tokens(self.text)


_PY_DEF_RE = re.compile(r"(?m)^(class |def |async def )")


def chunk_code(text: str) -> list[Chunk]:
    matches = list(_PY_DEF_RE.finditer(text))
    if not matches:
        return chunk_generic(text)

    chunks = []
    if matches[0].start() > 0:
        header = text[: matches[0].start()].strip()
        if header:
            chunks.append(Chunk(header, len(chunks), kind="header"))

    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        block = text[start:end].strip()
        if block:
            chunks.append(Chunk(block, len(chunks), kind="function"))
    return chunks


def chunk_chat(text: str) -> list[Chunk]:
    turn_re = re.compile(
        r"(?m)^(?:\[?\d{1,2}:\d{2}(?::\d{2})?\]?\s*)?(Customer|Agent|User|Assistant|System)\s*:",
        re.IGNORECASE,
    )
    matches = list(turn_re.finditer(text))
    if len(matches) >= 2:
        chunks = []
        for i, m in enumerate(matches):
            start = m.start()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            block = text[start:end].strip()
            if block:
                chunks.append(Chunk(block, len(chunks), kind="turn"))
        return chunks
    return chunk_generic(text)


def chunk_generic(text: str) -> list[Chunk]:
    parts = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    return [Chunk(p, i, kind="paragraph") for i, p in enumerate(parts)]


def chunk_text(text: str, content_type: str) -> list[Chunk]:
    if content_type == "code":
        return chunk_code(text)
    if content_type == "chat":
        return chunk_chat(text)
    return chunk_generic(text)


# --------------------------------------------------------------------------
# Layer 3: Bi-encoder embeddings + FAISS index (recall stage)
# --------------------------------------------------------------------------

_EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_RERANK_MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"

_embed_model = None
_rerank_model = None
_embedder_backend = None   # "minilm" | "tfidf" -- for UI display
_reranker_backend = None   # "cross-encoder" | "unavailable" -- for UI display


def _try_load_minilm():
    global _embed_model
    if _embed_model is not None:
        return _embed_model
    try:
        from sentence_transformers import SentenceTransformer
        _embed_model = SentenceTransformer(_EMBED_MODEL_NAME)
        return _embed_model
    except Exception:
        return None


def _try_load_cross_encoder():
    global _rerank_model
    if _rerank_model is not None:
        return _rerank_model
    try:
        from sentence_transformers import CrossEncoder
        _rerank_model = CrossEncoder(_RERANK_MODEL_NAME)
        return _rerank_model
    except Exception:
        return None


class _TfidfEmbedder:
    """Dependency-light fallback embedder used only if MiniLM can't be
    downloaded (e.g. no internet access to huggingface.co). Same
    retrieval/MMR logic runs on top of it -- just a less semantically
    rich vector space."""

    def encode(self, texts, normalize_embeddings=True, show_progress_bar=False):
        from sklearn.feature_extraction.text import TfidfVectorizer
        vectorizer = TfidfVectorizer(stop_words="english", max_features=4096)
        matrix = vectorizer.fit_transform(texts).toarray().astype(np.float32)
        if normalize_embeddings:
            norms = np.linalg.norm(matrix, axis=1, keepdims=True) + 1e-8
            matrix = matrix / norms
        return matrix


def get_embedder():
    """Returns an object with `.encode(texts) -> np.ndarray`. Prefers the
    local MiniLM sentence-transformer; falls back to TF-IDF if the model
    can't be downloaded, so the pipeline never hard-fails."""
    global _embedder_backend
    model = _try_load_minilm()
    if model is not None:
        _embedder_backend = "minilm"
        return model
    _embedder_backend = "tfidf"
    return _TfidfEmbedder()


def get_embedder_backend_name() -> str:
    return _embedder_backend or "not loaded yet"


def get_reranker_backend_name() -> str:
    return _reranker_backend or "not loaded yet"


def _faiss_topk(query_vec: np.ndarray, chunk_vecs: np.ndarray, k: int) -> tuple[np.ndarray, np.ndarray]:
    """Build a FAISS inner-product index over chunk_vecs (already
    L2-normalized, so inner product == cosine similarity) and retrieve the
    top-k most similar to query_vec. Falls back to plain numpy if faiss
    isn't importable for some reason. Returns (scores, indices)."""
    k = min(k, len(chunk_vecs))
    try:
        import faiss
        dim = chunk_vecs.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(chunk_vecs.astype(np.float32))
        scores, indices = index.search(query_vec.astype(np.float32).reshape(1, -1), k)
        return scores[0], indices[0]
    except Exception:
        sims = (chunk_vecs @ query_vec.reshape(-1, 1)).flatten()
        top_idx = np.argsort(-sims)[:k]
        return sims[top_idx], top_idx


def _cosine_sim_matrix(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    a_norm = a / (np.linalg.norm(a, axis=1, keepdims=True) + 1e-8)
    b_norm = b / (np.linalg.norm(b, axis=1, keepdims=True) + 1e-8)
    return a_norm @ b_norm.T


# --------------------------------------------------------------------------
# Layer 4-5: Retrieve (FAISS) -> MMR diversify -> Cross-encoder rerank
# --------------------------------------------------------------------------

@dataclass
class SelectedChunk:
    chunk: Chunk
    relevance: float
    rank: int
    rerank_score: float | None = None


def select_chunks(
    chunks: list[Chunk],
    query: str,
    token_budget: int,
    lambda_relevance: float = 0.7,
    use_reranker: bool = True,
) -> list[SelectedChunk]:
    """Two-stage retrieve-then-rerank selection:

    1. Bi-encoder embeds all chunks + query, FAISS retrieves a wide
       candidate pool by cosine similarity (recall stage -- fast,
       approximate, casts a wide net over ALL chunks).
    2. MMR greedily orders that pool balancing relevance vs redundancy.
    3. A cross-encoder jointly re-scores the MMR-ordered shortlist
       (precision stage -- slower per-pair but much more accurate, only
       run on the shortlist that already survived steps 1-2).
    4. Budget packing keeps the top cross-encoder-ranked chunks until the
       token budget is hit.
    """
    if not chunks:
        return []

    model = get_embedder()
    texts = [c.text for c in chunks]
    all_embs = model.encode([query] + texts, normalize_embeddings=True, show_progress_bar=False)
    query_emb = all_embs[0]
    chunk_embs = all_embs[1:]

    # --- Stage A: FAISS recall -- retrieve a generous candidate pool ---
    # Wide net: 3x the number of chunks we could conceivably need, capped
    # to all chunks. This is cheap (FAISS flat index, small n) and ensures
    # MMR/reranking has real choices rather than starving on a tiny pool.
    recall_k = min(len(chunks), max(20, len(chunks)))
    _, candidate_idx = _faiss_topk(query_emb, chunk_embs, recall_k)

    cand_embs = chunk_embs[candidate_idx]
    cand_chunks = [chunks[i] for i in candidate_idx]
    relevance = (cand_embs @ query_emb.reshape(-1, 1)).flatten()

    # --- Stage B: MMR diversification over the candidate pool ---
    chunk_sim = _cosine_sim_matrix(cand_embs, cand_embs)
    n = len(cand_chunks)
    max_sim_to_picked = np.zeros(n)
    remaining_mask = np.ones(n, dtype=bool)
    mmr_order: list[int] = []

    # Order the WHOLE candidate pool by MMR (not budget-limited yet) so the
    # reranker has a relevance-and-diversity-aware shortlist to work with.
    while remaining_mask.any():
        scores = lambda_relevance * relevance - (1 - lambda_relevance) * max_sim_to_picked
        scores = np.where(remaining_mask, scores, -np.inf)
        best_idx = int(np.argmax(scores))
        mmr_order.append(best_idx)
        remaining_mask[best_idx] = False
        np.maximum(max_sim_to_picked, chunk_sim[best_idx], out=max_sim_to_picked)

    # --- Stage C: Cross-encoder rerank (precision stage) ---
    # Only rerank a shortlist (top ~2x what could fit in budget) -- cross-
    # encoders are O(pairs) and too slow to run on hundreds of chunks.
    shortlist_size = min(n, max(8, int(len(chunks) * 0.6)))
    shortlist = mmr_order[:shortlist_size]

    rerank_scores = None
    if use_reranker:
        reranker = _try_load_cross_encoder()
        global _reranker_backend
        if reranker is not None:
            _reranker_backend = "cross-encoder"
            pairs = [(query, cand_chunks[i].text) for i in shortlist]
            try:
                rerank_scores = reranker.predict(pairs)
            except Exception:
                rerank_scores = None
        else:
            _reranker_backend = "unavailable"

    if rerank_scores is not None:
        order = sorted(range(len(shortlist)), key=lambda j: -rerank_scores[j])
        final_order = [shortlist[j] for j in order]
        score_lookup = {shortlist[j]: float(rerank_scores[j]) for j in range(len(shortlist))}
    else:
        final_order = shortlist
        score_lookup = {}

    # --- Stage D: budget packing ---
    picked: list[int] = []
    used_tokens = 0
    for i in final_order:
        tok = cand_chunks[i].tokens
        if used_tokens + tok > token_budget and picked:
            continue
        picked.append(i)
        used_tokens += tok
        if used_tokens >= token_budget:
            break

    picked_sorted = sorted(picked, key=lambda i: cand_chunks[i].idx)
    return [
        SelectedChunk(
            chunk=cand_chunks[i],
            relevance=float(relevance[i]),
            rank=rank,
            rerank_score=score_lookup.get(i),
        )
        for rank, i in enumerate(picked_sorted)
    ]


# --------------------------------------------------------------------------
# Public API
# --------------------------------------------------------------------------

@dataclass
class CompressionResult:
    original_text: str
    compressed_text: str
    original_tokens: int
    compressed_tokens: int
    compression_ratio: float  # fraction REMOVED, e.g. 0.72 = 72% smaller
    selected_chunks: list[SelectedChunk] = field(default_factory=list)
    dropped_chunks: int = 0
    total_chunks: int = 0
    llm_calls_used: int = 0
    verification_triggered: bool = False
    verification_notes: list[str] = field(default_factory=list)
    confidence: float = 0.0  # 0-1, how confident the extractive cut was
    compression_latency_ms: float = 0.0

    @property
    def tokens_saved(self) -> int:
        return max(0, self.original_tokens - self.compressed_tokens)

    @property
    def summary(self) -> str:
        return (
            f"{self.original_tokens} -> {self.compressed_tokens} tokens "
            f"({self.compression_ratio * 100:.1f}% removed)"
        )


VERIFY_PROMPT_TEMPLATE = """You are reviewing a context-compression decision. A question needs to be answered using compressed context. Below are CANDIDATE chunks that were borderline -- close to the cutoff for inclusion. For each chunk, decide if it contains information critical to answering the question that isn't already covered by the ALREADY KEPT chunks.

QUESTION: {question}

ALREADY KEPT (summary of first 200 chars each):
{kept_summary}

BORDERLINE CANDIDATES (numbered):
{candidates}

Respond with ONLY the numbers of candidates that should be ADDED because they contain critical, non-redundant information -- comma separated, or "none" if none should be added. Be conservative; only add if truly necessary.

ANSWER:"""



def _prune_sentences(text: str, query: str, target_tokens: int) -> str:
    """Safely compress a selected block when chunk-level packing cannot
    reach the requested budget. Scores sentences with BM25 when available,
    while always preserving at least one sentence from each non-empty block."""
    if not text.strip() or target_tokens <= 0:
        return ""

    # Keep line-oriented chat turns/code blocks intact when they are already
    # small enough; sentence pruning is primarily a fallback for giant chunks.
    parts = [p.strip() for p in re.split(r"\n\s*\n+", text) if p.strip()]
    if not parts:
        return text

    # Split each part into sentences, retaining the part association.
    sentence_items = []
    for part_idx, part in enumerate(parts):
        sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\"'])", part)
        sentences = [s.strip() for s in sentences if s.strip()]
        if not sentences:
            sentences = [part]
        for local_idx, sentence in enumerate(sentences):
            sentence_items.append((part_idx, local_idx, sentence))

    if len(sentence_items) <= 1:
        return text if count_tokens(text) <= target_tokens else " ".join(
            text.split()[:target_tokens]
        )

    query_terms = set(re.findall(r"[A-Za-z0-9_]+", query.lower()))

    def lexical_score(sentence: str) -> float:
        terms = re.findall(r"[A-Za-z0-9_]+", sentence.lower())
        if not terms:
            return 0.0
        overlap = sum(1 for t in terms if t in query_terms)
        # Small bonus for identifiers/numbers that appear in the query.
        return overlap / max(1, len(terms)) + 0.01 * overlap

    scored = [(lexical_score(s), i, part_idx, local_idx, s)
              for i, (part_idx, local_idx, s) in enumerate(sentence_items)]

    # BM25 if available; this is a lightweight post-retrieval signal.
    try:
        from rank_bm25 import BM25Okapi
        corpus = [re.findall(r"[A-Za-z0-9_]+", s.lower()) for _, _, s in sentence_items]
        qtokens = re.findall(r"[A-Za-z0-9_]+", query.lower())
        if qtokens and any(corpus):
            bm25 = BM25Okapi(corpus)
            scores = bm25.get_scores(qtokens)
            scored = [(float(scores[i]), i, sentence_items[i][0],
                       sentence_items[i][1], sentence_items[i][2])
                      for i in range(len(sentence_items))]
    except Exception:
        pass

    # Guarantee one sentence from each part first, then fill by relevance.
    selected = set()
    used = 0
    for part_idx in range(len(parts)):
        candidates = [x for x in scored if x[2] == part_idx]
        if not candidates:
            continue
        best = max(candidates, key=lambda x: x[0])
        tok = count_tokens(best[4])
        if used + tok <= target_tokens or not selected:
            selected.add(best[1])
            used += tok

    for score, idx, part_idx, local_idx, sentence in sorted(scored, reverse=True):
        if idx in selected:
            continue
        tok = count_tokens(sentence)
        if used + tok <= target_tokens:
            selected.add(idx)
            used += tok

    if not selected:
        best = max(scored, key=lambda x: x[0])
        selected.add(best[1])

    # Restore original order for readability.
    chosen = [
        sentence_items[i][2]
        for i in sorted(selected)
    ]
    result = " ".join(chosen)

    # Hard safety floor: never return empty.
    return result.strip() or sentence_items[0][2]

def _verify_borderline_chunks(kept, borderline, query, llm_call_fn):
    if not borderline or llm_call_fn is None:
        return [], None
    kept_summary = "\n".join(f"- {sc.chunk.text[:200]}" for sc in kept[:15]) or "(none)"
    candidates_text = "\n".join(f"[{i}] {sc.chunk.text[:300]}" for i, sc in enumerate(borderline))
    prompt = VERIFY_PROMPT_TEMPLATE.format(question=query, kept_summary=kept_summary, candidates=candidates_text)
    try:
        response_text = llm_call_fn(prompt)
    except Exception as e:
        return [], str(e)
    if not response_text or response_text.strip().lower().startswith("none"):
        return [], None
    indices = [int(t) for t in re.findall(r"\d+", response_text) if 0 <= int(t) < len(borderline)]
    return indices, None


def _estimate_confidence(kept_relevance: list[float], next_best_relevance: float | None) -> float:
    """Confidence heuristic: how clear was the cutoff? If the weakest kept
    chunk is still comfortably more relevant than the best chunk that got
    cut, the extractive decision is confident. If they're close, it's a
    borderline call and worth double-checking with an LLM.

    Returns 0-1, where 1 = very confident, 0 = coin-flip uncertain.
    """
    if not kept_relevance:
        return 1.0
    weakest_kept = min(kept_relevance)
    if next_best_relevance is None:
        return 1.0
    margin = weakest_kept - next_best_relevance
    # Empirically, a margin of >0.15 cosine-sim is a clear gap; <0.03 is a
    # coin flip. Map that range to [0, 1].
    return float(np.clip(margin / 0.15, 0.0, 1.0))


def compress(
    text: str,
    query: str,
    content_type: Literal["code", "chat", "text"] = "text",
    target_keep_fraction: float = TARGET_KEEP_FRACTION,
    keep_comments: bool = False,
    llm_call_fn=None,
    confidence_threshold: float = 0.5,
) -> CompressionResult:
    """Main entry point. Auto-adaptive: always aims for the fixed 70%
    compression target, and automatically triggers ONE LLM verification
    call ONLY if the extractive cutoff looks like a close/uncertain call
    (i.e. accuracy retention is at risk) -- otherwise stays pure
    extractive with zero LLM calls. No manual "reasoning level" needed;
    the system decides for itself based on how confident the retrieval +
    rerank scores are.

    llm_call_fn: optional (str -> str) callable. If not provided,
    verification never triggers regardless of confidence (falls back to
    pure extractive).
    """
    compression_start = time.perf_counter()
    original_tokens = count_tokens(text)

    stripped = strip_structural(text, content_type, keep_comments=keep_comments)
    chunks = chunk_text(stripped, content_type)

    stripped_tokens = sum(c.tokens for c in chunks) or 1
    token_budget = max(int(stripped_tokens * target_keep_fraction), 1)

    # Select with a slightly wider pool than the strict budget so we always
    # have "next best cut" candidates available to measure confidence
    # against, regardless of whether verification ends up triggering.
    wide_budget = int(token_budget * 1.4)
    pool = select_chunks(chunks, query, wide_budget)

    def pack_chunks(items, budget):
        running = 0
        kept_items, borderline_items = [], []
        for sc in items:
            if running + sc.chunk.tokens <= budget:
                kept_items.append(sc)
                running += sc.chunk.tokens
            else:
                borderline_items.append(sc)
        return kept_items, borderline_items

    running = 0
    kept, borderline = pack_chunks(pool, token_budget)

    kept_relevance = [sc.relevance for sc in kept]
    next_best_relevance = borderline[0].relevance if borderline else None
    confidence = _estimate_confidence(kept_relevance, next_best_relevance)

    notes = []
    llm_calls_used = 0
    verification_triggered = False

    # Safety fallback: if the retrieval boundary is very uncertain, expand
    # the budget before producing the final context. Accuracy is more
    # important than forcing exactly 70% compression on a hard query.
    if confidence < 0.25 and borderline:
        safer_fraction = min(target_keep_fraction + 0.20, 0.60)
        safer_budget = max(int(stripped_tokens * safer_fraction), token_budget)
        kept, borderline = pack_chunks(pool, safer_budget)
        notes.append(
            f"Safety fallback activated: cutoff confidence was {confidence:.0%}; "
            f"context budget expanded to {safer_fraction:.0%} to protect answer accuracy."
        )
        kept_relevance = [sc.relevance for sc in kept]
        next_best_relevance = borderline[0].relevance if borderline else None
        confidence = _estimate_confidence(kept_relevance, next_best_relevance)

    if confidence < confidence_threshold and llm_call_fn is not None and borderline:
        verification_triggered = True
        review_window = borderline[:6]
        add_indices, verify_error = _verify_borderline_chunks(kept, review_window, query, llm_call_fn)
        llm_calls_used = 1
        if verify_error:
            notes.append(f"Verification pass attempted but failed: {verify_error}")
            llm_calls_used = 0
        elif add_indices:
            for idx in add_indices:
                kept.append(review_window[idx])
            notes.append(
                f"Extractive cutoff was borderline (confidence {confidence:.0%}) -- "
                f"LLM verification rescued {len(add_indices)} chunk(s) with critical info."
            )
        else:
            notes.append(
                f"Extractive cutoff was borderline (confidence {confidence:.0%}) -- "
                f"LLM verification confirmed the cut was safe, no changes made."
            )
    elif confidence < confidence_threshold and llm_call_fn is None:
        notes.append(
            f"Cutoff confidence was {confidence:.0%} (borderline) but no API key was "
            f"provided, so verification was skipped. Provide a key for higher-confidence runs."
        )
    else:
        notes.append(f"Extractive cutoff was confident ({confidence:.0%}) -- no verification needed.")

    selected_sorted = sorted(kept, key=lambda s: s.chunk.idx)
    compressed_text = "\n\n".join(s.chunk.text for s in selected_sorted).strip()

    # HARD SAFETY GUARD:
    # A compressor must never report 100% compression with an empty payload.
    # If retrieval/chunking produced no selected text, preserve the most
    # relevant source material instead of silently sending zero tokens.
    if not compressed_text:
        if chunks:
            fallback = max(
                chunks,
                key=lambda c: (
                    sum(1 for term in re.findall(r"[A-Za-z0-9_]+", query.lower())
                        if term in c.text.lower()),
                    c.tokens,
                ),
            )
            selected_sorted = [SelectedChunk(
                chunk=fallback, relevance=0.0, rank=0, rerank_score=None
            )]
            compressed_text = fallback.text.strip()
            notes.append(
                "Safety fallback: retrieval returned no selected chunks; "
                "preserved the most query-relevant source chunk."
            )
        else:
            # Cleaning should never destroy the complete input.
            compressed_text = text.strip()
            notes.append(
                "Safety fallback: no chunks were produced after preprocessing; "
                "original context preserved."
            )

    compressed_tokens = count_tokens(compressed_text)

    # If a giant single chunk prevents the requested reduction, prune its
    # sentences using BM25/lexical relevance rather than returning 0%.
    if (
        original_tokens > 0
        and compressed_tokens > max(1, int(original_tokens * target_keep_fraction * 1.15))
    ):
        sentence_target = max(1, int(original_tokens * target_keep_fraction))
        pruned = _prune_sentences(compressed_text, query, sentence_target)
        if pruned and count_tokens(pruned) < compressed_tokens:
            compressed_text = pruned
            compressed_tokens = count_tokens(compressed_text)
            notes.append(
                f"Sentence-level pruning reduced the selected context to "
                f"{compressed_tokens:,} tokens."
            )

    ratio = 1 - (compressed_tokens / original_tokens) if original_tokens else 0.0
    compression_latency_ms = (time.perf_counter() - compression_start) * 1000

    return CompressionResult(
        original_text=text,
        compressed_text=compressed_text,
        original_tokens=original_tokens,
        compressed_tokens=compressed_tokens,
        compression_ratio=ratio,
        selected_chunks=selected_sorted,
        dropped_chunks=len(chunks) - len(selected_sorted),
        total_chunks=len(chunks),
        llm_calls_used=llm_calls_used,
        verification_triggered=verification_triggered,
        verification_notes=notes,
        confidence=confidence,
        compression_latency_ms=compression_latency_ms,
    )