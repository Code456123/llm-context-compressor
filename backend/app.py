"""Streamlit judge/demo dashboard for Smart Context Compression."""
from __future__ import annotations
import os
from dotenv import load_dotenv
import streamlit as st

load_dotenv()
import plotly.graph_objects as go
from engine import TARGET_COMPRESSION_FRACTION, TARGET_ACCURACY_PCT, get_embedder_backend_name, get_reranker_backend_name
from llm_clients import DEFAULT_MODELS
from metrics import compress_adaptive, run_evaluation
from sample_data import SAMPLE_CODE, SAMPLE_CODE_QUESTION, SAMPLE_CHAT, SAMPLE_CHAT_QUESTION

st.set_page_config(page_title="Smart Context Compression", page_icon="⚡", layout="wide")

st.markdown("""
<style>
[data-testid="stAppViewContainer"] {background:#071018;}
[data-testid="stHeader"] {background:rgba(0,0,0,0);}
.block-container {max-width:1400px; padding-top:2rem;}
.hero {padding:26px 30px; border:1px solid #193040; border-radius:22px; background:linear-gradient(135deg,#0c1b27,#09131d); margin-bottom:20px;}
.hero-kicker {color:#69e6d2; font-weight:700; letter-spacing:.12em; text-transform:uppercase; font-size:.75rem;}
.hero h1 {font-size:2.7rem; margin:.3rem 0;}
.hero p {color:#9fb2c1; font-size:1rem; max-width:900px;}
.card {background:#0d1822; border:1px solid #1b2b38; border-radius:16px; padding:18px; height:100%;}
.card .label {color:#8194a3; font-size:.75rem; text-transform:uppercase; letter-spacing:.08em;}
.card .value {font-size:2rem; font-weight:750; margin-top:4px;}
.good {color:#69e6d2}.warn {color:#ffc857}.muted {color:#8ca0ae}
.step {background:#0c1720; border:1px solid #1a2a36; border-radius:12px; padding:12px 14px; margin:7px 0;}
.step b {color:#69e6d2}
.small {font-size:.82rem;color:#8ca0ae}
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="hero">
<div class="hero-kicker">Application Data Search · Post-Retrieval Optimization</div>
<h1>⚡ Smart Context Compression</h1>
<p>Retrieve broadly, rerank precisely, then send only dense semantic evidence to the LLM. The dashboard makes token savings, TTFT impact and answer retention measurable.</p>
</div>
""", unsafe_allow_html=True)

with st.sidebar:
    st.header("Run configuration")
    provider = st.selectbox("LLM provider", ["nvidia", "groq", "gemini"], index=0)
    st.caption(f"Default: `{DEFAULT_MODELS[provider]}`")

    ENV_KEYS = {
        "nvidia": "NVIDIA_API_KEY",
        "groq": "GROQ_API_KEY",
        "gemini": "GEMINI_API_KEY",
    }
    env_name = ENV_KEYS[provider]
    api_key = os.getenv(env_name)
    if api_key:
        st.success(f"✓ {env_name} loaded from .env")
    else:
        st.warning(f"{env_name} not found in .env")

    model = st.text_input("Model override", value=DEFAULT_MODELS[provider])
    st.divider()
    st.markdown("**Targets**")
    st.write(f"🎯 Compression ≥ {TARGET_COMPRESSION_FRACTION:.0%}")
    st.write(f"🎯 Accuracy retention ≥ {TARGET_ACCURACY_PCT:.0f}%")
    st.caption("The core compressor is local. The LLM is used only for adaptive verification or the optional A/B evaluation.")

left, right = st.columns([1.05, .95])
with left:
    st.subheader("01 · Context")
    dataset = st.selectbox("Dataset", ["Customer support chat", "Python code", "Custom"])
    if dataset == "Customer support chat":
        default_context, default_query, content_type = SAMPLE_CHAT, SAMPLE_CHAT_QUESTION, "chat"
    elif dataset == "Python code":
        default_context, default_query, content_type = SAMPLE_CODE, SAMPLE_CODE_QUESTION, "code"
    else:
        default_context, default_query, content_type = "", "", "text"
    content_type = st.selectbox("Content type", ["chat", "code", "text"], index=["chat","code","text"].index(content_type))
    context = st.text_area("Retrieved context", value=default_context, height=330)

with right:
    st.subheader("02 · Query")
    query = st.text_area("Question", value=default_query, height=115)
    st.subheader("03 · Execute")
    c1, c2 = st.columns(2)
    compress_btn = c1.button("⚡ Compress", use_container_width=True)
    eval_btn = c2.button("🧪 Evaluate", type="primary", use_container_width=True, disabled=not api_key)
    st.markdown("<div class='small'>Evaluate runs full-context vs compressed-context answers and an LLM judge. It is intentionally separate from the compression path.</div>", unsafe_allow_html=True)

