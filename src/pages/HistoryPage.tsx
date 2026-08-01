import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Download, Search, CheckCircle2, Loader2, AlertTriangle, Inbox } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { N8nResult } from '../types';

export const HistoryPage: React.FC = () => {
  const [runs, setRuns] = useState<N8nResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('compressions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (sbError) {
        setError(sbError.message);
      } else {
        setRuns((data as N8nResult[]) ?? []);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, []);

  const filteredRuns = runs.filter((run) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      run.id?.toLowerCase().includes(q) ||
      run.status?.toLowerCase().includes(q) ||
      run.organisation?.toLowerCase().includes(q)
    );
  });

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
        </span>
      );
    }
    if (status === 'input_too_short') {
      return <span className="text-amber-400">Too Short</span>;
    }
    if (status === 'below_target') {
      return <span className="text-amber-400">Below Target</span>;
    }
    return <span className="text-zinc-400 capitalize">{status}</span>;
  };

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
            <span>Audit Trail &amp; Historical Execution Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Compression Run History
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete audit archive of all context compression requests executed.
          </p>
        </div>

        {runs.length > 0 && (
          <button
            onClick={() => {
              const csv = [
                ['id', 'created_at', 'original_tokens', 'compressed_tokens', 'compression_ratio', 'cost_saved', 'status'].join(','),
                ...runs.map((r) =>
                  [r.id, r.created_at, r.original_token_count, r.compressed_token_count, r.compression_ratio, r.cost_saved, r.status].join(',')
                ),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'compression-history.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-all font-mono"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80 font-mono text-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by ID, status, organisation..."
          className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-24 text-zinc-400 text-sm font-mono">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          <span>Fetching history from Supabase...</span>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-400 font-mono">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Failed to load history: {error}</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && runs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="rounded-full bg-white/5 p-5">
            <Inbox className="h-10 w-10 text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">No compressions yet</p>
            <p className="text-xs text-zinc-500 mt-1">
              Run your first compression from the Upload Studio to see it here.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && filteredRuns.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden font-mono text-xs shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-900/60 text-zinc-400">
                  <th className="p-4">ID</th>
                  <th className="p-4">CREATED AT</th>
                  <th className="p-4 text-right">ORIGINAL</th>
                  <th className="p-4 text-right">COMPRESSED</th>
                  <th className="p-4 text-right">RATIO</th>
                  <th className="p-4 text-right">COST SAVED</th>
                  <th className="p-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {filteredRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 font-bold text-white font-mono text-[11px]">
                      {run.id ? run.id.slice(0, 8) + '…' : '—'}
                    </td>
                    <td className="p-4 text-zinc-400">
                      {run.created_at ? formatDate(run.created_at) : '—'}
                    </td>
                    <td className="p-4 text-right text-zinc-400">
                      {run.original_token_count?.toLocaleString() ?? '—'}
                    </td>
                    <td className="p-4 text-right text-emerald-400 font-semibold">
                      {run.compressed_token_count?.toLocaleString() ?? '—'}
                    </td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {run.compression_ratio != null ? `${run.compression_ratio.toFixed(1)}%` : '—'}
                      </span>
                    </td>
                    <td className="p-4 text-right text-zinc-300">
                      {run.cost_saved != null ? `$${run.cost_saved.toFixed(5)}` : '—'}
                    </td>
                    <td className="p-4 text-center">
                      {statusBadge(run.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No search results */}
      {!isLoading && !error && runs.length > 0 && filteredRuns.length === 0 && (
        <div className="text-center py-12 text-sm text-zinc-500 font-mono">
          No runs match "<span className="text-white">{searchTerm}</span>"
        </div>
      )}
    </motion.div>
  );
};

export default HistoryPage;
