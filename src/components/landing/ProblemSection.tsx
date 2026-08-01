import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, AlertTriangle, Cpu, ArrowDownRight, Layers } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const cards = [
    {
      icon: DollarSign,
      title: 'High API Cost',
      badge: 'Up to $150/1M Tokens',
      desc: 'Sending full database dumps, multi-page PDFs, and redundant stack traces burns through LLM budgets in hours.',
    },
    {
      icon: Clock,
      title: 'Slow Response',
      badge: '3.8s TTFT Latency',
      desc: 'Processing giant context payloads delays Time-To-First-Token (TTFT), ruining real-time agent execution speed.',
    },
    {
      icon: AlertTriangle,
      title: 'Context Overflow',
      badge: 'Needle-in-a-Haystack Fail',
      desc: 'Attention degradation causes LLMs to ignore critical system instructions buried inside un-pruned text blobs.',
    },
    {
      icon: Cpu,
      title: 'GPU Waste',
      badge: '80% VRAM Saturation',
      desc: 'Dedicated inference clusters consume unnecessary compute cycling through repeated boilerplate and structural junk.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  return (
    <section className="relative py-28 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-mono">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>The Bottleneck</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Why Large Prompts Hurt Enterprise AI
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg">
          As enterprise applications expand context windows to 100k+ tokens, systemic operational bottlenecks compound exponentially.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Illustration Graphic */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-5 rounded-2xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl"
        >
          {/* Subtle top glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-500" />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Uncompressed Context Payload</h3>
                <p className="text-xs font-mono text-zinc-500">128,000 Raw Tokens</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-mono border border-red-500/20">
              FATAL LATENCY
            </span>
          </div>

          {/* Visual Bottleneck Graphic */}
          <div className="space-y-3 font-mono text-xs my-4">
            <div className="p-3 rounded-lg bg-zinc-900/90 border border-white/5 text-zinc-400 space-y-1">
              <div className="text-red-400 flex items-center justify-between">
                <span>[STACK TRACE UNPRUNED]</span>
                <span>45,000 tokens</span>
              </div>
              <p className="text-zinc-600 truncate">at node_modules/react-dom/cjs/react-dom.development.js:23489:12...</p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/90 border border-white/5 text-zinc-400 space-y-1">
              <div className="text-orange-400 flex items-center justify-between">
                <span>[DUPLICATE SEC FILINGS]</span>
                <span>38,000 tokens</span>
              </div>
              <p className="text-zinc-600 truncate">Item 7. Management Discussion and Analysis of Financial Condition...</p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/90 border border-white/5 text-zinc-400 space-y-1">
              <div className="text-yellow-400 flex items-center justify-between">
                <span>[LOW ATTENTION JSON]</span>
                <span>22,000 tokens</span>
              </div>
              <p className="text-zinc-600 truncate">{`{"timestamp": "2026-08-01T12:00:00Z", "null_fields": [null, null...]}`}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-red-400">
              <ArrowDownRight className="w-4 h-4" /> 78% Redundant Noise
            </span>
            <span className="font-mono text-zinc-500">$18.40 per single prompt run</span>
          </div>
        </motion.div>

        {/* Right: 4 Reveal Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl border border-white/10 bg-zinc-950/60 hover:bg-zinc-900/80 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white group-hover:border-white/30 transition-colors">
                      <Icon className="w-5 h-5 text-zinc-300 group-hover:text-white" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/10 bg-white/[0.02] text-zinc-400">
                      {card.badge}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{card.title}</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
