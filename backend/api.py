"""FastAPI adapter for the existing website.

Run: uv run uvicorn api:app --host 0.0.0.0 --port 8000

The frontend can call POST /v1/compress and POST /v1/evaluate instead of the
old n8n workflow.  The compression engine itself remains pure Python.
"""
from __future__ import annotations
import os
from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from engine import compress, TARGET_KEEP_FRACTION
from metrics import run_evaluation
from llm_clients import DEFAULT_MODELS, make_simple_call_fn

app = FastAPI(title="Smart Context Compression API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompressRequest(BaseModel):
    context: str = Field(min_length=1)
    query: str = Field(min_length=1)
    content_type: str = "text"
    provider: str = "nvidia"
    model: str | None = None
    api_key: str | None = None

class EvaluateRequest(CompressRequest):
    judge_provider: str | None = None
    judge_model: str | None = None
    judge_api_key: str | None = None


def _result(r):
    return {
        "original_tokens": r.original_tokens,
        "compressed_tokens": r.compressed_tokens,
        "tokens_saved": r.tokens_saved,
        "compression_ratio": r.compression_ratio,
        "compression_percent": r.compression_ratio * 100,
        "total_chunks": r.total_chunks,
        "chunks_kept": len(r.selected_chunks),
        "confidence": r.confidence,
        "verification_triggered": r.verification_triggered,
        "llm_calls_used": r.llm_calls_used,
        "verification_notes": r.verification_notes,
        "compression_latency_ms": r.compression_latency_ms,
        "compressed_context": r.compressed_text,
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "smart-context-compression", "default_model": DEFAULT_MODELS["nvidia"]}

@app.post("/v1/compress")
def compress_endpoint(req: CompressRequest):
    if req.content_type not in {"code", "chat", "text"}:
        raise HTTPException(400, "content_type must be code, chat, or text")
    effective_api_key = req.api_key or os.getenv({
        "nvidia": "NVIDIA_API_KEY",
        "groq": "GROQ_API_KEY",
        "gemini": "GEMINI_API_KEY",
    }.get(req.provider.lower(), ""), None)
    llm_fn = make_simple_call_fn(req.provider, effective_api_key, req.model) if effective_api_key else None
    result = compress(req.context, req.query, req.content_type, TARGET_KEEP_FRACTION, llm_call_fn=llm_fn)
    return _result(result)

@app.post("/v1/evaluate")
def evaluate_endpoint(req: EvaluateRequest):
    if req.content_type not in {"code", "chat", "text"}:
        raise HTTPException(400, "content_type must be code, chat, or text")
    effective_api_key = req.api_key or os.getenv({
        "nvidia": "NVIDIA_API_KEY",
        "groq": "GROQ_API_KEY",
        "gemini": "GEMINI_API_KEY",
    }.get(req.provider.lower(), ""), None)
    llm_fn = make_simple_call_fn(req.provider, effective_api_key, req.model) if effective_api_key else None
    result = compress(req.context, req.query, req.content_type, TARGET_KEEP_FRACTION, llm_call_fn=llm_fn)
    evaluation = run_evaluation(
        result, req.query, provider=req.provider, judge_provider=req.judge_provider,
        api_key=effective_api_key, judge_api_key=req.judge_api_key or effective_api_key,
        model=req.model, judge_model=req.judge_model,
    )
    data = _result(result)
    data.update({
        "provider": req.provider,
        "model": req.model or DEFAULT_MODELS.get(req.provider),
        "accuracy_retention": evaluation.retention_score,
        "cost_reduction_percent": evaluation.cost_reduction_pct,
        "latency_speedup_percent": evaluation.latency_speedup_pct,
        "ttft_drop_ms": evaluation.ttft_drop_ms,
        "full_answer": evaluation.answer_full.text,
        "compressed_answer": evaluation.answer_compressed.text,
        "full_latency_ms": evaluation.answer_full.latency_seconds * 1000,
        "compressed_latency_ms": evaluation.answer_compressed.latency_seconds * 1000,
        "full_ttft_ms": (evaluation.answer_full.ttft_seconds or 0) * 1000,
        "compressed_ttft_ms": (evaluation.answer_compressed.ttft_seconds or 0) * 1000,
        "judge_error": evaluation.judge_error,
    })
    return data