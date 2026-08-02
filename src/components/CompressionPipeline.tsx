import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Circle, AlertCircle, Timer, Hash } from 'lucide-react';
import { PipelineStageState } from '../types';

interface CompressionPipelineProps {
  stages: PipelineStageState[];
  /** Index of the stage currently running, or -1 if idle/not started. */
  activeIndex: number;
  statusLabel: string;
  elapsedMs: number;
  /** Client-side estimated original token count (same heuristic as the backend), shown only while a run is in flight. */
  estimatedTokens: number | null;
  errorMessage?: string | null;
}

const formatElapsed = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export const CompressionPipeline: React.FC<CompressionPipelineProps> = ({
  stages,
  activeIndex,
  statusLabel,
  elapsedMs,
  estimatedTokens,
  errorMessage,
}) => {
  const isRunning = activeIndex >= 0 && activeIndex < stages.length;
  const failedStage = stages.find((s) => s.status === 'failed');
  const allCompleted = stages.length > 0 && stages.every((s) => s.status === 'completed');

  // Which stage's detail panel to show: failed one wins, else the active/running one,
  // else the last completed one, else the first stage as a preview.
  const detailStage = useMemo(() => {
    if (failedStage) return failedStage;
    if (isRunning) return stages[activeIndex];
    if (allCompleted) return stages[stages.length - 1];
    return stages[0];
  }, [failedStage, isRunning, activeIndex, allCompleted, stages]);

  return (
    <div className="space-y-4">
      {/* Compact status line */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              failedStage
                ? 'bg-rose-500'
                : allCompleted
                ? 'bg-emerald-400'
                : isRunning
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-zinc-600'
            }`}
          />
          <span
            className={
              failedStage ? 'text-rose-400 font-semibold' : allCompleted ? 'text-emerald-400 font-semibold' : 'text-white'
            }
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex items-center gap-4 text-zinc-500">
          {estimatedTokens !== null && (
            <span className="flex items-center gap-1.5">
              <Hash className="w-3 h-3" />
              ~{estimatedTokens.toLocaleString()} tokens processed
            </span>
          )}
          {(isRunning || allCompleted || failedStage) && (
            <span className="flex items-center gap-1.5">
              <Timer className="w-3 h-3" />
              {formatElapsed(elapsedMs)} elapsed
            </span>
          )}
        </div>
      </div>

      {/* Horizontal stage cards */}
      <div className="relative overflow-x-auto pb-2">
        <div className="min-w-[1300px] flex items-center gap-2">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = stage.status === 'running';
            const isDone = stage.status === 'completed';
            const isFailed = stage.status === 'failed';

            return (
              <React.Fragment key={stage.id}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className={`flex-1 min-w-[100px] h-[92px] p-3 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${
                    isFailed
                      ? 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_16px_rgba(244,63,94,0.15)]'
                      : isActive
                      ? 'bg-zinc-900 border-emerald-400/50 shadow-[0_0_16px_rgba(52,211,153,0.2)]'
                      : isDone
                      ? 'bg-zinc-950/90 border-emerald-500/30'
                      : 'bg-zinc-950/40 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between shrink-0">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        isFailed
                          ? 'bg-rose-500/20 text-rose-400'
                          : isActive
                          ? 'bg-emerald-400/20 text-emerald-300'
                          : isDone
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-white/5 text-zinc-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isActive && <Loader2 className="w-3.5 h-3.5 text-emerald-300 animate-spin" />}
                    {isFailed && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                    {stage.status === 'pending' && <Circle className="w-3 h-3 text-zinc-700 fill-zinc-800" />}
                  </div>
                  <span
                    className={`text-[10px] font-semibold leading-tight line-clamp-3 ${
                      isActive || isFailed ? 'text-white' : isDone ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {stage.title}
                  </span>
                </motion.div>

                {idx < stages.length - 1 && (
                  <div className="w-3 h-[2px] shrink-0 bg-zinc-800 relative overflow-hidden rounded-full">
                    {(isDone || (isActive && idx === activeIndex)) && (
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-full h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active/failed stage detail panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={detailStage.id + detailStage.status}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-3 ${
            failedStage ? 'border-rose-500/30 bg-rose-950/10' : 'border-white/10 bg-white/[0.02]'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              failedStage ? 'bg-rose-500/15 text-rose-400' : 'bg-white/5 text-white'
            }`}
          >
            <detailStage.icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold">{detailStage.title}</span>
              <span className="text-zinc-500 text-[10px]">{detailStage.nodeNames}</span>
            </div>
            <p className={`mt-0.5 ${failedStage ? 'text-rose-300' : 'text-zinc-400'}`}>
              {failedStage ? errorMessage || 'This stage failed.' : detailStage.purpose}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
