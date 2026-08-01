import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, Cpu, Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { N8nResult } from '../types';
import { fadeIn, scaleIn } from '../animations/variants';

// Visual-only pipeline stage labels — no fake data, just UX feedback
const DISPLAY_STAGES = [
  'Parsing token structure...',
  'Deduplicating semantic blocks...',
  'Scoring attention weights...',
  'Selecting token budget...',
  'Reconstructing compressed prompt...',
];

export const ProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const result = location.state?.result as N8nResult | undefined;

  const [stageIndex, setStageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // No result in state → user landed here directly, show error
  const hasResult = Boolean(result);

  useEffect(() => {
    if (!hasResult) return;

    // Elapsed clock — purely cosmetic
    const clock = setInterval(() => setElapsedMs((p) => p + 25), 25);

    // Cycle through display stages at ~250ms each, then navigate
    const stageTimer = setInterval(() => {
      setStageIndex((prev) => {
        const next = prev + 1;
        if (next >= DISPLAY_STAGES.length) {
          clearInterval(stageTimer);
          setIsFinished(true);
          // Short pause to show completion tick, then go to results
          setTimeout(() => {
            navigate('/dashboard/results', { state: result });
          }, 600);
        }
        return next;
      });
    }, 260);

    return () => {
      clearInterval(clock);
      clearInterval(stageTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasResult]);

  // ── Error state: no data ──────────────────────────────────────────────────
  if (!hasResult) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-lg mx-auto mt-24 flex flex-col items-center gap-6 text-center"
      >
        <div className="rounded-full bg-rose-500/15 p-5">
          <AlertTriangle className="h-10 w-10 text-rose-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">No compression data found</h2>
          <p className="text-sm text-zinc-400">
            Please start a new compression from the Upload Studio.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/upload')}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all"
        >
          <ArrowRight className="h-4 w-4" />
          Go to Upload Studio
        </button>
      </motion.div>
    );
  }

  // ── Processing animation ──────────────────────────────────────────────────
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-xs font-mono text-accent mb-2">
            <Zap className="h-3.5 w-3.5 animate-pulse" />
            <span>Finalizing Compression Result</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Almost there...
          </h1>
          <p className="text-xs text-muted mt-1">
            Your context has been compressed. Preparing the results view.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Stage Labels */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-bold font-heading text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-accent" />
              Compression Pipeline
            </h3>
            <span className="text-xs font-mono text-accent bg-accent/15 px-2.5 py-0.5 rounded-full">
              {isFinished ? 'Complete' : `Stage ${Math.min(stageIndex + 1, DISPLAY_STAGES.length)} of ${DISPLAY_STAGES.length}`}
            </span>
          </div>

          <div className="space-y-3">
            {DISPLAY_STAGES.map((label, idx) => {
              const done = idx < stageIndex;
              const active = idx === stageIndex && !isFinished;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-xs font-mono transition-all duration-300 ${
                    isFinished || done
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                      : active
                      ? 'border-accent/40 bg-accent/5 text-white'
                      : 'border-border bg-zinc-950/50 text-zinc-600'
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    isFinished || done ? 'bg-emerald-400' : active ? 'bg-accent animate-pulse' : 'bg-zinc-700'
                  }`} />
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Metrics Panel */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-accent/40 bg-gradient-to-b from-card via-[#13151D] to-card p-6 shadow-card-glow space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs font-mono text-muted">
              <span className="flex items-center gap-1.5 text-white">
                <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                Live Metric Telemetry
              </span>
              <span className="text-accent">{elapsedMs} ms elapsed</span>
            </div>

            {/* Completion notification */}
            {isFinished ? (
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-4 text-emerald-400 text-sm font-semibold"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Compression complete! Redirecting to results...</span>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-mono text-zinc-400">
                  Waiting for result to load...
                </p>
                <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent via-purple-500 to-emerald-400 rounded-full"
                    animate={{ width: `${((stageIndex + 1) / DISPLAY_STAGES.length) * 100}%` }}
                    transition={{ duration: 0.25 }}
                  />
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default ProcessingPage;
