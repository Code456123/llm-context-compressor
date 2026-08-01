import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertTriangle, ExternalLink, Zap } from 'lucide-react';
import { CompressionRun } from '../types';

interface HistoryTableProps {
  runs: CompressionRun[];
  showSearch?: boolean;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ runs, showSearch = true }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredRuns = runs.filter(run => {
    const matchesSearch = run.promptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          run.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = selectedMode === 'all' || run.mode === selectedMode;
    return matchesSearch && matchesMode;
  });

  const totalPages = Math.ceil(filteredRuns.length / itemsPerPage) || 1;
  const paginatedRuns = filteredRuns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full space-y-4">
      
      {/* Search & Filter Header controls */}
      {showSearch && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search prompt runs by title or LLM model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-zinc-300">
              <Filter className="h-3.5 w-3.5 text-muted" />
              <span>Mode:</span>
              <select 
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-card">All Modes</option>
                <option value="speed" className="bg-card">Speed</option>
                <option value="balanced" className="bg-card">Balanced</option>
                <option value="accuracy" className="bg-card">Accuracy</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            
            <thead className="border-b border-border bg-[#0D0F14] text-muted font-mono uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 font-medium">Prompt Context Name</th>
                <th className="px-4 py-3 font-medium">LLM Model</th>
                <th className="px-4 py-3 font-medium text-right">Tokens (Before → After)</th>
                <th className="px-4 py-3 font-medium text-right">Reduction</th>
                <th className="px-4 py-3 font-medium text-right">Accuracy</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {paginatedRuns.map((run) => (
                <tr 
                  key={run.id}
                  onClick={() => navigate('/dashboard/results')}
                  className="group hover:bg-card-hover/80 transition-colors cursor-pointer"
                >
                  
                  {/* Prompt Name & Date */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white group-hover:text-accent transition-colors">
                        {run.promptName}
                      </span>
                      <span className="text-[11px] font-mono text-muted mt-0.5">
                        {run.date} • ID: {run.id}
                      </span>
                    </div>
                  </td>

                  {/* Model & Mode Badge */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-300 font-medium">{run.model}</span>
                      <span className="rounded bg-accent/10 border border-accent/20 px-1.5 py-0.5 text-[10px] font-mono text-accent capitalize">
                        {run.mode}
                      </span>
                    </div>
                  </td>

                  {/* Token Count */}
                  <td className="px-4 py-3.5 text-right font-mono">
                    <span className="text-zinc-500 line-through mr-1">{run.originalTokens.toLocaleString()}</span>
                    <span className="text-white font-bold">{run.compressedTokens.toLocaleString()}</span>
                  </td>

                  {/* Reduction percentage */}
                  <td className="px-4 py-3.5 text-right font-mono">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-bold text-emerald-400">
                      -{run.reductionPercentage}%
                    </span>
                  </td>

                  {/* Accuracy retention */}
                  <td className="px-4 py-3.5 text-right font-mono text-zinc-300">
                    {run.reasoningRetention}%
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </span>
                  </td>

                  {/* View Details Action */}
                  <td className="px-4 py-3.5 text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/dashboard/results');
                      }}
                      className="inline-flex items-center gap-1 text-accent hover:text-white font-medium transition-colors"
                    >
                      <span>Diff</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </td>

                </tr>
              ))}

              {filteredRuns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted">
                    No compression runs found matching your search parameters.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-border bg-[#0D0F14] px-4 py-2.5 text-xs text-muted font-mono">
          <span>Showing {paginatedRuns.length} of {filteredRuns.length} compression runs</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1 rounded border border-border hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1 rounded border border-border hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
