import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Search, Zap, CheckCircle2, Rocket } from 'lucide-react';

export const TimelineSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Upload',
      subtitle: 'Context Ingestion',
      icon: UploadCloud,
      desc: 'Connect your raw prompt payloads, multi-page PDFs, database dumps, or real-time agent context streams via SDK or REST API.',
    },
    {
      number: '02',
      title: 'Analyze',
      subtitle: 'AST & Entropy Scoring',
      icon: Search,
      desc: 'Parses code trees, stack traces, and natural language blocks using cross-attention entropy scoring to map critical intent.',
    },
    {
      number: '03',
      title: 'Compress',
      subtitle: 'Budget Enforcement',
      icon: Zap,
      desc: 'Prunes redundant log noise and duplicate text headers while fitting context into your specified target token budget.',
    },
    {
      number: '04',
      title: 'Validate',
      subtitle: 'Accuracy Verification',
      icon: CheckCircle2,
      desc: 'Verifies semantic integrity and ensures zero reasoning loss before passing context forward.',
    },
    {
      number: '05',
      title: 'Deploy',
      subtitle: 'Sub-50ms Streaming',
      icon: Rocket,
      desc: 'Streams optimized, high-density context directly to OpenAI, Anthropic, or custom inference clusters.',
    },
  ];

  return (
    <section className="relative py-28 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">WORKFLOW</span>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          How ContextFlow Works
        </h2>
        <p className="text-zinc-400 text-base">
          An enterprise end-to-end compression workflow designed for zero developer friction.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Vertical line fill on scroll */}
        <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-zinc-800 hidden sm:block" />

        <div className="space-y-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="flex items-start gap-6 group"
              >
                {/* Node marker */}
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 group-hover:border-white/40 group-hover:bg-zinc-900 transition-all flex items-center justify-center text-white shrink-0 relative z-10 shadow-lg">
                  <Icon className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
                </div>

                {/* Content card */}
                <div className="flex-1 p-6 rounded-2xl border border-white/10 bg-zinc-950/70 hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-zinc-400">
                        {step.subtitle}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-zinc-600 font-bold">{step.number}</span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