if compress_btn or eval_btn:
    if not context.strip() or not query.strip():
        st.error("Context and query are required.")
        st.stop()
    with st.spinner("Retrieving → BM25 → MMR → reranking → sentence pruning…"):
        result = compress_adaptive(context, query, content_type, provider=provider, api_key=api_key or None, model=model)

    st.subheader("04 · Compression telemetry")
    cards = st.columns(5)
    values = [
        ("Original", f"{result.original_tokens:,}", "tokens", ""),
        ("Compressed", f"{result.compressed_tokens:,}", "tokens", ""),
        ("Tokens saved", f"{result.tokens_saved:,}", "tokens", "good"),
        ("Compression", f"{result.compression_ratio:.1%}", "target ≥70%", "good" if result.compression_ratio >= .70 else "warn"),
        ("Pipeline", f"{result.compression_latency_ms:.0f} ms", "local compression", ""),
    ]
    for col, (label, value, sub, cls) in zip(cards, values):
        with col:
            st.markdown(f"<div class='card'><div class='label'>{label}</div><div class='value {cls}'>{value}</div><div class='small'>{sub}</div></div>", unsafe_allow_html=True)

    chart = go.Figure(go.Bar(x=[result.compressed_tokens, result.tokens_saved], y=["Context"], orientation="h", marker=dict(color=["#69e6d2", "#263746"]), text=[f"{result.compressed_tokens:,}", f"{result.tokens_saved:,} saved"], textposition="inside"))
    chart.update_layout(barmode="stack", height=100, margin=dict(l=0,r=0,t=10,b=10), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", xaxis=dict(visible=False), yaxis=dict(visible=False), showlegend=False)
    st.plotly_chart(chart, use_container_width=True)

    st.subheader("05 · Compression pipeline")
    steps = [
        ("1", "Structural cleanup", "Remove comments, filler phrases and duplicate blocks."),
        ("2", "Semantic chunking", "Preserve Python classes/functions; split chat turns and prose."),
        ("3", "FAISS + BM25 recall", "Combine dense semantic similarity with exact-term evidence."),
        ("4", "MMR diversification", "Prevent redundant chunks from consuming the token budget."),
        ("5", "Cross-encoder rerank", "Precision scoring on the shortlisted candidates."),
        ("6", "Token budget packing", "Target the 70% reduction before the LLM sees anything."),
        ("7", "Sentence-level pruning", "Keep information-rich sentences inside selected prose/chat chunks."),
        ("8", "Adaptive verification", "Call the LLM only when the cutoff is uncertain."),
    ]
    cols = st.columns(2)
    for i, (num, title, desc) in enumerate(steps):
        with cols[i % 2]:
            st.markdown(f"<div class='step'><b>{num} · {title}</b><br><span class='small'>{desc}</span></div>", unsafe_allow_html=True)

    if result.verification_triggered:
        st.warning("Adaptive verification was triggered because the retrieval cutoff was borderline.")
    else:
        st.success(f"Extractive cutoff confidence: {result.confidence:.0%} · no verification needed.")
    for note in result.verification_notes:
        st.caption(note)

    a, b = st.columns(2)
    with a:
        st.markdown("**Compressed context — actual LLM payload**")
        st.code(result.compressed_text, language="python" if content_type == "code" else "text")
    with b:
        st.markdown("**Original retrieved context**")
        st.code(result.original_text, language="python" if content_type == "code" else "text")

    st.caption(f"Embedding backend: {get_embedder_backend_name()} · reranker: {get_reranker_backend_name()}")

    if eval_btn:
        with st.spinner("Running full vs compressed answers + judge…"):
            evaluation = run_evaluation(result, query, provider=provider, api_key=api_key, model=model)
        st.subheader("06 · Judge-facing metrics")
        metric_cols = st.columns(5)
        metrics = [
            ("Accuracy retention", "N/A" if evaluation.retention_score is None else f"{evaluation.retention_score:.0f}%", "good" if (evaluation.retention_score or 0) >= 95 else "warn"),
            ("TTFT drop", "N/A" if evaluation.ttft_drop_ms is None else f"{evaluation.ttft_drop_ms:+.0f} ms", "good" if (evaluation.ttft_drop_ms or 0) > 0 else "warn"),
            ("Latency reduction", f"{evaluation.latency_reduction_pct:.1f}%", "good" if evaluation.latency_reduction_pct > 0 else "warn"),
            ("Cost reduction", f"{evaluation.cost_reduction_pct:.1f}%", "good"),
            ("LLM calls", str(result.llm_calls_used + 3), ""),
        ]
        for col, (label, value, cls) in zip(metric_cols, metrics):
            with col:
                st.markdown(f"<div class='card'><div class='label'>{label}</div><div class='value {cls}'>{value}</div></div>", unsafe_allow_html=True)
        if evaluation.answer_full.error or evaluation.answer_compressed.error:
            st.error(evaluation.answer_full.error or evaluation.answer_compressed.error)
        else:
            q1, q2 = st.columns(2)
            q1.info(evaluation.answer_full.text)
            q2.success(evaluation.answer_compressed.text)
            st.caption(f"Full TTFT: {(evaluation.answer_full.ttft_seconds or 0)*1000:.0f} ms · Compressed TTFT: {(evaluation.answer_compressed.ttft_seconds or 0)*1000:.0f} ms")

st.divider()
st.markdown("<div class='small'>Architecture note: your existing website does not need to be rebuilt. Point its workflow to the Python FastAPI service in <code>api.py</code>; keep this Streamlit app as the judge/demo dashboard.</div>", unsafe_allow_html=True)