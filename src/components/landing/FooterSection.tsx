import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, GitBranch, Shield, ArrowUpRight } from 'lucide-react';

export const FooterSection: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#08090A] py-16 px-6 text-xs text-zinc-400 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-3">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-sm tracking-tight">
            <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <span>ContextFlow AI</span>
          </Link>
          <p className="text-zinc-500 max-w-sm text-center md:text-left leading-relaxed">
            Enterprise Context Compression Engine. Reduce LLM token overhead by 70% with zero reasoning loss.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-zinc-400">
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <a href="#pipeline" className="hover:text-white transition-colors">
            Pipeline
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
            <span>GitHub</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-500" />
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Docs
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
        <span>© {new Date().getFullYear()} ContextFlow AI, Inc. All rights reserved.</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>All Enterprise Systems Operational</span>
        </div>
      </div>
    </footer>
  );
};
