import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  UploadCloud,
  Check,
  Copy,
  SlidersHorizontal,
  DollarSign,
  Clock,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Timer,
  Activity,
  Brain,
  Gauge,
  Layers,
  Percent,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { CompressionResult } from '../types';
import { CompressionPipeline } from '../components/CompressionPipeline';
import { ReasoningGauge } from '../components/ReasoningGauge';
import { useCompressionRun } from '../hooks/useCompressionRun';

interface KpiData {
  tokensSaved: number;
  avgCompressionRatio: number;
  totalCostSaved: number;
  runCount: number;
  avgReasoningRetention: number | null;
  avgCostSaved: number;
  avgLatencyReductionPct: number | null;
}

type CompressionRow = Pick<
  CompressionResult,
  | 'original_token_count'
  | 'compressed_token_count'
  | 'compression_ratio'
  | 'cost_saved'
  | 'reasoning_retention_score'
  | 'latency_original_ms'
  | 'latency_compressed_ms'
>;

const COMPRESSION_KPI_COLUMNS =
  'original_token_count, compressed_token_count, compression_ratio, cost_saved, reasoning_retention_score, latency_original_ms, latency_compressed_ms';

const computeKpis = (rows: CompressionRow[]): KpiData => {
  if (rows.length === 0) {
    return {
      tokensSaved: 0,
      avgCompressionRatio: 0,
      totalCostSaved: 0,
      runCount: 0,
      avgReasoningRetention: null,
      avgCostSaved: 0,
      avgLatencyReductionPct: null,
    };
  }

  const tokensSaved = rows.reduce((sum, r) => sum + (r.original_token_count - r.compressed_token_count), 0);
  const avgRatio = rows.reduce((sum, r) => sum + (r.compression_ratio ?? 0), 0) / rows.length;
  const totalCost = rows.reduce((sum, r) => sum + (r.cost_saved ?? 0), 0);

  const retentionRows = rows.filter((r) => r.reasoning_retention_score != null);
  const avgReasoningRetention =
    retentionRows.length > 0
      ? retentionRows.reduce((sum, r) => sum + (r.reasoning_retention_score as number), 0) / retentionRows.length
      : null;

  const latencyRows = rows.filter(
    (r) => r.latency_original_ms != null && r.latency_compressed_ms != null && r.latency_original_ms > 0
  );
  const avgLatencyReductionPct =
    latencyRows.length > 0
      ? (latencyRows.reduce(
          (sum, r) => sum + (r.latency_original_ms! - r.latency_compressed_ms!) / r.latency_original_ms!,
          0
        ) /
          latencyRows.length) *
        100
      : null;

  return {
    tokensSaved,
    avgCompressionRatio: avgRatio,
    totalCostSaved: totalCost,
    runCount: rows.length,
    avgReasoningRetention,
    avgCostSaved: totalCost / rows.length,
    avgLatencyReductionPct,
  };
};

const defaultSampleText = `UNITED STATES SECURITIES AND EXCHANGE COMMISSION
FORM 10-K ANNUAL REPORT
Item 7. Management's Discussion and Analysis of Financial Condition...
[TRACE ERROR] at com.enterprise.payment.StripeService.processCharge(StripeService.java:142)
[TRACE ERROR] at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1072)
[TRACE ERROR] at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:965)
[DUPLICATE FOOTER LOGS REPEATED 1,420 TIMES]`;

const chartData = [
  { time: '00:00', tokens: 12.4, saved: 8.8 },
  { time: '04:00', tokens: 18.2, saved: 13.1 },
  { time: '08:00', tokens: 42.1, saved: 30.2 },
  { time: '12:00', tokens: 68.9, saved: 49.3 },
  { time: '16:00', tokens: 55.4, saved: 39.5 },
  { time: '20:00', tokens: 32.1, saved: 23.0 },
  { time: '24:00', tokens: 28.5, saved: 20.4 },
];

