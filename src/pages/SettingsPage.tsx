import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Key,
  Save,
  Check,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  // ── Profile state — pre-filled from Supabase user metadata ──────────────
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileRole, setProfileRole] = useState('');
  const [profileCompany, setProfileCompany] = useState('');

  // ── Compression defaults (stored in user_metadata) ───────────────────────
  const [defaultBudgetRatio, setDefaultBudgetRatio] = useState(70);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [showKey, setShowKey] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Derived anon key — read-only display
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string ?? '';
  const maskedKey = anonKey ? anonKey.slice(0, 20) + '••••••••••••••••••••••••' : '—';

  // ── Load real user data on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata ?? {};
    setProfileName(meta.full_name ?? '');
    setProfileEmail(user.email ?? '');
    setProfileRole(meta.role_title ?? '');
    setProfileCompany(meta.company ?? '');
    setDefaultBudgetRatio(meta.default_budget_ratio ?? 70);
  }, [user]);

  // ── Save profile to Supabase ─────────────────────────────────────────────
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);

    const updates: Parameters<typeof supabase.auth.updateUser>[0] = {
      data: {
        full_name: profileName,
        role_title: profileRole,
        company: profileCompany,
      },
    };

    // Only include email if it changed
    if (profileEmail && profileEmail !== user?.email) {
      updates.email = profileEmail;
    }

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      setProfileError(error.message);
    } else {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
    setProfileSaving(false);
  };

  // ── Save compression defaults + profile together (top "Save Changes") ────
  const handleSaveAll = async () => {
    setSettingsSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: profileName,
        role_title: profileRole,
        company: profileCompany,
        default_budget_ratio: defaultBudgetRatio,
      },
    });

    if (!error) {
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    }
    setSettingsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 font-sans"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 font-mono">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-1 text-xs text-emerald-400 mb-2">
            <Settings className="h-3.5 w-3.5" />
            <span>Account &amp; Platform Controls</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Settings &amp; API Controls
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your personal profile details, enterprise role, API keys, and compression default parameters.
          </p>
        </div>

        {/* Top-level Save Changes — saves everything */}
        <button
          onClick={handleSaveAll}
          disabled={settingsSaving}
          className="flex items-center gap-2 rounded-xl bg-white text-black font-semibold px-5 py-2.5 text-xs hover:bg-zinc-200 transition-all font-mono shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {settingsSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : settingsSaved ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Save className="h-4 w-4 text-black" />
          )}
          <span>{settingsSaved ? 'All Saved!' : settingsSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="space-y-8 font-mono">

        {/* Section 1: Personal Profile */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <User className="h-4 w-4 text-emerald-400" />
              <span>Personal Profile</span>
            </div>
            {profileSaved && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-400">
                <Check className="h-3.5 w-3.5" /> Saved to Supabase
              </span>
            )}
          </div>

          {/* Error banner */}
          {profileError && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30 placeholder-zinc-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400">Work Email</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30 placeholder-zinc-600"
                />
                {profileEmail !== user?.email && (
                  <p className="text-[10px] text-amber-400 mt-1">⚠ Email change will update your login credentials</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400">Role Title</label>
                <input
                  type="text"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  placeholder="e.g. Staff AI Architect"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30 placeholder-zinc-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400">Organization</label>
                <input
                  type="text"
                  value={profileCompany}
                  onChange={(e) => setProfileCompany(e.target.value)}
                  placeholder="Your company name"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30 placeholder-zinc-600"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {profileSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : profileSaved ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : null}
                <span>{profileSaving ? 'Saving...' : profileSaved ? 'Updated!' : 'Update Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: API Key (read-only display) & Compression Defaults */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Key className="h-4 w-4 text-white" />
              <span>API Key &amp; Compression Defaults</span>
            </div>
            <span className="text-[10px] text-zinc-500">Supabase Anon Key</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* API Key — read only, just for display */}
            <div className="space-y-1">
              <label className="text-zinc-400">Supabase Anon Key (read-only)</label>
              <div className="relative">
                <input
                  readOnly
                  type={showKey ? 'text' : 'password'}
                  value={showKey ? anonKey : maskedKey}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-zinc-400 focus:outline-none cursor-default select-all"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 mt-1">Set via VITE_SUPABASE_ANON_KEY in your .env file</p>
            </div>

            {/* Compression default slider */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-zinc-400">Default Target Compression Ratio:</label>
                <span className="font-bold text-emerald-400">-{defaultBudgetRatio}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="85"
                value={defaultBudgetRatio}
                onChange={(e) => setDefaultBudgetRatio(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <p className="text-[10px] text-zinc-600">
                Saved to your profile · use "Save Changes" above to persist
              </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default SettingsPage;
