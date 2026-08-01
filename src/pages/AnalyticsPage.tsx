import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Coins, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const volumeData = [
    { day: 'Mon', raw: 142, compressed: 40 },
    { day: 'Tue', raw: 185, compressed: 52 },
    { day: 'Wed', raw: 210, compressed: 58 },
    { day: 'Thu', raw: 245, compressed: 69 },
    { day: 'Fri', raw: 290, compressed: 81 },
    { day: 'Sat', raw: 160, compressed: 45 },
    { day: 'Sun', raw: 120, compressed: 34 },
  ];

  const modelCostData = [
    { model: 'GPT-4o', rawCost: 18400, compressedCost: 5150 },
    { model: 'Claude 3.5', rawCost: 14200, compressedCost: 3980 },
    { model: 'Gemini 1.5 Pro', rawCost: 9800, compressedCost: 2740 },
    { model: 'Llama 3 70B', rawCost: 4500, compressedCost: 1260 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 font-sans"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 font-mono">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1 text-xs text-emerald-400 mb-2">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>ROI & Performance Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Analytics & Token Economies
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track enterprise prompt compression volume, cost savings, response latency gains, and accuracy benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-950 border border-white/10 px-3 py-1.5 rounded-xl">
          <span>Timeframe:</span>
          <span className="text-white font-bold">Last 30 Days</span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl border border-white/10 bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-[10px]">
            <span>TOTAL TOKENS REDUCED</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight my-2">42.8M</div>
          <div className="text-[10px] text-emerald-400 font-semibold">+18.4% vs last month</div>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-[10px]">
            <span>NET COST SAVINGS</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 tracking-tight my-2">$14,290</div>
          <div className="text-[10px] text-zinc-400">Direct API bill reduction</div>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-[10px]">
            <span>RESPONSE LATENCY GAIN</span>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight my-2">220ms</div>
          <div className="text-[10px] text-emerald-400 font-semibold">-65% faster TTFT</div>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-[10px]">
            <span>EVAL ACCURACY RETAINED</span>
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight my-2">98.6%</div>
          <div className="text-[10px] text-zinc-400">Zero reasoning degradation</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-mono">
        
        {/* Chart 1: Token Volume Stream */}
        <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Weekly Compression Volume (K Tokens)</h3>
              <p className="text-xs text-zinc-500">Uncompressed payload vs ContextFlow compressed payload.</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              71.4% Avg
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#52525B" fontSize={10} />
                <YAxis stroke="#52525B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090B',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="raw" stroke="#EF4444" fillOpacity={1} fill="url(#colorRaw)" name="Uncompressed Tokens" />
                <Area type="monotone" dataKey="compressed" stroke="#10B981" fillOpacity={1} fill="url(#colorComp)" name="Compressed Output" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cost Savings by Model */}
        <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Cost Reduction by LLM Route ($)</h3>
              <p className="text-xs text-zinc-500">Direct per-model API spending comparison.</p>
            </div>
            <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded border border-white/10">
              4 Model Routes
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelCostData}>
                <XAxis dataKey="model" stroke="#52525B" fontSize={10} />
                <YAxis stroke="#52525B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090B',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="rawCost" fill="#3F3F46" radius={[4, 4, 0, 0]} name="Raw Cost ($)" />
                <Bar dataKey="compressedCost" fill="#10B981" radius={[4, 4, 0, 0]} name="Compressed Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default AnalyticsPage;
