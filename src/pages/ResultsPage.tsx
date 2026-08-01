import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ArrowLeft, 
  Copy, 
  Download, 
  CheckCircle2, 
  TrendingDown,
  Coins,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { DiffViewer } from '../components/DiffViewer';
import { N8nResult } from '../types';
import { fadeIn, slideUp, staggerContainer } from '../animations/variants';

// Illustrative-only cost comparison (not tied to current result)
const ILLUSTRATIVE_COST_DATA = [
  { model: 'GPT-4o', uncompressedCost: 2160, compressedCost: 620 },
  { model: 'Claude 3.5', uncompressedCost: 1950, compressedCost: 490 },
  { model: 'Gemini 1.5', uncompressedCost: 1400, compressedCost: 360 },
  { model: 'GPT-4o-mini', uncompressedCost: 280, compressedCost: 84 },
];

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const result = location.state as N8nResult | null;

  // Redirect to upload if no result in state (e.g. direct URL access)
  useEffect(() => {
    if (!result) {
      navigate('/dashboard/upload', { replace: true });
    }
  }, [result, navigate]);

  if (!result) return null;

  // ── Status: input_too_short ───────────────────────────────────────────────
  if (result.status === 'input_too_short') {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-lg mx-auto mt-24 flex flex-col items-center gap-6 text-center"
      >
        <div className="rounded-full bg-amber-500/15 p-5">
          <Info className="h-10 w-10 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Input Too Short to Compress</h2>
          <p className="text-sm text-zinc-400">
            The input text was too short to compress meaningfully. Please provide a longer context (at least a few hundred tokens) for best results.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/upload')}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Try Again
        </button>
      </motion.div>
    );
  }

  // ── Derived metrics from real data ────────────────────────────────────────
  const originalTokens = result.original_token_count;
  const compressedTokens = result.compressed_token_count;
  const savedTokens = originalTokens - compressedTokens;
  const reductionPercent = result.compression_ratio;
  const costSavedNum = result.cost_saved;

  // Format cost saved: if it's a whole-dollar number show 2 decimals, else 4
  const costSavedDisplay = costSavedNum < 0.01
    ? `$${costSavedNum.toFixed(5)}`
    : `$${costSavedNum.toFixed(4)}`;

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl mx-auto"
    >
      
      {/* Top Header & Actions */}
      <motion.div variants={slideUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <button 
            onClick={() => navigate('/dashboard/upload')}
            className="inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Upload Studio</span>
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Compression Results &amp; Diff Analysis
            </h1>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
              {reductionPercent.toFixed(1)}% Tokens Reduced
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigator.clipboard.writeText(result.compressed_text)}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white shadow-card-glow hover:bg-accent-hover transition-all"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Compressed Prompt</span>
          </button>

          <button 
            onClick={() => {
              const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `compression-${result.id ?? 'result'}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-card-hover hover:text-white transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </motion.div>

      {/* below_target warning banner */}
      {result.status === 'below_target' && (
        <motion.div
          variants={fadeIn}
          className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-400"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Compression below 70% target for this input. The text may already be dense or structured in a way that limits further reduction.</span>
        </motion.div>
      )}

      {/* Metrics Summary Strip */}
      <motion.div variants={slideUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-mono uppercase text-muted flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5" /> Original Payload
          </span>
          <p className="font-mono text-2xl font-bold text-rose-400 mt-1">
            {originalTokens.toLocaleString()} <span className="text-xs text-muted">tokens</span>
          </p>
        </div>
        <div className="rounded-xl border border-accent/40 bg-card p-4 shadow-card-glow">
          <span className="text-xs font-mono uppercase text-accent flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Compressed Payload
          </span>
          <p className="font-mono text-2xl font-bold text-emerald-400 mt-1">
            {compressedTokens.toLocaleString()} <span className="text-xs text-muted">tokens</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-mono uppercase text-muted">Tokens Saved</span>
          <p className="font-mono text-2xl font-bold text-purple-400 mt-1">
            {savedTokens.toLocaleString()} <span className="text-xs text-muted">(-{reductionPercent.toFixed(1)}%)</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-mono uppercase text-muted flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5" /> Est. Cost Saved
          </span>
          <p className="font-mono text-2xl font-bold text-white mt-1">{costSavedDisplay}</p>
          <p className="text-[10px] font-mono text-zinc-600 mt-0.5">per request</p>
        </div>
      </motion.div>

      {/* Latency comparison — only show if data available */}
      {(result.latency_original_ms != null || result.latency_compressed_ms != null) && (
        <motion.div variants={slideUp} className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <span className="text-xs font-mono uppercase text-muted">Latency — Original Context</span>
            <p className="font-mono text-xl font-bold text-white mt-1">
              {result.latency_original_ms != null ? `${result.latency_original_ms} ms` : 'Not available'}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <span className="text-xs font-mono uppercase text-muted">Latency — Compressed Context</span>
            <p className="font-mono text-xl font-bold text-emerald-400 mt-1">
              {result.latency_compressed_ms != null ? `${result.latency_compressed_ms} ms` : 'Not available'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Reasoning Retention — only show if real data available */}
      {result.reasoning_retention_score != null && (
        <motion.div variants={slideUp} className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-mono uppercase text-muted">Reasoning Retention Score</span>
          <p className="font-mono text-2xl font-bold text-emerald-400 mt-1">
            {result.reasoning_retention_score.toFixed(1)} / 100
          </p>
        </motion.div>
      )}

      {/* Interactive Split-Screen Diff Viewer */}
      <motion.div variants={slideUp}>
        <DiffViewer 
          originalText={result.original_text}
          compressedText={result.compressed_text}
          originalTokens={originalTokens}
          compressedTokens={compressedTokens}
        />
      </motion.div>

      {/* Completion confirmation */}
      <motion.div variants={slideUp} className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>
          Compression saved to history · ID: <span className="font-mono">{result.id}</span>
        </span>
      </motion.div>

      {/* Charts Section: Illustrative Cost Comparison */}
      <motion.div variants={slideUp} className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold font-heading text-white">
              API Cost Reduction per 1,000 Requests
            </h3>
            <p className="text-xs text-muted">
              Illustrative comparison across LLM providers based on industry token pricing.{' '}
              <span className="text-zinc-500">(Not derived from this specific result)</span>
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
            ~72% Average Cost Cut
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ILLUSTRATIVE_COST_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="model" stroke="#A1A1AA" fontSize={11} tickLine={false} />
              <YAxis stroke="#A1A1AA" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111318', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '8px', color: '#FAFAFA' }}
                formatter={(val: unknown) => [`$${val}`, 'Cost per 1k runs']}
              />
              <Bar dataKey="uncompressedCost" name="Uncompressed" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="compressedCost" name="Compressed" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default ResultsPage;
