# Context Compression Engine — Architecture & Results

Last updated: 2026-08-02

## Summary

| Metric | Requirement | Current |
|---|---|---|
| Compression ratio | ≥ 70% | **73.88%**, safely above floor, verified stable across runs |
| Reasoning retention | ≥ 95% | **45%** — real content coverage improved this session, but the LLM-judge score barely moved (see note below) |
| Empty-response reliability bug | — | Fixed |

The pipeline runs in n8n ("Context Compression Engine" workflow, webhook-triggered), calls Groq for LLM steps, and writes results to Supabase (`compressions` table), which the frontend dashboard reads.

---

## Workflow (n8n editor)

```
Webhook (POST /compress)
  → Chunk Text                 [algorithmic]
  → Strip Boilerplate          [algorithmic]
  → Algorithmic Compress       [algorithmic]  ← the actual "token pre-processor" the brief asks for
  → Summarize Chunks           [Groq, llama-3.1-8b-instant]  — optional refinement, never load-bearing
  → Recover Original Text      [algorithmic — picks the shorter of Groq output vs algorithmic floor]
  → Start Timer
  → Combine and Measure        [algorithmic — computes final ratio/cost/status]
  → Evaluate Retention         [Groq, llama-3.1-8b-instant]  — LLM-as-judge scoring
  → Parse Retention Score      [algorithmic]
  → Save Result                [Supabase insert]
  → Respond to Webhook
```

Each box's "algorithmic" vs "Groq" tag matters: only two nodes call an LLM. Everything that guarantees the compression ratio is deterministic code with zero API dependency.

---

## How the 70%+ compression ratio is achieved

### 1. Chunk Text — deterministic pre-processing + chunking
Before anything else, the raw input goes through zero-information-loss stripping:
- **Divider removal**: lines made entirely of `-`, `=`, `*`, `_` (pure decoration) are deleted outright.
- **Filler-line removal**: stock conversational phrases ("Thanks everyone.", "Sounds good.", etc.) are regex-matched and dropped.
- **List compaction**: runs of ≥3 short, unpunctuated lines (e.g. a vertical "Name / Role" list) are joined into one comma-separated line — same facts, far fewer newline/formatting tokens.

The **true original token count is captured here, before any stripping**, and carried through the whole pipeline untouched. This matters: an earlier version of this pipeline accidentally measured "original" against an already-partially-compressed reconstruction, which silently under-reported the real compression ratio being achieved. Fixed by threading `original_text` / `original_token_count` from this node all the way to the final Supabase row.

Text is then split into ~500-character chunks (paragraph-aware where possible, falling back to the last whitespace boundary rather than a hard mid-word cut).

### 2. Strip Boilerplate — two-pass redundancy removal
- **Pass 1**: near-literal sentence dedup (catches repeated sentences that differ only by filler-phrase prefixes or punctuation).
- **Pass 2**: **semantic near-duplicate clustering** — sentences are reduced to a content-word signature (stopwords removed, numbers/units normalized so "two milliseconds" and "2 ms" match), and any sentence whose signature has ≥32% Jaccard overlap with an already-kept sentence is dropped. This catches *paraphrased* duplicates (e.g. three different phrasings of the same latency fact), not just verbatim repeats.

### 3. Algorithmic Compress — the core deterministic compressor
This is the node that actually guarantees the ratio, independent of any LLM. For each chunk:
1. Split into sentence/clause-level fragments (on `.`, `!`, `?`, and `;` — the semicolon split matters for isolating short code statements from surrounding prose).
2. **Score each fragment** for information density:
   - `+2` per token containing a digit (numbers, IDs, dates)
   - `+1.5` per capitalized word (proper nouns, acronyms)
   - `+1` per uncommon word (>6 chars, not a stopword)
   - `+3` bonus for code-like syntax (`{`, `;`, `struct`, `function`, etc.) — favored, but never unconditionally exempt from the budget (an earlier version exempted entire *paragraphs* containing any code token, which on real unstructured input — no blank-line paragraph breaks — let a single stray brace drag 400+ characters of unrelated prose through completely uncompressed)
   - score is normalized by `√(word count)` so long fragments don't win purely on length
