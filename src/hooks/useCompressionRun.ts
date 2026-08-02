import { useCallback, useRef, useState } from 'react';
import { PIPELINE_STAGES } from '../constants/pipelineStages';
import { CompressionResult, PipelineStageState } from '../types';

const initialStages = (): PipelineStageState[] =>
  PIPELINE_STAGES.map((s) => ({ ...s, status: 'pending' as const }));

/**
 * Relative time weight for how long each stage's "running" indicator stays
 * lit before advancing to the next one. This paces the label/glow only —
 * every metric ultimately displayed (tokens, ratio, cost, latency, status,
 * reasoning score) comes from the real backend response, never from this
 * schedule. The n8n webhook only responds once, at the very end, so this
 * is the best honest approximation of progress until the backend exposes
 * per-stage events (see Instruction 2) — at that point this hook's timer-
 * based `advance()` calls can be swapped for real event-driven ones without
 * touching the UI, since callers only see stage status + activeIndex.
 */
const STAGE_WEIGHTS = [0.3, 0.6, 0.7, 1, 1.6, 0.5, 1.4, 0.6, 1.4, 0.5] as const; // 10 transitions: webhook..save
const TOTAL_PACED_MS = 5200;

interface CompressionRunState {
  stages: PipelineStageState[];
  /** Index of the currently running stage, or -1 when idle or finished. */
  activeIndex: number;
  statusLabel: string;
  elapsedMs: number;
  estimatedTokens: number | null;
  errorMessage: string | null;
  isRunning: boolean;
}

export function useCompressionRun() {
  const [state, setState] = useState<CompressionRunState>({
    stages: initialStages(),
    activeIndex: -1,
    statusLabel: 'Waiting for Compression Request',
    elapsedMs: 0,
    estimatedTokens: null,
    errorMessage: null,
    isRunning: false,
  });

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clockInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);
  const runToken = useRef(0);

  const clearTimers = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    if (clockInterval.current) {
      clearInterval(clockInterval.current);
      clockInterval.current = null;
    }
  };

  const reset = useCallback(() => {
    clearTimers();
    setState({
      stages: initialStages(),
      activeIndex: -1,
      statusLabel: 'Waiting for Compression Request',
      elapsedMs: 0,
      estimatedTokens: null,
      errorMessage: null,
      isRunning: false,
    });
  }, []);

  const run = useCallback(async (text: string, targetRatio: number, webhookUrl: string) => {
    clearTimers();
    const myToken = ++runToken.current;
    const stillCurrent = () => myToken === runToken.current;

    startTime.current = Date.now();
    const estimatedTokens = Math.round(text.length / 4);

    setState({
      stages: initialStages(),
      activeIndex: 0,
      statusLabel: PIPELINE_STAGES[0].runningLabel,
      elapsedMs: 0,
      estimatedTokens,
      errorMessage: null,
      isRunning: true,
    });

    clockInterval.current = setInterval(() => {
      if (!stillCurrent()) return;
      setState((prev) => ({ ...prev, elapsedMs: Date.now() - startTime.current }));
    }, 50);

    // Advance stage-by-stage up through "Save to Supabase" (index 9) on a
    // best-effort timer, then hold there until the real response lands —
    // "Return Response" (the last stage) only ever completes on real data.
    let cumulative = 0;
    const totalWeight = STAGE_WEIGHTS.reduce((a, b) => a + b, 0);
    STAGE_WEIGHTS.forEach((weight, i) => {
      cumulative += (weight / totalWeight) * TOTAL_PACED_MS;
      const nextIndex = i + 1;
      const t = setTimeout(() => {
        if (!stillCurrent()) return;
        setState((prev) => {
          if (!prev.isRunning) return prev;
          const stages = prev.stages.map((s, idx) => {
            if (idx <= i) return { ...s, status: 'completed' as const };
            if (idx === nextIndex) return { ...s, status: 'running' as const };
            return s;
          });
          return {
            ...prev,
            stages,
            activeIndex: nextIndex,
            statusLabel: PIPELINE_STAGES[nextIndex].runningLabel,
          };
        });
      }, cumulative);
      timeouts.current.push(t);
    });

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetRatio }),
      });

      const rawBody = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText} — ${rawBody.slice(0, 300)}`);
      if (!rawBody) {
        throw new Error(
          'n8n returned an empty response body. The workflow likely errored before "Respond to Webhook" ' +
            '(check the n8n Executions tab — most commonly the Supabase "Save Result" insert failed).'
        );
      }

      let result: CompressionResult;
      try {
        result = JSON.parse(rawBody);
      } catch {
        throw new Error(`n8n response was not valid JSON: ${rawBody.slice(0, 300)}`);
      }

      if (!stillCurrent()) return result;

      clearTimers();
      setState((prev) => ({
        ...prev,
        stages: prev.stages.map((s) => ({ ...s, status: 'completed' as const })),
        activeIndex: -1,
        statusLabel: 'Compression Complete',
        elapsedMs: Date.now() - startTime.current,
        isRunning: false,
      }));

      return result;
    } catch (err) {
      if (!stillCurrent()) throw err;
      clearTimers();
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState((prev) => {
        const failIdx = prev.activeIndex >= 0 ? prev.activeIndex : 0;
        return {
          ...prev,
          stages: prev.stages.map((s, idx) =>
            idx === failIdx ? { ...s, status: 'failed' as const } : idx < failIdx ? { ...s, status: 'completed' as const } : s
          ),
          statusLabel: 'Compression Failed',
          errorMessage: message,
          elapsedMs: Date.now() - startTime.current,
          isRunning: false,
        };
      });
      throw err;
    }
  }, []);

  return { ...state, run, reset };
}
