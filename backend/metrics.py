"""
Runs the A/B comparison (full context vs compressed context) through an
LLM and computes the 4 metrics the hackathon judges on:

  1. Compression ratio    -- from engine.CompressionResult directly
  2. Cost reduction       -- token delta x $/token
  3. Reasoning retention  -- LLM-as-judge similarity score (0-100) between
                              the two answers, plus side-by-side display
  4. Inference latency    -- wall-clock time of each API call
"""

from __future__ import annotations

import re
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

from engine import CompressionResult, compress as engine_compress
from llm_clients import LLMResponse, call_llm, make_simple_call_fn

# Rough public per-1M-token pricing for cost-reduction illustration.
# (Approximate, for demo purposes only -- not live pricing.)
PRICE_PER_1M_INPUT_TOKENS = {
    "groq": 0.59,    # llama-3.3-70b-versatile ballpark
    "gemini": 0.10,  # gemini-2.0-flash ballpark
}

QA_PROMPT_TEMPLATE = """You are given a context and a question. Answer the question using ONLY the given context. Be concise (2-4 sentences).

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:"""

JUDGE_PROMPT_TEMPLATE = """You are an evaluation judge. Compare ANSWER_A (from full context) and ANSWER_B (from compressed context) for the same question. Score how semantically similar and equally correct ANSWER_B is compared to ANSWER_A, on a 0-100 scale, where 100 = fully equivalent in meaning and correctness, 0 = completely different or wrong.

Respond with ONLY a single integer 0-100, nothing else.

QUESTION:
{question}

ANSWER_A (reference, from full context):
{answer_a}

ANSWER_B (to evaluate, from compressed context):
{answer_b}

SCORE:"""


@dataclass
class EvalResult:
    compression: CompressionResult
    answer_full: LLMResponse
    answer_compressed: LLMResponse
    retention_score: float | None
    judge_error: str | None
    cost_full_usd: float
    cost_compressed_usd: float
    cost_reduction_pct: float
    latency_reduction_pct: float
    ttft_drop_ms: float | None

    @property
    def meets_compression_target(self) -> bool:
        return self.compression.compression_ratio >= 0.70

    @property
    def meets_accuracy_target(self) -> bool:
        return self.retention_score is not None and self.retention_score >= 95

    @property
    def meets_both_targets(self) -> bool:
        return self.meets_compression_target and self.meets_accuracy_target


def _extract_score(text: str) -> float | None:
    match = re.search(r"\d+(\.\d+)?", text)
    if not match:
        return None
    val = float(match.group())
    return max(0.0, min(100.0, val))


def estimate_cost(tokens: int, provider: str) -> float:
    price = PRICE_PER_1M_INPUT_TOKENS.get(provider, 0.5)
    return (tokens / 1_000_000) * price


def compress_adaptive(
    text: str,
    query: str,
    content_type: str = "text",
    target_keep_fraction: float = 0.30,
    provider: str = "groq",
    api_key: str | None = None,
    model: str | None = None,
) -> CompressionResult:
    """Wraps engine.compress(). If an API key is available, the engine can
    auto-trigger ONE LLM verification call when its own confidence signal
    says the extractive cutoff was a close/borderline call -- otherwise it
    stays pure extractive with zero LLM calls. No manual level to choose;
    the system decides for itself."""
    llm_call_fn = make_simple_call_fn(provider, api_key, model=model) if api_key else None

    return engine_compress(
        text, query,
        content_type=content_type,
        target_keep_fraction=target_keep_fraction,
        llm_call_fn=llm_call_fn,
    )


def run_evaluation(
    compression: CompressionResult,
    question: str,
    provider: str = "groq",
    judge_provider: str | None = None,
    api_key: str | None = None,
    judge_api_key: str | None = None,
    model: str | None = None,
) -> EvalResult:
    judge_provider = judge_provider or provider

    prompt_full = QA_PROMPT_TEMPLATE.format(context=compression.original_text, question=question)
    prompt_compressed = QA_PROMPT_TEMPLATE.format(context=compression.compressed_text, question=question)

    # Run both Q&A calls concurrently -- they're independent, so this
    # roughly halves the wall-clock time of this step vs sequential calls.
    with ThreadPoolExecutor(max_workers=2) as pool:
        future_full = pool.submit(call_llm, provider, prompt_full, api_key, model)
        future_compressed = pool.submit(call_llm, provider, prompt_compressed, api_key, model)
        answer_full = future_full.result()
        answer_compressed = future_compressed.result()

    retention_score = None
    judge_error = None
    if not answer_full.error and not answer_compressed.error:
        judge_prompt = JUDGE_PROMPT_TEMPLATE.format(
            question=question,
            answer_a=answer_full.text,
            answer_b=answer_compressed.text,
        )
        judge_resp = call_llm(judge_provider, judge_prompt, api_key=judge_api_key or api_key, model=model)
        if judge_resp.error:
            judge_error = judge_resp.error
        else:
            retention_score = _extract_score(judge_resp.text)
    else:
        judge_error = answer_full.error or answer_compressed.error

    cost_full = estimate_cost(compression.original_tokens, provider)
    cost_compressed = estimate_cost(compression.compressed_tokens, provider)
    cost_reduction_pct = (1 - cost_compressed / cost_full) * 100 if cost_full else 0.0

    if answer_full.latency_seconds and answer_full.latency_seconds > 0:
        latency_reduction_pct = (
            (answer_full.latency_seconds - answer_compressed.latency_seconds)
            / answer_full.latency_seconds
        ) * 100
    else:
        latency_reduction_pct = 0.0

    if answer_full.ttft_seconds is not None and answer_compressed.ttft_seconds is not None:
        ttft_drop_ms = (answer_full.ttft_seconds - answer_compressed.ttft_seconds) * 1000
    else:
        ttft_drop_ms = None

    return EvalResult(
        compression=compression,
        answer_full=answer_full,
        answer_compressed=answer_compressed,
        retention_score=retention_score,
        judge_error=judge_error,
        cost_full_usd=cost_full,
        cost_compressed_usd=cost_compressed,
        cost_reduction_pct=cost_reduction_pct,
        latency_reduction_pct=latency_reduction_pct,
        ttft_drop_ms=ttft_drop_ms,
    )