import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  UploadCloud, 
  FileText, 
  Code, 
  Terminal, 
  SlidersHorizontal, 
  Sparkles, 
  Check, 
  RotateCcw,
  ArrowRight,
  Info,
  Layers,
  Copy,
  Scissors
} from 'lucide-react';
import { CompressionMode } from '../types';
import { SAMPLE_ORIGINAL_PROMPT } from '../constants/mockData';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'text' | 'pdf' | 'logs' | 'code'>('text');
  const [promptText, setPromptText] = useState<string>(SAMPLE_ORIGINAL_PROMPT);
  const [selectedMode, setSelectedMode] = useState<CompressionMode>('balanced');
  const [targetRatio, setTargetRatio] = useState<number>(70);
  const [preserveCode, setPreserveCode] = useState(true);
  const [keepErrorLogs, setKeepErrorLogs] = useState(true);

  const estimatedTokens = Math.round(promptText.length / 3.8) || 0;
  const targetOutputTokens = Math.floor(estimatedTokens * (1 - targetRatio / 100));

  const handleStartCompression = () => {
    navigate('/dashboard/processing', {
      state: {
        mode: selectedMode,
        ratio: targetRatio,
        prompt: promptText,
        options: { preserveCode, keepErrorLogs }
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 font-sans"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 font-mono">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1 text-xs text-emerald-400 mb-2">
            <Zap className="h-3.5 w-3.5" />
            <span>Interactive Compression Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            New Context Compression
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Drop high-token system prompts, RAG database dumps, or microservice logs for AST-aware token reduction.
          </p>
        </div>

        <button 
          onClick={() => setPromptText(SAMPLE_ORIGINAL_PROMPT)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Load Stack Trace Sample</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Text Area & Format Selector */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Format Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              {[
                { id: 'text', label: 'Raw Prompt', icon: FileText },
                { id: 'pdf', label: 'PDF Document', icon: UploadCloud },
                { id: 'logs', label: 'Server Logs', icon: Terminal },
                { id: 'code', label: 'Code Base', icon: Code },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Text Editor */}
          <div className="space-y-3 font-mono">
            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={12}
                placeholder="Paste raw LLM context, RAG dumps, or API payload here..."
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-all leading-relaxed resize-y"
              />
              {promptText && (
                <button
                  onClick={() => setPromptText('')}
                  className="absolute top-4 right-4 text-xs text-zinc-500 hover:text-white"
                  title="Clear text"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-4">
                <span>Input Payload: <strong className="text-white font-mono">{estimatedTokens.toLocaleString()} Tokens</strong></span>
                <span>•</span>
                <span>Target: <strong className="text-emerald-400 font-mono">~{targetOutputTokens.toLocaleString()} Tokens</strong></span>
              </div>
              <button
                onClick={() => setPromptText(SAMPLE_ORIGINAL_PROMPT)}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Reset to Sample</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Compression Parameters */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-6 font-mono">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs text-zinc-300 font-bold uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-white" /> Engine Parameters
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">v4.2 ACTIVE</span>
            </div>

            {/* Strategy Mode Picker */}
            <div className="space-y-3">
              <label className="text-xs text-zinc-400">Compression Strategy</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lossless', name: 'Lossless', reduction: '30-40%' },
                  { id: 'balanced', name: 'Balanced', reduction: '65-75%' },
                  { id: 'aggressive', name: 'Aggressive', reduction: '80-90%' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id as CompressionMode)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedMode === mode.id
                        ? 'border-white bg-white text-black font-bold shadow-lg'
                        : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[11px]">{mode.name}</div>
                    <div className="text-[9px] text-zinc-500 mt-0.5">{mode.reduction}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Reduction Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Target Token Reduction:</span>
                <span className="font-bold text-emerald-400">-{targetRatio}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="85"
                value={targetRatio}
                onChange={(e) => setTargetRatio(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            {/* Options Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-zinc-400">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Preserve Code Syntax Trees</span>
                <input
                  type="checkbox"
                  checked={preserveCode}
                  onChange={(e) => setPreserveCode(e.target.checked)}
                  className="rounded border-white/10 bg-zinc-900 accent-white"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Keep Stack Trace Errors</span>
                <input
                  type="checkbox"
                  checked={keepErrorLogs}
                  onChange={(e) => setKeepErrorLogs(e.target.checked)}
                  className="rounded border-white/10 bg-zinc-900 accent-white"
                />
              </label>
            </div>

            {/* Action CTA Button */}
            <button
              onClick={handleStartCompression}
              className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              <Zap className="w-4 h-4 text-black fill-current" />
              <span>Execute Context Compression</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default UploadPage;
