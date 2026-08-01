import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, LogIn } from 'lucide-react';
import { LightningLogo } from '../ui/LightningLogo';
import { glow, pulse } from '../../animations/variants';

export const LandingNavbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#08090A]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            variants={glow}
            initial="initial"
            animate="animate"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black shadow-lg group-hover:scale-105 transition-transform"
          >
            <LightningLogo className="h-4 w-4" />
          </motion.div>
          <motion.span
            variants={pulse}
            animate="animate"
            className="font-bold text-base tracking-tight text-white flex items-center gap-2"
          >
            ContextFlow <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">AI</span>
          </motion.span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-zinc-400">
          <a href="#pipeline" className="hover:text-white transition-colors">
            Pipeline
          </a>
          <a href="#demo" className="hover:text-white transition-colors">
            Live Demo
          </a>
          <a href="#metrics" className="hover:text-white transition-colors">
            Metrics
          </a>
          <a href="#workflow" className="hover:text-white transition-colors">
            Workflow
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/signin"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogIn className="h-3.5 w-3.5 text-zinc-400" />
            <span>Sign In</span>
          </Link>

          <Link
            to="/signin"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
          >
            <Sparkles className="h-3.5 w-3.5 text-black" />
            <span>Try Demo</span>
            <ArrowRight className="h-3.5 w-3.5 text-black group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  );
};
