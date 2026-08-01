import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, Database, Layers, Sparkles } from 'lucide-react';
import { CountUp } from '../ui/CountUp';

type CompressionStage = {
  id: number;
  title: string;
  shortLabel: string;
  summary: string;
  tooltip: string;
  inputTokens: number;
  outputTokens: number;
  density: number;
  icon: React.ComponentType<{ className?: string }>;
};

const STAGES: CompressionStage[] = [
  {
    id: 0,
    title: 'Raw Context Intake',
    shortLabel: 'Ingress',
    summary: 'High-volume logs, traces, docs',
    tooltip: 'Ingress stream with maximum entropy and minimum compression.',
    inputTokens: 108400,
    outputTokens: 84500,
    density: 1.2,
    icon: Database,
  },
  {
    id: 1,
    title: 'Semantic Chunking',
    shortLabel: 'Chunk',
    summary: 'Intent-preserving boundary merge',
    tooltip: 'Redundant regions are merged while preserving intent boundaries.',
    inputTokens: 84500,
    outputTokens: 58400,
    density: 2.1,
    icon: Layers,
  },
  {
    id: 2,
    title: 'Priority Compression',
    shortLabel: 'Score',
    summary: 'Signal scoring and pruning',
    tooltip: 'Lower-value token clusters are pruned after relevance scoring.',
    inputTokens: 58400,
    outputTokens: 39200,
    density: 3.4,
    icon: BrainCircuit,
  },
  {
    id: 3,
    title: 'Dense Context Output',
    shortLabel: 'Dense',
    summary: 'High-density reasoning packets',
    tooltip: 'Compressed context is emitted as dense, model-ready packets.',
    inputTokens: 39200,
    outputTokens: 29800,
    density: 4.8,
    icon: Sparkles,
  },
];

