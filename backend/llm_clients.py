"""Provider adapters for the LLM comparison/verification layer.

Primary recommendation for the project:
- NVIDIA NIM: nvidia/nemotron-3-super-120b-a12b (strong long-context reasoning)
- Groq: openai/gpt-oss-120b (very fast, excellent for latency demos)
- Gemini: optional fallback

The compressor itself stays local. These APIs are only used for adaptive
verification and for the optional full-vs-compressed evaluation.
"""
from __future__ import annotations

import os
import time
from dotenv import load_dotenv

load_dotenv()
from dataclasses import dataclass

DEFAULT_MODELS = {
    "nvidia": "nvidia/nemotron-3-super-120b-a12b",
    "groq": "openai/gpt-oss-120b",
    "gemini": "gemini-3.6-flash",
}


@dataclass
class LLMResponse:
    text: str
    latency_seconds: float
    ttft_seconds: float | None = None
    input_tokens: int | None = None
    output_tokens: int | None = None
    model_used: str | None = None
    error: str | None = None


def _missing(name: str) -> LLMResponse:
    return LLMResponse("", 0.0, error=f"Missing {name}")


def call_openai_compatible(provider: str, prompt: str, model: str | None = None, api_key: str | None = None, stream: bool = True) -> LLMResponse:
    if provider == "nvidia":
        api_key = api_key or os.getenv("NVIDIA_API_KEY")
        base_url = "https://integrate.api.nvidia.com/v1"
        env_name = "NVIDIA_API_KEY"
    elif provider == "groq":
        api_key = api_key or os.getenv("GROQ_API_KEY")
        base_url = "https://api.groq.com/openai/v1"
        env_name = "GROQ_API_KEY"
    else:
        raise ValueError(provider)
    if not api_key:
        return _missing(env_name)
    try:
        from openai import OpenAI
    except ImportError:
        return LLMResponse("", 0.0, error="openai package not installed")

    model = model or DEFAULT_MODELS[provider]
    start = time.perf_counter()
    first_token = None
    pieces: list[str] = []
    try:
        client = OpenAI(api_key=api_key, base_url=base_url, timeout=120.0)
        kwargs = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.0,
            "max_tokens": 2048,
            "stream": stream,
        }
        if provider == "nvidia":
            kwargs["extra_body"] = {"chat_template_kwargs": {"enable_thinking": False}}
        if stream:
            response = client.chat.completions.create(**kwargs)
            usage = None
            for chunk in response:
                if first_token is None:
                    first_token = time.perf_counter()
                if chunk.choices:
                    delta = chunk.choices[0].delta
                    content = getattr(delta, "content", None)
                    if content:
                        pieces.append(content)
                usage = getattr(chunk, "usage", None) or usage
            elapsed = time.perf_counter() - start
            return LLMResponse(
                "".join(pieces), elapsed,
                (first_token - start) if first_token else elapsed,
                getattr(usage, "prompt_tokens", None) if usage else None,
                getattr(usage, "completion_tokens", None) if usage else None,
                model,
            )
        response = client.chat.completions.create(**kwargs)
        elapsed = time.perf_counter() - start
        usage = getattr(response, "usage", None)
        return LLMResponse(response.choices[0].message.content or "", elapsed, elapsed,
                           getattr(usage, "prompt_tokens", None), getattr(usage, "completion_tokens", None), model)
    except Exception as exc:
        return LLMResponse("", time.perf_counter() - start, first_token - start if first_token else None, model_used=model, error=str(exc))


def call_groq(prompt: str, model: str | None = None, api_key: str | None = None) -> LLMResponse:
    return call_openai_compatible("groq", prompt, model, api_key)


def call_nvidia(prompt: str, model: str | None = None, api_key: str | None = None) -> LLMResponse:
    return call_openai_compatible("nvidia", prompt, model, api_key)


def call_gemini(prompt: str, model: str | None = None, api_key: str | None = None) -> LLMResponse:
    api_key = api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _missing("GEMINI_API_KEY")
    try:
        from google import genai
    except ImportError:
        return LLMResponse("", 0.0, error="google-genai package not installed")
    model = model or DEFAULT_MODELS["gemini"]
    start = time.perf_counter()
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(model=model, contents=prompt)
        elapsed = time.perf_counter() - start
        usage = getattr(response, "usage_metadata", None)
        return LLMResponse(
            response.text or "", elapsed, elapsed,
            getattr(usage, "prompt_token_count", None) if usage else None,
            getattr(usage, "candidates_token_count", None) if usage else None,
            model,
        )
    except Exception as exc:
        return LLMResponse("", time.perf_counter() - start, error=str(exc), model_used=model)


def call_llm(provider: str, prompt: str, api_key: str | None = None, model: str | None = None) -> LLMResponse:
    provider = provider.lower()
    if provider in {"nvidia", "groq"}:
        return call_openai_compatible(provider, prompt, model, api_key)
    if provider == "gemini":
        return call_gemini(prompt, model, api_key)
    raise ValueError(f"Unknown provider: {provider}")


def make_simple_call_fn(provider: str, api_key: str | None = None, model: str | None = None):
    def _call(prompt: str) -> str:
        response = call_llm(provider, prompt, api_key, model)
        if response.error:
            raise RuntimeError(response.error)
        return response.text
    return _call