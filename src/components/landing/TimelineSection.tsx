import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, Eye, GitBranch, Rocket } from 'lucide-react';

type WorkflowStep = {
  id: number;
  title: string;
  detail: string;
  description: string;
  bars: { label: string; value: number; status: string }[];
  icon: React.ComponentType<{ className?: string }>;
};

const STEPS: WorkflowStep[] = [
  {
    id: 1,
    title: 'You describe the idea',
    detail: 'Define business goal and target model behavior in one prompt.',
    description: 'You submit your large context payload and desired compression goal.',
    bars: [
      { label: 'Context ingest', value: 92, status: 'running' },
      { label: 'Schema detection', value: 68, status: 'running' },
      { label: 'Risk guardrails', value: 53, status: 'queued' },
    ],
    icon: BrainCircuit,
  },
  {
    id: 2,
    title: 'Agents mobilize in parallel',
    detail: 'Specialized workers parse code, docs, logs, and semantics together.',
    description: 'Independent pipelines split work in parallel for faster throughput.',
    bars: [
      { label: 'Structure parser', value: 84, status: 'running' },
      { label: 'Entropy ranker', value: 61, status: 'running' },
      { label: 'Duplication pruner', value: 44, status: 'queued' },
    ],
    icon: GitBranch,
  },
  {
    id: 3,
    title: 'You review in real-time',
    detail: 'Live telemetry explains what was removed and what was preserved.',
    description: 'Transparent scoring shows reduction decisions before final output.',
    bars: [
      { label: 'Retention score', value: 88, status: 'running' },
      { label: 'Cost preview', value: 73, status: 'running' },
      { label: 'Diff confidence', value: 57, status: 'queued' },
    ],
    icon: Eye,
  },
  {
    id: 4,
    title: 'Optimized context ships',
    detail: 'Dense, validated context reaches your model endpoint.',
    description: 'Final payload is compressed for budget and preserved for reasoning.',
    bars: [
      { label: 'Compression output', value: 95, status: 'running' },
      { label: 'Integrity checks', value: 82, status: 'running' },
      { label: 'Endpoint push', value: 66, status: 'waiting' },
    ],
    icon: Rocket,
  },
];

export const TimelineSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % STEPS.length) + 1);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const activeData = STEPS.find((step) => step.id === activeStep) ?? STEPS[0];
  const ActiveIcon = activeData.icon;

  return (
    <section className="relative py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="max-w-3xl mb-14 space-y-4">
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.16em] text-cyan-200/80">
          <span className="h-px w-8 bg-cyan-300/70" />
          How It Works
        </div>
        <h2 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.02]">
          <span className="text-white">From idea to live</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300">
            in four moves.
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-3">
          {STEPS.map((step) => {
            const selected = step.id === activeStep;
            return (
              <motion.button
                key={step.id}
                type="button"
                onMouseEnter={() => setActiveStep(step.id)}
                onClick={() => setActiveStep(step.id)}
                whileHover={{ y: -1 }}
                className={`w-full rounded-2xl border px-5 py-5 text-left transition-all ${
                  selected
                    ? 'border-cyan-300/40 bg-cyan-500/[0.08]'
                    : 'border-white/10 bg-slate-950/40 hover:border-cyan-300/25'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className={`text-sm font-mono ${selected ? 'text-cyan-200' : 'text-zinc-500'}`}>
                    0{step.id}
                  </span>
                  <div>
                    <p className={`text-2xl font-semibold tracking-tight ${selected ? 'text-white' : 'text-zinc-300'}`}>
                      {step.title}
                    </p>
                    <p className={`mt-2 text-sm ${selected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {step.detail}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-cyan-300/25 bg-[linear-gradient(165deg,rgba(8,18,34,0.8)_0%,rgba(7,28,45,0.65)_100%)] backdrop-blur-xl p-7 shadow-[inset_0_1px_0_rgba(125,211,252,0.08),0_16px_50px_rgba(2,8,20,0.45)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeData.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-5xl font-bold text-cyan-300">0{activeData.id}</span>
                <span className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-2">
                  <ActiveIcon className="h-5 w-5 text-cyan-200" />
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-semibold tracking-tight text-white">{activeData.title}</h3>
                <p className="text-zinc-300 leading-relaxed">{activeData.description}</p>
              </div>

              <div className="space-y-3">
                {activeData.bars.map((bar) => (
                  <div key={bar.label} className="grid grid-cols-[140px_1fr_64px] items-center gap-3">
                    <span className="text-[11px] font-mono text-zinc-400">{bar.label}</span>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${bar.value}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-blue-400"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">{bar.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
