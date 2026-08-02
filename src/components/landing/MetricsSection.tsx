import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CountUp } from '../ui/CountUp';
import { supabase } from '../../lib/supabaseClient';

interface LiveMetric {
  end: number;
  decimals?: number;
  suffix: string;
  label: string;
  sublabel: string;
}

type Row = {
  compression_ratio: number | null;
  reasoning_retention_score: number | null;
  cost_saved: number | null;
  compressed_token_count: number | null;
  latency_original_ms: number | null;
  latency_compressed_ms: number | null;
};

const average = (values: number[]): number | null =>
  values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;

/** Real, dollar-cost-per-token estimate used consistently with the n8n "Combine and Measure" node (see docs/compression-engine-architecture.md). */
const COST_PER_MILLION_TOKENS = 3;

export const MetricsSection: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveMetric[] | null>(null);
  const [runCount, setRunCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchMetrics = async () => {
      const { data, error } = await supabase
        .from('compressions')
        .select(
          'compression_ratio, reasoning_retention_score, cost_saved, compressed_token_count, latency_original_ms, latency_compressed_ms'
        )
        .eq('status', 'completed');

      if (cancelled) return;
      const rows = (!error && data ? data : []) as Row[];

      const tokenCompression = average(rows.map((r) => r.compression_ratio).filter((v): v is number => v != null));

      const reasoningPrecision = average(
        rows.map((r) => r.reasoning_retention_score).filter((v): v is number => v != null)
      );

      // Real cost reduction % per row: cost_saved / (compressed cost + cost_saved), using the
      // same $/M-token rate the backend applies — not a fabricated figure, just derived from it.
      const costReduction = average(
        rows
          .filter((r) => r.cost_saved != null && r.compressed_token_count != null)
          .map((r) => {
            const compressedCost = (r.compressed_token_count! / 1_000_000) * COST_PER_MILLION_TOKENS;
            const denom = compressedCost + r.cost_saved!;
            return denom > 0 ? (r.cost_saved! / denom) * 100 : 0;
          })
      );

      const fasterExecution = average(
        rows
          .filter((r) => r.latency_original_ms != null && r.latency_compressed_ms != null && r.latency_compressed_ms! > 0)
          .map((r) => r.latency_original_ms! / r.latency_compressed_ms!)
      );

      setRunCount(rows.length);
      setMetrics([
        {
          end: tokenCompression ?? 0,
          suffix: '%',
          label: 'Token Compression',
          sublabel: `Average payload reduction across ${rows.length.toLocaleString()} real compression run${rows.length === 1 ? '' : 's'}`,
        },
        {
          end: reasoningPrecision ?? 0,
          suffix: '%',
          label: 'Reasoning Precision',
          sublabel: 'Average reasoning retention score from the Reasoning Retention Evaluation stage',
        },
        {
          end: costReduction ?? 0,
          suffix: '%',
          label: 'Cost Reduction',
          sublabel: 'Average direct API bill savings, derived from real cost_saved records',
        },
        {
          end: fasterExecution ?? 0,
          decimals: 1,
          suffix: 'x',
          label: 'Faster Execution',
          sublabel: 'Average original vs. compressed latency ratio across real runs',
        },
      ]);
    };

    fetchMetrics();
    return () => {
      cancelled = true;
    };
  }, []);

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

      {!metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="p-8 rounded-2xl border border-white/10 bg-zinc-950/60 h-[220px] animate-pulse" />
          ))}
        </div>
      ) : (
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
                  {runCount > 0 ? (
                    <CountUp end={metric.end} decimals={metric.decimals || 0} suffix={metric.suffix} duration={2} />
                  ) : (
                    <span className="text-zinc-600">N/A</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{metric.label}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-normal">{metric.sublabel}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>METRIC 0{idx + 1}</span>
                <span className="text-emerald-400 font-semibold">LIVE</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};
