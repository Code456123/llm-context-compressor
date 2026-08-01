import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, Settings, LogOut, ChevronDown } from 'lucide-react';
import { LightningLogo } from '../ui/LightningLogo';
import { glow, pulse } from '../../animations/variants';
import { useAuth } from '../../lib/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const userEmail = user?.email ?? '';
  const avatarInitial = userEmail ? userEmail[0].toUpperCase() : 'U';

  const handleLogout = async () => {
    setShowDropdown(false);
    await signOut();
    navigate('/signin', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#08090A]/90 backdrop-blur-xl h-14">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">

        {/* Left: Brand logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              variants={glow}
              initial="initial"
              animate="animate"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black font-bold text-xs shadow-md"
            >
              <LightningLogo className="h-4 w-4" />
            </motion.div>
            <motion.span
              variants={pulse}
              animate="animate"
              className="font-bold text-sm text-white tracking-tight"
            >
              ContextFlow <span className="text-[10px] font-mono text-zinc-400 font-normal">/ Enterprise</span>
            </motion.span>
          </Link>
        </div>

        {/* Center: Search Bar (Vercel Command Bar) */}
        <div className="hidden md:flex items-center w-full max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search prompts, routes, or metrics..."
              className="w-full bg-zinc-950/80 border border-white/10 rounded-lg pl-9 pr-12 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all font-mono"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-zinc-400 border border-white/10">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right: Notifications, Status, Profile */}
        <div className="flex items-center gap-3">
          {/* Engine Status */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-[11px] font-mono text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>v4.2 Active</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-zinc-950 p-3 shadow-2xl z-50 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                  <span className="text-white font-semibold">Notifications</span>
                  <span className="text-[10px] text-zinc-500">2 New</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 space-y-1">
                    <p className="text-white text-[11px]">System Compression Peak</p>
                    <p className="text-zinc-500 text-[10px]">Saved 4.2M tokens in last prompt batch.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 space-y-1">
                    <p className="text-emerald-400 text-[11px]">GPT-4o Route Optimized</p>
                    <p className="text-zinc-500 text-[10px]">Latency reduced by 42ms.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-white/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center border border-white/20">
                {avatarInitial}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-zinc-950 p-1.5 shadow-2xl z-50 text-xs font-mono">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="font-semibold text-white">Signed In</p>
                  <p className="text-[10px] text-zinc-400 truncate">{userEmail}</p>
                </div>
                <Link
                  to="/dashboard/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white transition-colors mt-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
