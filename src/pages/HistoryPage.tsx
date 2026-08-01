import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Download, Search, Filter, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const mockRuns = [
    {
      id: 'run_99210',
      name: 'SEC 10-K Earnings MD&A Report',
      model: 'GPT-4o',
      rawTokens: 108400,
      compressedTokens: 29800,
      savings: '72.5%',
      latency: '38ms',
      time: '10 mins ago',
      status: 'Completed',
    },
    {
      id: 'run_99209',
      name: 'Spring Microservices Trace Log Dump',
      model: 'Claude 3.5 Sonnet',
      rawTokens: 84200,
      compressedTokens: 23580,
      savings: '72.0%',
      latency: '24ms',
      time: '42 mins ago',
      status: 'Completed',
    },
    {
      id: 'run_99208',
      name: 'Customer Support 5-Year Ticket Context',
      model: 'Gemini 1.5 Pro',
      rawTokens: 96000,
      compressedTokens: 26880,
      savings: '72.0%',
      latency: '31ms',
      time: '2 hours ago',
      status: 'Completed',
    },
    {
      id: 'run_99207',
      name: 'PostgreSQL Query Planner AST Execution',
      model: 'GPT-4o',
      rawTokens: 64100,
      compressedTokens: 18589,
      savings: '71.0%',
      latency: '29ms',
      time: '5 hours ago',
      status: 'Completed',
    },
    {
      id: 'run_99206',
      name: 'React 19 Server Components Codebase',
      model: 'Claude 3.5 Sonnet',
      rawTokens: 142000,
      compressedTokens: 38340,
      savings: '73.0%',
      latency: '45ms',
      time: '1 day ago',
      status: 'Completed',
    },
  ];

  const filteredRuns = mockRuns.filter((run) => {
    const matchesSearch =
      run.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.model.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'gpt4') return matchesSearch && run.model === 'GPT-4o';
    if (selectedFilter === 'claude') return matchesSearch && run.model === 'Claude 3.5 Sonnet';
    return matchesSearch;
  });

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
            <History className="h-3.5 w-3.5" />
            <span>Audit Trail & Historical Execution Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Compression Run History
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete audit archive of all context compression requests executed across enterprise LLM pipelines.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting audit log CSV...')}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-all font-mono"
        >
          <Download className="h-4 w-4 text-emerald-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Table Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter runs by prompt or model..."
            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'gpt4', 'claude'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                selectedFilter === filter
                  ? 'bg-white text-black font-bold border-white'
                  : 'bg-zinc-950 text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              {filter === 'all' ? 'All Models' : filter === 'gpt4' ? 'GPT-4o' : 'Claude 3.5'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Box */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden font-mono text-xs shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-zinc-900/60 text-zinc-400">
                <th className="p-4">RUN ID</th>
                <th className="p-4">PROMPT NAME</th>
                <th className="p-4">MODEL ROUTE</th>
                <th className="p-4 text-right">RAW TOKENS</th>
                <th className="p-4 text-right">COMPRESSED</th>
                <th className="p-4 text-right">SAVINGS</th>
                <th className="p-4 text-right">LATENCY</th>
                <th className="p-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {filteredRuns.map((run) => (
                <tr key={run.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-4 font-bold text-white">{run.id}</td>
                  <td className="p-4 text-white font-medium">{run.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white">
                      {run.model}
                    </span>
                  </td>
                  <td className="p-4 text-right text-zinc-400">{run.rawTokens.toLocaleString()}</td>
                  <td className="p-4 text-right text-emerald-400 font-semibold">
                    {run.compressedTokens.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {run.savings}
                    </span>
                  </td>
                  <td className="p-4 text-right text-zinc-400">{run.latency}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Passed</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default HistoryPage;
