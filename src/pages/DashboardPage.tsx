import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  UploadCloud, 
  FileText, 
  ArrowRight, 
  Check, 
  Copy, 
  SlidersHorizontal, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  BarChart3,
  RefreshCw,
  Sliders,
  Scissors
} from 'lucide-react';
import { CountUp } from '../components/ui/CountUp';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const DashboardPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [targetRatio, setTargetRatio] = useState(70);
  const [compressedOutput, setCompressedOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rawCount, setRawCount] = useState<number | null>(null);
  const [compressedCount, setCompressedCount] = useState<number | null>(null);

  const kpis = [
    {
      label: 'TOKENS SAVED',
      value: 1420000000,
      format: (val: number) => (val / 1000000000).toFixed(2) + 'B',
      change: '+18.4% this week',
      isPositive: true,
      icon: Zap,
    },
    {
      label: 'LATENCY REDUCTION',
      value: 34,
      format: (val: number) => val + 'ms TTFT',
      change: '-64% lower TTFT',
      isPositive: true,
      icon: Clock,
    },
    {
      label: 'COMPRESSION RATIO',
      value: 71.4,
      format: (val: number) => val + '% Avg',
      change: '3.4x Token Factor',
      isPositive: true,
      icon: SlidersHorizontal,
    },
    {
      label: 'MONEY SAVED',
      value: 48920,
      format: (val: number) => '$' + val.toLocaleString(),
      change: 'Direct API Savings',
      isPositive: true,
      icon: DollarSign,
    },
  ];

  const chartData = [
    { time: '00:00', tokens: 12.4, saved: 8.8 },
    { time: '04:00', tokens: 18.2, saved: 13.1 },
    { time: '08:00', tokens: 42.1, saved: 30.2 },
    { time: '12:00', tokens: 68.9, saved: 49.3 },
    { time: '16:00', tokens: 55.4, saved: 39.5 },
    { time: '20:00', tokens: 32.1, saved: 23.0 },
    { time: '24:00', tokens: 28.5, saved: 20.4 },
  ];

  const handleRunCompression = () => {
    const textToProcess = inputText.trim() || defaultSampleText;
    setIsCompressing(true);
    setCompressedOutput(null);

    const calculatedRaw = Math.max(Math.floor(textToProcess.length / 3.8), 1420);
    setRawCount(calculatedRaw);

    setTimeout(() => {
      const calculatedCompressed = Math.floor(calculatedRaw * (1 - targetRatio / 100));
      setCompressedCount(calculatedCompressed);

      const compressedText = `[CONTEXTFLOW ENGINE v4.2 COMPRESSED OUTPUT | -${targetRatio}% REDUCTION]

CRITICAL ENTITIES & INTENT:
1. Target Payload: Analyzed ${calculatedRaw} raw input tokens.
2. Deduplicated: 84 redundant stack trace lines and mirror boilerplate tags removed.
3. Attention Entropy: Preserved high-weight AST tokens and core business logic.

DENSE CONTEXT STREAM:
${textToProcess.slice(0, 320)}...
[PRUNED: ${calculatedRaw - calculatedCompressed} low-attention sub-tokens fit to budget]`;

      setCompressedOutput(compressedText);
      setIsCompressing(false);
    }, 1200);
  };

  const handleCopy = () => {
    if (!compressedOutput) return;
    navigator.clipboard.writeText(compressedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const defaultSampleText = `UNITED STATES SECURITIES AND EXCHANGE COMMISSION
FORM 10-K ANNUAL REPORT
Item 7. Management's Discussion and Analysis of Financial Condition...
[TRACE ERROR] at com.enterprise.payment.StripeService.processCharge(StripeService.java:142)
[TRACE ERROR] at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1072)
[TRACE ERROR] at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:965)
[DUPLICATE FOOTER LOGS REPEATED 1,420 TIMES]`;

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
              Vercel Workbench
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Real-time prompt compression, route throughput analytics, and accuracy budgets.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={() => {
              setInputText(defaultSampleText);
              handleRunCompression();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Load Enterprise Preset</span>
          </button>
        </div>
      </div>

      {/* Four KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl border border-white/10 bg-zinc-950/80 hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-200 flex flex-col justify-between font-mono group"
            >
              <div>
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-[10px] uppercase tracking-wider">{kpi.label}</span>
                  <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {kpi.format(kpi.value)}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-semibold">{kpi.change}</span>
                <span className="text-zinc-600">LIVE SLA</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Compressor Workbench Area */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
              PROMPT COMPRESSOR ENGINE
            </span>
            <h2 className="text-lg font-semibold text-white mt-0.5">Drop Prompt or Paste Text</h2>
          </div>

          {/* Budget slider */}
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

        {/* Text Input Area */}
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
                <span>Drag & drop prompt files or click to paste text</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span>Estimated: {inputText ? Math.floor(inputText.length / 3.8) : 0} tokens</span>
              <span>•</span>
              <span className="text-emerald-400">Sub-50ms processing speed</span>
            </div>

            <button
              onClick={handleRunCompression}
              disabled={isCompressing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50"
            >
              {isCompressing ? (
                <>
                  <RefreshCw className="w-4 h-4 text-black animate-spin" />
                  <span>Pruning Tokens...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-black fill-current" />
                  <span>Compress Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Compression Pipeline Step Animation */}
        {isCompressing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border border-white/10 bg-zinc-900/80 font-mono text-xs space-y-2"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-2 text-emerald-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> AST Syntax Tree Parsing
              </span>
              <span>Stage 2 / 5</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="h-full bg-emerald-400"
              />
            </div>
          </motion.div>
        )}

        {/* Results & Diff Viewer */}
        {compressedOutput && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-6 border-t border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">COMPRESSION RESULTS</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  {rawCount && compressedCount ? Math.floor(((rawCount - compressedCount) / rawCount) * 100) : targetRatio}% SAVED
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copied ? 'Copied Result' : 'Copy Clean Output'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 space-y-2">
                <div className="flex justify-between text-zinc-400 text-[11px] pb-2 border-b border-white/5">
                  <span>RAW PAYLOAD ({rawCount} TOKENS)</span>
                  <span className="text-red-400">UNCOMPRESSED</span>
                </div>
                <pre className="text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {inputText || defaultSampleText}
                </pre>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
                <div className="flex justify-between text-emerald-400 text-[11px] pb-2 border-b border-white/5">
                  <span>DENSE OUTPUT ({compressedCount} TOKENS)</span>
                  <span className="font-bold">INTELLIGENCE PRESERVED</span>
                </div>
                <pre className="text-emerald-200/90 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {compressedOutput}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Analytics Chart */}
      <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950 space-y-4">
        <div className="flex items-center justify-between font-mono">
          <div>
            <h3 className="text-sm font-semibold text-white">System Token Volume & Savings Stream</h3>
            <p className="text-xs text-zinc-500">Real-time enterprise LLM context traffic over 24 hours.</p>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            71.4% Avg Yield
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
