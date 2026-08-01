import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { scaleIn } from '../animations/variants';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  timeframe?: string;
  icon: LucideIcon;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  isPositive = true,
  timeframe,
  icon: Icon,
  subtext
}) => {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="group relative rounded-xl border border-border bg-card p-5 shadow-sm hover:border-border-strong hover:shadow-card-glow transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-200">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {value}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {change && (
          <div className={`flex items-center gap-1 font-mono font-medium ${
            isPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{change}</span>
          </div>
        )}
        {(timeframe || subtext) && (
          <span className="text-muted text-[11px] font-mono ml-auto">
            {timeframe || subtext}
          </span>
        )}
      </div>

      {/* Decorative subtle ambient highlight */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
    </motion.div>
  );
};
