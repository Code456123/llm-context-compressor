import React, { useState } from 'react';
import { Copy, Check, Eye, FileText, ArrowRight, Sparkles } from 'lucide-react';

interface DiffViewerProps {
  originalText: string;
  compressedText: string;
  originalTokens: number;
  compressedTokens: number;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalText,
  compressedText,
  originalTokens,
  compressedTokens
}) => {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedCompressed, setCopiedCompressed] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  const handleCopy = (text: string, type: 'original' | 'compressed') => {
    navigator.clipboard.writeText(text);
    if (type === 'original') {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedCompressed(true);
      setTimeout(() => setCopiedCompressed(false), 2000);
    }
  };

  const originalLines = originalText.split('\n');
  const compressedLines = compressedText.split('\n');

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-[#0D0F14] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <FileText className="h-4 w-4 text-accent" />
            <span>Interactive Prompt Comparison Diff</span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-2 text-xs font-mono text-muted">
            <span>Tokens:</span>
            <span className="text-rose-400 line-through font-semibold">{originalTokens.toLocaleString()}</span>
            <ArrowRight className="h-3 w-3 text-accent" />
            <span className="text-emerald-400 font-bold">{compressedTokens.toLocaleString()}</span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold">
              -{Math.round(((originalTokens - compressedTokens) / originalTokens) * 100)}%
            </span>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'split' ? 'unified' : 'split')}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{viewMode === 'split' ? 'Unified View' : 'Split Side-by-Side'}</span>
          </button>
        </div>
      </div>

      {/* Main Diff Content Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border font-mono text-xs">
        
        {/* Left Side: Original Context Prompt */}
        <div className="flex flex-col bg-[#09090B]/60">
          <div className="flex items-center justify-between border-b border-border/60 bg-zinc-950/80 px-4 py-2 text-muted">
            <span className="font-sans text-xs font-medium text-rose-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
              Original Prompt Context ({originalTokens.toLocaleString()} tokens)
            </span>
            <button
              onClick={() => handleCopy(originalText, 'original')}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
            >
              {copiedOriginal ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedOriginal ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          
          <div className="p-4 max-h-[500px] overflow-y-auto space-y-1 leading-relaxed text-zinc-300">
            {originalLines.map((line, i) => {
              const isBoilerplate = line.includes('INFO') || line.includes('SECTION 1') || line.includes('Company Security Policy');
              return (
                <div 
                  key={i} 
                  className={`flex gap-3 px-1.5 py-0.5 rounded ${
                    isBoilerplate ? 'diff-removed' : 'hover:bg-zinc-900/50'
                  }`}
                >
                  <span className="w-8 shrink-0 select-none text-right text-zinc-600">{i + 1}</span>
                  <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Compressed Prompt */}
        <div className="flex flex-col bg-[#0B0D12]">
          <div className="flex items-center justify-between border-b border-border/60 bg-zinc-950/80 px-4 py-2 text-muted">
            <span className="font-sans text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Compressed Prompt ({compressedTokens.toLocaleString()} tokens)
            </span>
            <button
              onClick={() => handleCopy(compressedText, 'compressed')}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
            >
              {copiedCompressed ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCompressed ? 'Copied' : 'Copy Clean'}</span>
            </button>
          </div>

          <div className="p-4 max-h-[500px] overflow-y-auto space-y-1 leading-relaxed text-zinc-200">
            {compressedLines.map((line, i) => (
              <div 
                key={i} 
                className="flex gap-3 px-1.5 py-0.5 rounded diff-kept"
              >
                <span className="w-8 shrink-0 select-none text-right text-emerald-600/60">{i + 1}</span>
                <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
