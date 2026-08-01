import React from 'react';
import { motion } from 'framer-motion';
import { CountUp } from '../ui/CountUp';

export const MetricsSection: React.FC = () => {
  const metrics = [
    {
      end: 70,
      suffix: '%',
      label: 'Token Compression',
      sublabel: 'Average payload reduction across 1.2M tested enterprise prompts',
    },
    {
      end: 95,
      suffix: '%',
      label: 'Reasoning Precision',
      sublabel: 'Zero benchmark degradation on complex multi-hop LLM evals',
    },
    {
      end: 62,
      suffix: '%',
      label: 'Cost Reduction',
      sublabel: 'Direct API bill savings on GPT-4o, Claude 3.5 & Gemini 1.5',
    },
    {
      end: 3.4,
      decimals: 1,
      suffix: 'x',
      label: 'Faster Execution',
      sublabel: 'Substantially reduced Time-To-First-Token (TTFT) latency',
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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' as const },
    },
  };

  return (
    <section className="relative py-28 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">PROVEN IMPACT</span>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Built for Scale-Grade Performance
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {metrics.map((metric, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="p-8 rounded-2xl border border-white/10 bg-zinc-950/60 hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-white mb-4 group-hover:scale-105 origin-left transition-transform duration-300">
                <CountUp
                  end={metric.end}
                  decimals={metric.decimals || 0}
                  suffix={metric.suffix}
                  duration={2}
                />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{metric.label}</h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-normal">{metric.sublabel}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>METRIC 0{idx + 1}</span>
              <span className="text-emerald-400 font-semibold">VERIFIED</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
