import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Cpu, ArrowRight, Activity, Sparkles, Layers } from 'lucide-react';
import { CountUp } from '../ui/CountUp';

export const AuthShowcaseCard: React.FC = () => {
  const [compressionRatio, setCompressionRatio] = useState(72);
  const [pulseActive, setPulseActive] = useState(true);

  const rawTokens = 108400;
  const compressedTokens = Math.floor(rawTokens * (1 - compressionRatio / 100));

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto font-sans">
      {/* Subtle outer glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Showcase Card */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 rounded-2xl border border-white/15 bg-zinc-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xs shadow-md">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">ContextFlow Engine v4.2</h3>
              <p className="text-[10px] font-mono text-zinc-500">Live Context Pruning Simulator</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* Animated Compression Stream Visual */}
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span>RAW UNCOMPRESSED</span>
            <span className="text-red-400 font-bold">
              <CountUp end={rawTokens} duration={1.5} suffix=" TOKENS" />
            </span>
          </div>

          {/* Beam Bar */}
          <div className="relative w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/10 p-0.5">
            <motion.div
              animate={{ width: `${100 - compressionRatio}%` }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full relative"
            >
              <motion.div
                animate={{ x: ['0%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="absolute top-0 bottom-0 w-8 bg-white/60 blur-xs rounded-full"
              />
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>OPTIMIZED OUTPUT</span>
            <span className="text-emerald-400 font-bold">
              <CountUp end={compressedTokens} duration={1.5} suffix=" TOKENS" />
            </span>
          </div>
        </div>

        {/* Interactive Compression Slider */}
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-300">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Test Reduction Target:
            </span>
            <span className="font-bold text-emerald-400">-{compressionRatio}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="85"
            value={compressionRatio}
            onChange={(e) => setCompressionRatio(Number(e.target.value))}
            className="w-full accent-white cursor-pointer"
          />
        </div>

        {/* Floating Feature Badges */}
        <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
          <div className="p-3 rounded-xl border border-white/10 bg-zinc-900/40 space-y-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span>REASONING</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-white font-bold">98.9% Retained</p>
          </div>

          <div className="p-3 rounded-xl border border-white/10 bg-zinc-900/40 space-y-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span>LATENCY SLA</span>
              <Cpu className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-white font-bold">&lt; 34ms TTFT</p>
          </div>
        </div>

        {/* Micro status ticker */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span>Acme Corp Route: /v1/compress</span>
          <span className="text-emerald-400 font-semibold">$48,920 Saved</span>
        </div>
      </motion.div>
    </div>
  );
};