export const DashboardPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [targetRatio, setTargetRatio] = useState(70);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [compressError, setCompressError] = useState<string | null>(null);
  const pipeline = useCompressionRun();

  // Real KPI data from Supabase
  const [kpi, setKpi] = useState<KpiData>(computeKpis([]));
  const [kpiLoading, setKpiLoading] = useState(true);

  const refreshKpis = async () => {
    const { data, error } = await supabase.from('compressions').select(COMPRESSION_KPI_COLUMNS).eq('status', 'completed');
    if (!error && data) {
      setKpi(computeKpis(data as CompressionRow[]));
    }
  };

  useEffect(() => {
    setKpiLoading(true);
    refreshKpis().finally(() => setKpiLoading(false));
  }, []);

  const handleRunCompression = async () => {
    const textToProcess = inputText.trim() || defaultSampleText;
    if (!textToProcess) return;

    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      setCompressError('VITE_N8N_WEBHOOK_URL is not set in .env');
      return;
    }

    setCompressionResult(null);
    setCompressError(null);

    try {
      const result = await pipeline.run(textToProcess, targetRatio, webhookUrl);
      setCompressionResult(result);
      await refreshKpis();
    } catch (err: unknown) {
      console.error('[n8n webhook] compression failed:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setCompressError(`Compression failed: ${msg}`);
    }
  };

  const handleCopy = () => {
    if (!compressionResult?.compressed_text) return;
    navigator.clipboard.writeText(compressionResult.compressed_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTokensSaved = (n: number) => {
    if (n === 0) return '0';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  };

  const reductionPct = compressionResult
    ? compressionResult.compression_ratio.toFixed(1)
    : null;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              Enterprise Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-emerald-400 border border-white/10">
              Live
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Real-time prompt compression, route throughput analytics, and accuracy budgets.
          </p>
        </div>

        <button
          onClick={() => {
            setInputText(defaultSampleText);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all text-xs font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Load Enterprise Sample</span>
        </button>
      </div>

      {/* Four KPI Cards — real Supabase data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tokens Saved */}
        <div className="p-5 rounded-xl border border-white/10 bg-zinc-950/80 hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-200 flex flex-col justify-between font-mono group">
          <div>
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] uppercase tracking-wider">Tokens Saved</span>
              <Zap className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {kpiLoading ? <span className="text-zinc-600 text-sm">Loading...</span> : formatTokensSaved(kpi.tokensSaved)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
            <span className="text-emerald-400 font-semibold">
              {kpi.runCount > 0 ? `${kpi.runCount} compressions` : 'No runs yet'}
            </span>
            <span className="text-zinc-600">LIVE</span>
          </div>
        </div>

        {/* Avg Compression Ratio */}
        <div className="p-5 rounded-xl border border-white/10 bg-zinc-950/80 hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-200 flex flex-col justify-between font-mono group">
          <div>
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] uppercase tracking-wider">Compression Ratio</span>
              <SlidersHorizontal className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {kpiLoading
                ? <span className="text-zinc-600 text-sm">Loading...</span>
                : kpi.avgCompressionRatio > 0
                ? `${kpi.avgCompressionRatio.toFixed(1)}% Avg`
                : '—'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
            <span className="text-emerald-400 font-semibold">
              {kpi.avgCompressionRatio > 0 ? `${(100 / (100 - kpi.avgCompressionRatio)).toFixed(1)}x Token Factor` : 'No data yet'}
            </span>
            <span className="text-zinc-600">LIVE</span>
          </div>
        </div>

        {/* Money Saved */}
        <div className="p-5 rounded-xl border border-white/10 bg-zinc-950/80 hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-200 flex flex-col justify-between font-mono group">
          <div>
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] uppercase tracking-wider">Money Saved</span>
              <DollarSign className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {kpiLoading
                ? <span className="text-zinc-600 text-sm">Loading...</span>
                : kpi.totalCostSaved > 0
                ? `$${kpi.totalCostSaved.toFixed(5)}`
                : '$0'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
            <span className="text-emerald-400 font-semibold">Direct API Savings</span>
            <span className="text-zinc-600">LIVE</span>
          </div>
        </div>

        {/* Latency — static illustrative metric */}
        <div className="p-5 rounded-xl border border-white/10 bg-zinc-950/80 hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-200 flex flex-col justify-between font-mono group">
          <div>
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-[10px] uppercase tracking-wider">Latency Reduction</span>
              <Clock className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">~64% faster</div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
            <span className="text-emerald-400 font-semibold">Lower TTFT</span>
            <span className="text-zinc-600 italic">Illustrative</span>
          </div>
        </div>
      </div>

      {/* Live Compression Metrics — additional real Supabase aggregates, beside the marketing dashboard above */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live Compression Metrics — Supabase</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
          {[
            {
              label: 'Total Compressions',
              icon: Layers,
              value: kpi.runCount > 0 ? kpi.runCount.toLocaleString() : '—',
            },
            {
              label: 'Avg Compression Ratio',
              icon: Percent,
              value: kpi.avgCompressionRatio > 0 ? `${kpi.avgCompressionRatio.toFixed(1)}%` : '—',
            },
            {
              label: 'Avg Reasoning Retention',
              icon: Brain,
              value: kpi.avgReasoningRetention != null ? `${kpi.avgReasoningRetention.toFixed(1)}%` : 'N/A',
            },
            {
              label: 'Total Tokens Saved',
              icon: Zap,
              value: formatTokensSaved(kpi.tokensSaved),
            },
            {
              label: 'Avg Cost Saved',
              icon: DollarSign,
              value: kpi.runCount > 0 ? `$${kpi.avgCostSaved.toFixed(5)}` : '$0',
            },
            {
              label: 'Avg Latency Reduction',
              icon: Timer,
              value: kpi.avgLatencyReductionPct != null ? `${kpi.avgLatencyReductionPct.toFixed(1)}%` : 'N/A',
            },
          ].map((m) => (
            <div
              key={m.label}
              className="p-3.5 rounded-xl border border-white/10 bg-zinc-950/60 hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between text-zinc-500 mb-1.5">
                <span className="text-[9px] uppercase tracking-wider leading-tight">{m.label}</span>
                <m.icon className="w-3.5 h-3.5 shrink-0" />
              </div>
              <div className="text-base font-bold text-white">
                {kpiLoading ? <span className="text-zinc-600 text-xs">...</span> : m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Compressor Workbench */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
              PROMPT COMPRESSOR ENGINE
            </span>
            <h2 className="text-lg font-semibold text-white mt-0.5">Drop Prompt or Paste Text</h2>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-mono text-zinc-300">
            <span>Compression Budget:</span>
            <input
              type="range"
              min="30"
              max="85"
              value={targetRatio}
              onChange={(e) => setTargetRatio(Number(e.target.value))}
              className="w-28 accent-white cursor-pointer"
            />
            <span className="font-semibold text-emerald-400">-{targetRatio}%</span>
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw LLM context, RAG database dumps, multi-page PDFs, or system logs here..."
              rows={5}
              className="w-full bg-zinc-900/60 border border-white/10 rounded-xl p-4 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all leading-relaxed resize-y"
            />
            {!inputText && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-zinc-500 text-xs font-mono gap-2">
                <UploadCloud className="w-6 h-6 text-zinc-600" />
                <span>Drag &amp; drop prompt files or click to paste text</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span>Estimated: {inputText ? Math.floor(inputText.length / 3.8) : 0} tokens</span>
              <span>•</span>
              <span className="text-emerald-400">Real n8n compression</span>
            </div>

            <button
              onClick={handleRunCompression}
              disabled={pipeline.isRunning}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pipeline.isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compressing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Compress Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real n8n pipeline visualization — always visible, states driven by useCompressionRun */}
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/50">
          <CompressionPipeline
            stages={pipeline.stages}
            activeIndex={pipeline.activeIndex}
            statusLabel={pipeline.statusLabel}
            elapsedMs={pipeline.elapsedMs}
            estimatedTokens={pipeline.estimatedTokens}
            errorMessage={pipeline.errorMessage}
          />
        </div>

        {/* Error banner */}
        {compressError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-400 font-mono"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{compressError}</span>
          </motion.div>
        )}

        {/* Compression Results — real data */}
        {compressionResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-6 border-t border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">COMPRESSION RESULTS</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  {reductionPct}% SAVED
                </span>
                {compressionResult.status === 'below_target' && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
                    Below 70% target
                  </span>
                )}
                {compressionResult.status === 'input_too_short' && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
                    Input too short
                  </span>
                )}
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copied ? 'Copied!' : 'Copy Output'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
              {/* Raw Payload */}
              <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 space-y-2">
                <div className="flex justify-between text-zinc-400 text-[11px] pb-2 border-b border-white/5">
                  <span>RAW PAYLOAD ({compressionResult.original_token_count.toLocaleString()} TOKENS)</span>
                  <span className="text-rose-400">UNCOMPRESSED</span>
                </div>
                <pre className="text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto text-[11px]">
                  {compressionResult.original_text}
                </pre>
              </div>

              {/* Dense Output */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
                <div className="flex justify-between text-emerald-400 text-[11px] pb-2 border-b border-white/5">
                  <span>DENSE OUTPUT ({compressionResult.compressed_token_count.toLocaleString()} TOKENS)</span>
                  <span className="font-bold">INTELLIGENCE PRESERVED</span>
                </div>
                <pre className="text-emerald-200/90 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto text-[11px]">
                  {compressionResult.compressed_text}
                </pre>
              </div>
            </div>

            {/* Backend-driven metrics strip: ratio, cost, latency before/after, status */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg border border-white/10 bg-zinc-900/60">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Compression Ratio</span>
                <span className="text-sm font-bold text-emerald-400">{compressionResult.compression_ratio.toFixed(1)}%</span>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-zinc-900/60">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Cost Saved</span>
                <span className="text-sm font-bold text-white">${compressionResult.cost_saved.toFixed(5)}</span>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-zinc-900/60">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Latency Before</span>
                <span className="text-sm font-bold text-rose-400">
                  {compressionResult.latency_original_ms != null ? `${compressionResult.latency_original_ms}ms` : 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-zinc-900/60">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Latency After</span>
                <span className="text-sm font-bold text-emerald-400">
                  {compressionResult.latency_compressed_ms != null ? `${compressionResult.latency_compressed_ms}ms` : 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-zinc-900/60">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Status</span>
                <span className="text-sm font-bold text-white capitalize">{compressionResult.status.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {/* Reasoning Retention Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReasoningGauge score={null} label="Original Reasoning Score" icon={Brain} />
              <ReasoningGauge
                score={compressionResult.reasoning_retention_score}
                label="Compressed Reasoning Retention"
                icon={Gauge}
              />
            </div>

            {/* Cost saved chip */}
            <p className="text-[10px] font-mono text-zinc-500">
              Est. cost saved this request:{' '}
              <span className="text-emerald-400 font-semibold">${compressionResult.cost_saved.toFixed(5)}</span>
              {' '}· ID: <span className="text-zinc-400">{compressionResult.id}</span>
            </p>
          </motion.div>
        )}
      </div>

      {/* Analytics Chart — illustrative */}
      <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950 space-y-4">
        <div className="flex items-center justify-between font-mono">
          <div>
            <h3 className="text-sm font-semibold text-white">System Token Volume &amp; Savings Stream</h3>
            <p className="text-xs text-zinc-500">
              Illustrative 24-hour enterprise LLM context traffic pattern.
            </p>
          </div>
          <span className="text-xs text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded border border-white/10 italic font-mono">
            Illustrative
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#52525B" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="#52525B" fontSize={10} fontFamily="monospace" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090B',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              />
              <Area type="monotone" dataKey="tokens" stroke="#818CF8" fillOpacity={1} fill="url(#colorTokens)" name="Raw Tokens (M)" />
              <Area type="monotone" dataKey="saved" stroke="#10B981" fillOpacity={1} fill="url(#colorSaved)" name="Saved Tokens (M)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
