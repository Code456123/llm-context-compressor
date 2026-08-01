import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Scissors, 
  CopyCheck, 
  BarChart3, 
  Sliders, 
  Zap, 
  Bot, 
  CheckCircle2, 
  Play, 
  RefreshCw 
} from 'lucide-react';

export const PipelineSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [targetRatio, setTargetRatio] = useState(70);

  const steps = [
    {
      id: 'raw',
      title: 'Raw Prompt',
      subtitle: 'Input Payload',
      icon: FileText,
      detail: 'Parses raw multi-modal prompt, massive logs & system documents.',
      stat: '108,400 Tokens',
    },
    {
      id: 'chunk',
      title: 'Chunking',
      subtitle: 'AST Parsing',
      icon: Scissors,
      detail: 'Splits raw text into semantic AST syntax blocks, preserving code trees.',
      stat: '1,420 AST Chunks',
    },
    {
      id: 'dedup',
      title: 'Deduplication',
      subtitle: 'MinHash LSH',
      icon: CopyCheck,
      detail: 'Identifies & purges repetitive log traces, header boilerplate & mirror tokens.',
      stat: '-32,100 Redundant',
    },
    {
      id: 'rank',
      title: 'Importance Ranking',
      subtitle: 'Attention Entropy',
      icon: BarChart3,
      detail: 'Scores information density of each block using cross-attention entropy.',
      stat: 'Top 30% Quantile',
    },
    {
      id: 'budget',
      title: 'Budget Selector',
      subtitle: 'Target Budget',
      icon: Sliders,
      detail: `Applies custom enterprise target compression constraint (${targetRatio}% reduction).`,
      stat: `${targetRatio}% Target`,
    },
    {
      id: 'compress',
      title: 'Compression',
      subtitle: 'Sub-token Fusion',
      icon: Zap,
      detail: 'Fuses key semantic entities into high-density prompt schema without loss.',
      stat: '29,800 Output',
    },
    {
      id: 'llm',
      title: 'LLM Execution',
      subtitle: 'Clean Prompt',
      icon: Bot,
      detail: 'Dispatches condensed context directly to GPT-4o, Claude 3.5, or Gemini.',
      stat: '98.9% Acc Retained',
    },
  ];

  // Auto pipeline step progression
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  return (
    <section id="pipeline" className="relative py-28 px-6 max-w-7xl mx-auto border-t border-white/5">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Architecture Deep Dive</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Interactive Compression Pipeline
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg">
          Watch context transform step-by-step from raw un-pruned text blobs into dense intelligence.
        </p>
      </div>

      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10 p-4 rounded-xl border border-white/10 bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white transition-all"
          >
            {isPlaying ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Simulation Active</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-zinc-400" />
                <span>Resume Auto Flow</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveStep(0)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-all"
            title="Reset Pipeline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Budget Selector slider */}
        <div className="flex items-center gap-3 text-xs font-mono text-zinc-300">
          <span>Budget Target:</span>
          <input
            type="range"
            min="30"
            max="85"
            value={targetRatio}
            onChange={(e) => setTargetRatio(Number(e.target.value))}
            className="w-32 sm:w-44 accent-white cursor-pointer"
          />
          <span className="font-semibold text-white px-2 py-0.5 rounded bg-white/10 border border-white/10">
            -{targetRatio}% Reduction
          </span>
        </div>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="relative overflow-x-auto pb-6">
        <div className="min-w-[900px] flex items-center justify-between gap-3 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === activeStep;
            const isCompleted = idx < activeStep;

            return (
              <React.Fragment key={step.id}>
                {/* Node */}
                <motion.div
                  onClick={() => {
                    setActiveStep(idx);
                    setIsPlaying(false);
                  }}
                  whileHover={{ scale: 1.05 }}
                  className={`flex-1 p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[140px] relative ${
                    isActive
                      ? 'bg-zinc-900 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.12)]'
                      : isCompleted
                      ? 'bg-zinc-950/90 border-emerald-500/30 hover:border-emerald-500/50'
                      : 'bg-zinc-950/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-white text-black font-bold'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-zinc-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-600">0{idx + 1}</span>
                    )}
                  </div>

                  <div>
                    <h4 className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{step.subtitle}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                    <span>{step.stat}</span>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute -bottom-1 left-2 right-2 h-[2px] bg-white rounded-full"
                    />
                  )}
                </motion.div>

                {/* Connection Line */}
                {idx < steps.length - 1 && (
                  <div className="w-6 flex items-center justify-center relative">
                    <div className="w-full h-[2px] bg-zinc-800 relative overflow-hidden">
                      {(idx < activeStep || (idx === activeStep && isPlaying)) && (
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.2,
                            ease: 'linear',
                          }}
                          className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent"
                        />
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Step Details Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="mt-6 p-6 rounded-2xl border border-white/10 bg-zinc-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              {React.createElement(steps[activeStep].icon, { className: 'w-6 h-6' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  Step 0{activeStep + 1}: {steps[activeStep].title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white border border-white/10">
                  {steps[activeStep].subtitle}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">{steps[activeStep].detail}</p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.02] text-right font-mono text-xs text-zinc-300 w-full sm:w-auto">
            <span className="text-zinc-500 block text-[10px]">STAGE METRIC</span>
            <span className="text-sm font-semibold text-white">{steps[activeStep].stat}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
