# Smart Context Compression Engine

## What this project solves

**Application Data Search → Smart Context Compression**

The system reduces the amount of retrieved text sent to an LLM. Instead of passing whole retrieved paragraphs, it performs post-retrieval optimization and sends only high-information semantic evidence.

Target: **≥70% context/token reduction** while measuring **accuracy retention** and **TTFT/latency impact**.

## Recommended LLMs (August 2026)

### Primary: NVIDIA Nemotron 3 Super 120B A12B

Model: `nvidia/nemotron-3-super-120b-a12b`

Why it fits this project:
- strong reasoning and coding capability
- long-context model
- NVIDIA currently exposes a free hosted endpoint
- OpenAI-compatible API, so integration is simple
- useful as the verification/evaluation model, not as the compressor itself

### Fast alternative: Groq GPT-OSS 120B

Model: `openai/gpt-oss-120b`

Use this when the demo emphasizes latency. Groq reports ~500 tokens/s for this model and supports structured outputs. It is also a good replacement for the retired Llama 3.3 70B endpoint.

**Important:** free endpoints and rate limits can change. The code keeps providers swappable through `llm_clients.py`.

## Architecture

```text
Existing Website
      │
      │ HTTP JSON
      ▼
┌───────────────────────────────┐
│ FastAPI Python Adapter        │  api.py
│ /v1/compress  /v1/evaluate    │
└───────────────┬───────────────┘
                │
                ▼
┌──────────────────────────────────────────────────┐
│ SMART CONTEXT COMPRESSION ENGINE                  │
│                                                  │
│  1. Structural cleanup                           │
│       ↓                                          │
│  2. Content-aware chunking                       │
│       ↓                                          │
│  3. FAISS dense retrieval ─────┐                │
│       ↓                         │                │
│  4. BM25 lexical scoring ──────┤ hybrid recall  │
│       ↓                         │                │
│  5. MMR diversification         │                │
│       ↓                                          │
│  6. Cross-encoder reranking                     │
│       ↓                                          │
│  7. Token-budget packing                        │
│       ↓                                          │
│  8. Sentence-level semantic pruning             │
│       ↓                                          │
│  9. Adaptive verification (only if uncertain)  │
└───────────────────────┬──────────────────────────┘
                        │
                        ▼
             Compressed Context
                        │
                        ▼
             LLM / existing website

Metrics:
compression % | tokens saved | TTFT drop | latency | cost | accuracy retention
```

## Why this is stronger than the original workflow

The original code already had FAISS + MMR + cross-encoder + budget packing. The updated version adds the pieces that map more directly to the problem statement:

1. **BM25 hybrid scoring** — exact terms supplement dense semantic retrieval.
2. **Sentence-level pruning** — prose/chat chunks are compressed internally, not only dropped as whole paragraphs.
3. **Real TTFT measurement** — streamed NVIDIA/Groq calls record time-to-first-token.
4. **NVIDIA provider** — Nemotron 3 Super 120B is supported through the OpenAI-compatible NVIDIA endpoint.
5. **Groq provider update** — default Groq model is now GPT-OSS 120B instead of the retired Llama 3.3 70B model.
6. **FastAPI adapter** — the existing website can replace the n8n workflow without rebuilding its frontend.
7. **Judge dashboard** — token savings, compression ratio, TTFT, latency, cost and accuracy retention are visible.
8. **Safer Python chunking** — class methods stay inside their parent class instead of being split into unrelated chunks.

## Files

```text
smart-context-compression/
├── app.py                 # Streamlit judge/demo dashboard
├── api.py                 # FastAPI adapter for your existing website
├── engine.py              # Core compression algorithm
├── llm_clients.py         # NVIDIA / Groq / Gemini adapters + TTFT streaming
├── metrics.py             # Full vs compressed evaluation
├── sample_data.py         # Demo code + customer-support datasets
├── pyproject.toml         # uv dependencies
├── uv.lock                # Regenerate with `uv lock` on your machine
├── .python-version        # Python version used by the original project
├── .env.example           # API-key template
├── .gitignore
└── README.md
```

The uploaded `.venv` is intentionally **not included**. It is machine-specific, huge, and should never be committed or moved between Windows machines.

## Setup with uv

```powershell
uv sync
```

Create `.env` from `.env.example` or set environment variables in PowerShell:

```powershell
$env:NVIDIA_API_KEY="your-key"
$env:GROQ_API_KEY="your-key"
```

For a local demo:

```powershell
uv run streamlit run app.py
```

For the website backend:

```powershell
uv run uvicorn api:app --host 0.0.0.0 --port 8000
```

Health check:

```text
GET http://localhost:8000/health
```

## Existing website → Python replacement for n8n

Your frontend only needs to send JSON to the Python backend.

### Compression request

`POST /v1/compress`

```json
{
  "context": "retrieved text from your vector DB...",
  "query": "What happened to order 91045?",
  "content_type": "chat",
  "provider": "nvidia"
}
```

The response contains:

```text
compressed_context
original_tokens
compressed_tokens
tokens_saved
compression_percent
confidence
verification_triggered
compression_latency_ms
```

Your website can then pass **only `compressed_context`** to its final answer model.

### Full evaluation

`POST /v1/evaluate`

This is for demos/testing, not every production request. It runs:

```text
FULL context → LLM answer ┐
                          ├→ judge → accuracy retention
COMPRESSED context → answer┘
```

It also returns TTFT and latency for both paths.

## Important architecture decision

Do **not** use the 120B LLM to perform the compression itself.

That would defeat the purpose of the project because the compressor would add another expensive/slow LLM step before the final LLM.

Instead:

```text
Vector DB retrieval
       ↓
Local Python compression
       ↓
70%+ fewer tokens
       ↓
Final LLM
```

The LLM is only a **safety verifier** when the local compressor is uncertain, and an optional **evaluation judge** during benchmarking.

## What to show judges

Use one long support conversation and ask a question whose answer is buried in the middle.

Show this sequence:

1. Original context: e.g. 2,000 tokens
2. Retrieved chunks: broad recall
3. BM25 + FAISS + MMR + cross-encoder
4. Sentence pruning
5. Compressed context: e.g. ~500–600 tokens
6. **70–75% token reduction**
7. Same answer from full vs compressed context
8. Accuracy retention ≥95%
9. TTFT/latency comparison
10. Cost reduction

Do not claim a fixed percentage before running the benchmark. The actual percentage depends on the input and query.

## Production/hackathon extras worth adding later

- Persist compression metrics in SQLite/PostgreSQL for a run history.
- Add a `/v1/batch-evaluate` endpoint for 20–100 benchmark questions.
- Add a fixed benchmark set with known answers so the accuracy number is not based only on one example.
- Add a latency chart over 10 repeated calls rather than a single call.
- Add a fallback chain: NVIDIA → Groq → Gemini.
- Add caching keyed by `hash(context + query + model)` so repeated questions do not recompute compression.
- Add request IDs so the frontend can trace each compression run.
- Add a token counter using the exact tokenizer of the final LLM when you need production-grade token accounting; the current counter is deliberately provider-independent and approximate.
