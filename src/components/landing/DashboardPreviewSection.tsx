import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Activity } from 'lucide-react';

export const DashboardPreviewSection: React.FC = () => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y / 40);
    setRotateY(x / 40);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section className="relative py-28 px-6 max-w-7xl mx-auto border-t border-white/5 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-3xl mx-auto mb-16 space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span>Enterprise Management Console</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Powerful Control Center
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg">
          Monitor compression throughput, fine-tune accuracy budgets, and review savings across all enterprise LLM routes.
        </p>
      </motion.div>

      {/* Laptop Mockup Wrapper with 3D Tilt */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: '-80px' }}
        transition={{ duration: 0.8 }}
        className="perspective-1000 max-w-5xl mx-auto flex justify-center"
      >
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ rotateX, rotateY }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full rounded-2xl border border-white/15 bg-zinc-950 p-3 sm:p-4 shadow-[0_25px_80px_rgba(0,0,0,0.8)] relative group cursor-pointer"
        >
          {/* Laptop Top Bezel */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 px-2 text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="ml-2 text-zinc-400">ContextFlow Enterprise Console</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM ONLINE
              </span>
            </div>
          </div>

          {/* Inner Dashboard Mockup Screen */}
          <div className="p-4 sm:p-6 bg-[#08090A] rounded-xl border border-white/5 space-y-6 mt-3">
            {/* Top Bar Mockup */}
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs">
                  CF
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Acme Corp Enterprise Workspace</h4>
                  <p className="text-[10px] font-mono text-zinc-500">Production Route: /v1/compress</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-white/5 border border-white/10 text-emerald-400">
                  71.4% Avg Reduction
                </span>
                <Link
                  to="/signin"
                  className="px-3 py-1 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-1 text-xs"
                >
                  <span>Open Full Dashboard</span>
                  <ArrowRight className="w-3 h-3 text-black" />
                </Link>
              </div>
            </div>

            {/* KPI Cards Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-white/10 bg-zinc-900/60 font-mono">
                <span className="text-[10px] text-zinc-500 block">TOTAL TOKENS SAVED</span>
                <span className="text-lg font-bold text-white mt-1 block">1.42B</span>
                <span className="text-[10px] text-emerald-400">+18.4% this week</span>
              </div>
              <div className="p-3.5 rounded-xl border border-white/10 bg-zinc-900/60 font-mono">
                <span className="text-[10px] text-zinc-500 block">COST SAVINGS</span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">$48,920</span>
                <span className="text-[10px] text-zinc-400">Direct API reduction</span>
              </div>
              <div className="p-3.5 rounded-xl border border-white/10 bg-zinc-900/60 font-mono">
                <span className="text-[10px] text-zinc-500 block">AVG LATENCY</span>
                <span className="text-lg font-bold text-white mt-1 block">34ms</span>
                <span className="text-[10px] text-emerald-400">Sub-50ms SLA</span>
              </div>
              <div className="p-3.5 rounded-xl border border-white/10 bg-zinc-900/60 font-mono">
                <span className="text-[10px] text-zinc-500 block">EVAL PRECISION</span>
                <span className="text-lg font-bold text-white mt-1 block">99.1%</span>
                <span className="text-[10px] text-zinc-400">Zero accuracy loss</span>
              </div>
            </div>

            {/* Live Chart Visual Mockup */}
            <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/40">
              <div className="flex items-center justify-between mb-3 text-xs font-mono">
                <span className="text-zinc-300 font-semibold flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Token Volume Stream (24 Hours)
                </span>
                <span className="text-zinc-500">GPT-4o & Claude 3.5 Pipelines</span>
              </div>

              <div className="h-24 flex items-end justify-between gap-1 pt-2">
                {[45, 60, 52, 78, 88, 95, 70, 82, 90, 65, 75, 92, 85, 98, 70, 88, 94, 76, 82, 89, 95, 72, 86, 92].map(
                  (val, idx) => (
                    <div key={idx} className="flex-1 bg-zinc-800/80 hover:bg-emerald-500/80 rounded-t transition-all group relative h-full flex items-end">
                      <div
                        style={{ height: `${val}%` }}
                        className="w-full bg-gradient-to-t from-emerald-600/40 to-emerald-400/90 rounded-t"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Hover Overlay CTA */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
            <Link
              to="/signin"
              className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm shadow-2xl flex items-center gap-2 hover:bg-zinc-200 transition-all scale-95 group-hover:scale-100"
            >
              <span>Launch Enterprise Dashboard</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
