import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ReasoningGaugeProps {
  /** 0-100, or null when no real value is available (must render as N/A, never a fabricated number). */
  score: number | null;
  label: string;
  icon: LucideIcon;
  accentClassName?: string; // tailwind text-color class for the arc + value when score is present
}

const SIZE = 96;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const ReasoningGauge: React.FC<ReasoningGaugeProps> = ({
  score,
  label,
  icon: Icon,
  accentClassName = 'text-emerald-400',
}) => {
  const hasScore = score !== null && Number.isFinite(score);
  const clamped = hasScore ? Math.max(0, Math.min(100, score as number)) : 0;
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="p-5 rounded-xl border border-white/10 bg-zinc-950/80 flex items-center gap-4 font-mono">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE}
          />
          {hasScore && (
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              className={accentClassName}
              stroke="currentColor"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {hasScore ? (
            <span className={`text-lg font-bold ${accentClassName}`}>{Math.round(clamped)}%</span>
          ) : (
            <span className="text-sm font-bold text-zinc-600">N/A</span>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
          <Icon className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          {hasScore
            ? 'From reasoning_retention_score, scored by the Reasoning Retention Evaluation stage.'
            : 'Not available for this payload — no fabricated value shown.'}
        </p>
      </div>
    </div>
  );
};
