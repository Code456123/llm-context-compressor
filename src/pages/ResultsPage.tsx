import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ArrowLeft, 
  Copy, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  TrendingDown, 
  BarChart2, 
  Coins, 
  Clock,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { DiffViewer } from '../components/DiffViewer';
import { 
  SAMPLE_ORIGINAL_PROMPT, 
  SAMPLE_COMPRESSED_PROMPT, 
  MOCK_EXPLANATION_CARDS,
  MOCK_MODEL_COMPARISON
} from '../constants/mockData';
import { fadeIn, slideUp, staggerContainer } from '../animations/variants';

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();

  const originalTokens = 108000;
  const compressedTokens = 31000;
  const savedTokens = originalTokens - compressedTokens;
  const reductionPercent = 71.3;
  const costSaved = '$1.54 / request';

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl mx-auto"
    >
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <button 
            onClick={() => navigate('/dashboard/upload')}
            className="inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Upload Studio</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Compression Results & Diff Analysis
            </h1>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
              71.3% Tokens Reduced
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigator.clipboard.writeText(SAMPLE_COMPRESSED_PROMPT)}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white shadow-card-glow hover:bg-accent-hover transition-all"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Compressed Prompt</span>
          </button>

          <button 
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-card-hover hover:text-white transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export Diff JSON</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-mono uppercase text-muted">Original Payload</span>
          <p className="font-mono text-2xl font-bold text-rose-400 mt-1">{originalTokens.toLocaleString()} <span className="text-xs text-muted">tokens</span></p>
        </div>
        <div className="rounded-xl border border-accent/40 bg-card p-4 shadow-card-glow">
          <span className="text-xs font-mono uppercase text-accent">Compressed Payload</span>
          <p className="font-mono text-2xl font-bold text-emerald-400 mt-1">{compressedTokens.toLocaleString()} <span className="text-xs text-muted">tokens</span></p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-mono uppercase text-muted">Tokens Saved</span>
          <p className="font-mono text-2xl font-bold text-purple-400 mt-1">{savedTokens.toLocaleString()} <span className="text-xs text-muted">(-71.3%)</span></p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-mono uppercase text-muted">Est. Cost Savings</span>
          <p className="font-mono text-2xl font-bold text-white mt-1">{costSaved}</p>
        </div>
      </div>

      {/* Interactive Split-Screen Diff Viewer Component */}
      <DiffViewer 
        originalText={SAMPLE_ORIGINAL_PROMPT}
        compressedText={SAMPLE_COMPRESSED_PROMPT}
        originalTokens={originalTokens}
        compressedTokens={compressedTokens}
      />

      {/* AI Explanation Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="text-lg font-bold font-heading text-white">AI Pruning Rationale & Explanation</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_EXPLANATION_CARDS.map((card) => (
            <div 
              key={card.id} 
              className={`rounded-xl border p-4 space-y-3 bg-card ${
                card.type === 'removed' 
                  ? 'border-rose-500/30' 
                  : card.type === 'kept' 
                  ? 'border-emerald-500/30' 
                  : 'border-accent/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  card.type === 'removed' 
                    ? 'bg-rose-500/15 text-rose-400' 
                    : card.type === 'kept' 
                    ? 'bg-emerald-500/15 text-emerald-400' 
                    : 'bg-accent/15 text-accent'
                }`}>
                  {card.type === 'removed' ? 'Boilerplate Removed' : card.type === 'kept' ? 'Exception Kept' : 'Code Preserved'}
                </span>
                <span className="text-[10px] font-mono text-muted">Weight: {card.impactScore}%</span>
              </div>

              <h4 className="text-xs font-bold text-white font-sans">{card.title}</h4>
              <p className="text-[11px] font-mono text-zinc-400 bg-zinc-950 p-2 rounded border border-border/40 truncate">
                "{card.snippet}"
              </p>
              <p className="text-xs text-muted leading-relaxed">
                {card.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section: Provider Cost Comparison */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-white">API Cost Reduction per 1,000 Requests</h3>
            <p className="text-xs text-muted">Comparison across top LLM providers (Uncompressed vs ContextFlow Compressed).</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
            Average 72% Cost Cut
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_MODEL_COMPARISON} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="model" stroke="#A1A1AA" fontSize={11} tickLine={false} />
              <YAxis stroke="#A1A1AA" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111318', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '8px', color: '#FAFAFA' }}
                formatter={(val: any) => [`$${val}`, 'Cost per 1k runs']}
              />
              <Bar dataKey="uncompressedCost" name="Uncompressed Cost" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="compressedCost" name="Compressed Cost" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </motion.div>
  );
};