export const InteractiveFlowCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const [replayNonce, setReplayNonce] = useState(0);
  const [rippleStage, setRippleStage] = useState<{ id: number; key: number } | null>(null);

  const focusedStage = hoveredStage ?? activeStage;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!rippleStage) {
      return;
    }
    const timeout = setTimeout(() => setRippleStage(null), 700);
    return () => clearTimeout(timeout);
  }, [rippleStage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const parent = canvas.parentElement;
    if (!parent) {
      return;
    }

    let frameId = 0;
    let replayPulse = 0;
    const particleCount = 84;
    const particles = Array.from({ length: particleCount }, (_, index) => ({
      seed: (index * 0.37) % 1,
      speed: 0.82 + (index % 9) * 0.05,
      lane: index % 6,
      hueShift: index % 7,
    }));
    const dropRatios = [1, 1.5, 2.4, 3.2];

    const resize = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(parent);

    const draw = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;
      const progressLimit = (activeStage + 1) / STAGES.length;
      replayPulse = Math.max(0, replayPulse - 0.012);

      context.clearRect(0, 0, width, height);
      const backdrop = context.createLinearGradient(0, 0, width, height);
      backdrop.addColorStop(0, 'rgba(6, 12, 25, 0.86)');
      backdrop.addColorStop(1, 'rgba(18, 8, 35, 0.8)');
      context.fillStyle = backdrop;
      context.fillRect(0, 0, width, height);

      const left = 28;
      const right = width - 28;
      const centerY = height * 0.56;

      for (const particle of particles) {
        const phase = ((time * 0.000065 * particle.speed) + particle.seed + replayPulse * 0.2) % 1;
        const stageIndex = Math.min(STAGES.length - 1, Math.floor(phase * STAGES.length));
        const gate = Math.ceil(dropRatios[stageIndex]);
        const isKept = (particle.lane + stageIndex + particle.hueShift) % gate === 0;

        const travel = Math.sin((phase * Math.PI) / 2);
        const x = left + (right - left) * travel;
        const spread = (1 - travel) * height * 0.24 + height * 0.03;
        const oscillation = Math.sin((phase * 24) + (particle.lane * 1.8) + (time * 0.0012)) * spread;
        const y = centerY + oscillation;
        const radius = 1.2 + travel * 3.3;

        let alpha = isKept ? 0.86 : 0.24;
        if (phase > progressLimit) {
          alpha *= 0.2;
        }

        const hue = 186 + travel * 74 + particle.hueShift;
        context.fillStyle = `hsla(${hue}, 88%, ${isKept ? 66 : 52}%, ${alpha})`;
        context.shadowColor = `hsla(${hue}, 98%, 65%, ${alpha})`;
        context.shadowBlur = isKept ? 14 : 8;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.shadowBlur = 0;
      for (let index = 0; index < STAGES.length; index += 1) {
        const markerX = left + ((right - left) * index) / (STAGES.length - 1);
        const markerActive = index <= activeStage;
        context.fillStyle = markerActive ? 'rgba(96, 241, 255, 0.92)' : 'rgba(166, 193, 255, 0.3)';
        context.beginPath();
        context.arc(markerX, centerY, markerActive ? 4.2 : 3.1, 0, Math.PI * 2);
        context.fill();
      }

      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [activeStage, replayNonce]);

  const totalReduction = useMemo(() => {
    const first = STAGES[0].inputTokens;
    const last = STAGES[STAGES.length - 1].outputTokens;
    return Math.round(((first - last) / first) * 100);
  }, []);

  const handleStageClick = (stageIndex: number) => {
    setActiveStage(stageIndex);
    setReplayNonce((prev) => prev + 1);
    setRippleStage({ id: stageIndex, key: Date.now() });
  };

  return (
    <div className="relative w-full max-w-xl mx-auto font-sans">
      <div className="absolute inset-[-10%] -z-10 rounded-[30px] bg-[radial-gradient(circle_at_25%_25%,rgba(56,189,248,0.22),transparent_42%),radial-gradient(circle_at_85%_20%,rgba(139,92,246,0.24),transparent_45%),radial-gradient(circle_at_50%_95%,rgba(6,182,212,0.17),transparent_42%)] blur-3xl" />
      <div className="relative rounded-3xl border border-cyan-300/25 bg-slate-950/65 p-4 sm:p-6 shadow-[0_0_55px_rgba(29,78,216,0.25)] backdrop-blur-2xl">
        <div className="relative h-[260px] sm:h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

          <div className="absolute left-3 top-3 rounded-xl border border-white/10 bg-slate-950/78 px-3 py-2 text-[11px] font-mono text-white shadow-lg backdrop-blur-xl">
            <p className="font-semibold tracking-wide text-cyan-200">Context Compression Stream</p>
            <p className="mt-1 text-slate-300">
              <span className="text-cyan-300">108,400</span> →{' '}
              <span className="text-violet-300">29,800</span> tokens ({totalReduction}% reduction)
            </p>
          </div>

          <div className="absolute right-3 top-3 rounded-lg border border-white/10 bg-slate-950/78 px-2.5 py-1 text-[10px] font-mono text-slate-300">
            60 FPS pipeline render
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {STAGES.map((stage, stageIndex) => {
            const Icon = stage.icon;
            const isFocused = stageIndex === focusedStage;
            const isActive = stageIndex === activeStage;

            return (
              <motion.button
                key={stage.id}
                type="button"
                onClick={() => handleStageClick(stageIndex)}
                onMouseEnter={() => setHoveredStage(stageIndex)}
                onMouseLeave={() => setHoveredStage(null)}
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className={`relative overflow-hidden rounded-xl border px-3 py-2 text-left transition-colors ${
                  isFocused ? 'border-cyan-300/50 bg-slate-900/80' : 'border-white/10 bg-slate-950/60'
                }`}
              >
                <AnimatePresence>
                  {rippleStage && rippleStage.id === stage.id && (
                    <motion.span
                      key={rippleStage.key}
                      initial={{ opacity: 0.4, scale: 0 }}
                      animate={{ opacity: 0, scale: 2.8 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/35 bg-cyan-300/20"
                    />
                  )}
                </AnimatePresence>
                <div className="relative z-10 flex items-center gap-2">
                  <span className={`rounded-lg border p-1.5 ${isFocused ? 'border-cyan-200/45 bg-cyan-300/15' : 'border-white/10 bg-white/5'}`}>
                    <Icon className="h-3.5 w-3.5 text-cyan-200" />
                  </span>
                  <span className={`text-[10px] font-mono ${isActive ? 'text-cyan-100' : 'text-slate-300'}`}>
                    {stage.shortLabel}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${focusedStage}-${replayNonce}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 rounded-xl border border-cyan-300/25 bg-slate-950/80 px-3 py-2 shadow-lg backdrop-blur-xl"
          >
            <p className="text-[10px] font-mono text-cyan-100">
              {STAGES[focusedStage].title}: <span className="text-slate-100">{STAGES[focusedStage].tooltip}</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-slate-200">
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
                IN <CountUp key={`in-${focusedStage}-${replayNonce}`} end={STAGES[focusedStage].inputTokens} duration={0.65} />
              </span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
                OUT <CountUp key={`out-${focusedStage}-${replayNonce}`} end={STAGES[focusedStage].outputTokens} duration={0.65} />
              </span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
                DENSITY <CountUp key={`density-${focusedStage}-${replayNonce}`} end={STAGES[focusedStage].density} duration={0.65} decimals={1} suffix="x" />
              </span>
            </div>
            <p className="mt-2 text-[10px] text-slate-300">{STAGES[focusedStage].summary}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