3. **Knapsack-style greedy fill**: fragments are taken highest-score-first, skipping any that would overshoot the token budget and continuing to scan for smaller ones that still fit, until the budget is used up. (An earlier "add-then-check" version systematically overshot the budget by up to one fragment's size per chunk — fixed.)

This node alone, with zero Groq calls, reliably produces the required ≥70% reduction — verified by disabling both Groq calls entirely (rate-limit outage) and confirming the ratio held at 71.15% unchanged across repeated identical runs.

### 4. Summarize Chunks (Groq, optional) — refinement only
Runs *on top of* the already-compressed text asking the model to tighten further without dropping facts. Critically: **"Recover Original Text" only accepts Groq's output if it is actually as short or shorter than the algorithmic floor.** If Groq fails, times out, or (non-deterministically) returns something longer, the algorithmic result is used instead. This is what makes the ratio deterministic even though an LLM is in the loop — the LLM can only ever help, never regress the guarantee.

### Result
On the real ~1390-token test document: **1390 → 347 tokens = 75.04% reduction**, reproducible across repeated runs (previously: 20–62%, different every time, because the compression mechanism *was* the LLM call).

---

## How the 44% retention score is measured, and why it's currently far from 95%

### Measurement methodology
"Evaluate Retention" sends both the original and compressed text to Groq (`llama-3.1-8b-instant`) as an LLM-as-judge:
> *"On a scale of 0 to 100, how much of the essential facts, numbers, names, and reasoning-relevant information from the Original is preserved in the Compressed version?"*

This is a coarse, holistic judgment call by the model, not a deterministic metric — some run-to-run variance is expected from this alone.

### Root cause of the gap (diagnosed, not yet fully fixed)
Cross-referencing the compressed output against the test document's own embedded question list ("What caused the incident on 2026-07-19?", "Which engineer proposed kernel bypass networking?", etc.), roughly 7 of 10 questions were unanswerable from the compressed text. The pattern: extractive, density-based sentence scoring is good at keeping *individually* fact-dense sentences (a "TEAM: Alice, Bob, Charlie..." list scores very high) but has no notion of *which facts a downstream question will need* — a plain sentence like "Root cause: Redis cache eviction" or "Purpose: Mercury is a low-latency order management system" scores unremarkably and can lose the budget competition to a denser but less individually critical sentence, especially since budget is allocated **per 500-character chunk**, not globally across the document — a fact's survival currently depends partly on which arbitrary chunk it happened to land in and what it's competing against locally within just that chunk.

Confirmed contributing factor: with Groq's refinement working, retention measured 85–90; with Groq calls blocked (quota exhaustion, algorithmic-only output), it dropped to 35. The LLM refinement pass is currently doing more of the retention-quality work than the algorithm — the algorithm is a reliable *floor* for the ratio, not yet a reliable mechanism for retention.

### Changes made this session (in order tried)
1. **Sentence-safe chunk breaks**: Chunk Text now prefers breaking oversized paragraphs at the last sentence-ending punctuation within budget, before falling back to newline/whitespace. Previously a 500-char hard boundary could split mid-sentence, orphaning fragments (e.g. the ROADMAP line was being truncated mid-word).
2. **Colon-label score boost**: fragments containing a colon (`Purpose:`, `Root cause:`, `Issue:`, `Fix:`) get a scoring bonus, since these are reliably the fact-bearing sentences in structured documents like this one and were being out-competed by fact-dense-but-less-critical content (e.g. name lists).
3. **Digit-split fix**: the fragment splitter no longer breaks right after a bare list number ("1.", "2."), which was previously scoring deceptively well (digit bonus, cheap token cost) and crowding out the actual question text that followed it.
4. **Budget slack — tried and reverted**: loosening the per-chunk budget by 20% to free room for more facts was tested live and pushed a real run to 69.57%, under the 70% floor. Reverted — the ratio requirement is a hard constraint and isn't worth risking for retention gains.

Net effect verified in Supabase: retention moved 44 → 45 despite items 1–3 objectively adding several previously-missing facts back into the output (confirmed by manual inspection — the latency target, full technology list, and complete roadmap line are now present where they were absent before). This mismatch between "the output is measurably more complete" and "the score barely changed" points at a second, distinct problem:

### The retention *measurement* itself may be the bigger issue
"Evaluate Retention" is a single holistic 0–100 guess by `llama-3.1-8b-instant` in one shot, with no rubric, no per-fact checklist, and no explanation. That's inherently noisy — it may not have the resolution to reliably detect a "3 more facts present" improvement, and a same-input rerun could plausibly swing several points on judge variance alone. Before sinking more effort into the compression algorithm, it may be worth first validating whether the eval methodology itself can reliably distinguish "good" from "bad" compressed output — e.g. by having the judge extract a checklist of key facts from the original first, then score the compressed text against that checklist (recall-style), rather than asking for a single subjective percentage.

### Longer-term architectural lever (not yet attempted)
Budget is currently allocated **per 500-character chunk**, independently. A fact's survival depends partly on which arbitrary chunk it happened to land in and what it's competing against *locally* within just that chunk — e.g. MEETING NOTES entries (who proposed what) are still being dropped because they share a chunk with other high-scoring content. Moving to a globally-optimized selection across the whole document (one combined scoring/budget pass instead of N independent per-chunk passes) would let genuinely important content win regardless of chunk boundaries. This is a bigger structural change than anything attempted this session and would need dedicated testing budget to do safely.

---

## Operational note: Groq rate limits

Both Groq nodes were originally on `llama-3.3-70b-versatile`, which hit its **100,000 tokens/day** quota from testing volume and is now exhausted for the rest of the day. Both nodes were moved to `llama-3.1-8b-instant` (separate quota bucket) to keep testing possible. Running many rapid test requests back-to-back can still hit that model's **6,000 tokens/minute** limit — space out test runs by a few seconds when testing multiple times in a row.
