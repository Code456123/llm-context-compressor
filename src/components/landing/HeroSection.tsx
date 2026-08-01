import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Sparkles, ShieldCheck, Terminal } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Subtle radial glow background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-zinc-800/30 via-zinc-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: '-50px' }}
        className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6"
      >
        {/* Logo / Brand Badge */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-xs font-mono text-zinc-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">ContextFlow AI</span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">Enterprise Context Compression</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] max-w-3xl"
        >
          Compress Enterprise Context{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
            Without Losing Intelligence.
          </span>
        </motion.h1>

        {/* Paragraph */}
        <motion.p
          variants={itemVariants}
          className="text-zinc-400 text-lg sm:text-xl font-normal max-w-2xl leading-relaxed"
        >
          Reduce Token Usage by <span className="text-white font-semibold">70%</span> while preserving reasoning accuracy for multi-million token LLM agent pipelines.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto"
        >
          <Link
            to="/signin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-all duration-200 shadow-[0_0_25px_rgba(255,255,255,0.15)] group"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Try Demo</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#pipeline"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-zinc-300 font-medium text-sm hover:bg-white/[0.06] hover:text-white transition-all duration-200"
          >
            <Terminal className="w-4 h-4 text-zinc-400" />
            <span>Explore Pipeline</span>
          </a>
        </motion.div>

        {/* Micro feature pills */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs font-mono text-zinc-500"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>95%+ Reasoning Retained</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sub-50ms Processing</span>
          </div>
          <span>•</span>
          <div>Zero Token Overhead</div>
        </motion.div>
      </motion.div>
    </section>
  );
};
