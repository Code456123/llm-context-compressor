import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Scissors, BarChart3, Zap, CheckCircle2, ArrowRight, RefreshCw, Cpu } from 'lucide-react';

export const InteractiveFlowCanvas: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const stages = [
    {
      id: 0,
      title: 'Raw Context Ingest',
      tokens: '108,400 Tokens',
      icon: FileText,
      color: 'from-red-500/20 to-red-500/5',
      borderColor: 'border-red-500/30',
      badgeColor: 'text-red-400 bg-red-500/10',
      desc: 'Un-pruned enterprise stack traces, SEC filings & multi-modal payloads.',
    },
    {
      id: 1,
      title: 'AST Syntax Tree Parsing',
      tokens: '1,420 AST Chunks',
      icon: Scissors,
      color: 'from-yellow-500/20 to-yellow-500/5',
      borderColor: 'border-yellow-500/30',
      badgeColor: 'text-yellow-400 bg-yellow-500/10',
      desc: 'Splits raw text into AST syntax blocks, preserving critical code logic.',
    },
    {
      id: 2,
      title: 'Entropy Importance Ranking',
      tokens: 'Entropy Score 0.94',
      icon: BarChart3,
      color: 'from-blue-500/20 to-blue-500/5',
      borderColor: 'border-blue-500/30',
      badgeColor: 'text-blue-400 bg-blue-500/10',
      desc: 'Cross-attention entropy scores information density per token.',
    },
    {
      id: 3,
      title: 'Dense Intelligence Output',
      tokens: '29,800 Tokens (-72%)',
      icon: Zap,
      color: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
      badgeColor: 'text-emerald-400 bg-emerald-500/10',
      desc: 'High-density context streamed directly to GPT-4o, Claude 3.5 & Gemini.',
    },
  ];

  // Auto progression interval
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <div className="relative w-full max-w-lg mx-auto font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Main Flow Container */}
      <div className="relative z-10 rounded-2xl border border-white/15 bg-zinc-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-semibold">Interactive ContextFlow Pipeline</span>
          </div>
          <span className="text-[10px] text-zinc-400">Click node to inspect</span>
        </div>

        {/* Step Flow List */}
        <div className="space-y-3 relative">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStage === idx || hoveredNode === idx;
            const isCompleted = idx < activeStage;

            return (
              <div key={stage.id} className="relative">
                {/* Node Box */}
                <motion.div
                  onClick={() => setActiveStage(idx)}
                  onMouseEnter={() => setHoveredNode(idx)}
                  onMouseLeave={() => setHoveredNode(null)}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isActive
                      ? `bg-gradient-to-r ${stage.color} ${stage.borderColor} shadow-[0_0_20px_rgba(255,255,255,0.08)]`
                      : isCompleted
                      ? 'bg-zinc-900/60 border-white/10 text-zinc-300'
                      : 'bg-zinc-950 border-white/5 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-white text-black font-bold'
                            : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                          {stage.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5 font-sans leading-tight">
                          {stage.desc}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${stage.badgeColor} shrink-0`}>
                      {stage.tokens}
                    </span>
                  </div>

                  {/* Active Animated Beam Line at bottom of active stage */}
                  {isActive && (
                    <motion.div
                      layoutId="flowPulseLine"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent"
                    />
                  )}
                </motion.div>

                {/* Animated Connecting Arrow Beam */}
                {idx < stages.length - 1 && (
                  <div className="h-4 flex items-center justify-center my-1">
                    <div className="w-[1px] h-full bg-zinc-800 relative overflow-hidden">
                      {idx <= activeStage && (
                        <motion.div
                          animate={{ y: ['-100%', '100%'] }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="w-full h-full bg-emerald-400"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dynamic Stage Telemetry Footer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl border border-white/10 bg-zinc-900/60 font-mono text-[11px] flex items-center justify-between text-zinc-400"
          >
            <span>ACTIVE STAGE: 0{activeStage + 1}</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> 98.9% Retention SLA
            </span>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};
