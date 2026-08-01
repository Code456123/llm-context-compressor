import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Mail, 
  Building2, 
  Key, 
  Save, 
  Check, 
  Eye, 
  EyeOff, 
  SlidersHorizontal, 
  ShieldCheck 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [profileName, setProfileName] = useState('Aryan Sharma');
  const [profileEmail, setProfileEmail] = useState('admin@contextflow.ai');
  const [profileRole, setProfileRole] = useState('Staff AI Architect');
  const [profileCompany, setProfileCompany] = useState('Nexus Enterprise Systems');
  const [profileSaved, setProfileSaved] = useState(false);

  const [apiKey, setApiKey] = useState('cf_live_998124091A_secret_x9981240');
  const [showKey, setShowKey] = useState(false);
  const [defaultStrategy, setDefaultStrategy] = useState('balanced');
  const [defaultBudgetRatio, setDefaultBudgetRatio] = useState(70);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleSaveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
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
            <span>Account & Platform Controls</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Settings & API Controls
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your personal profile details, enterprise role, API keys, and compression default parameters.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 rounded-xl bg-white text-black font-semibold px-5 py-2.5 text-xs hover:bg-zinc-200 transition-all font-mono shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        >
          {settingsSaved ? <Check className="h-4 w-4 text-emerald-600" /> : <Save className="h-4 w-4 text-black" />}
          <span>{settingsSaved ? 'Settings Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="space-y-8 font-mono">
        
        {/* Section 1: Edit Profile Card */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <User className="h-4 w-4 text-emerald-400" />
              <span>Personal Profile</span>
            </div>
            {profileSaved && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                Updated
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-400">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400">Work Email</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400">Role Title</label>
                <input
                  type="text"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400">Organization</label>
                <input
                  type="text"
                  value={profileCompany}
                  onChange={(e) => setProfileCompany(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all text-xs"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: API Keys & Compression Defaults */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Key className="h-4 w-4 text-white" />
              <span>Enterprise API Keys & Default Parameters</span>
            </div>
            <span className="text-[10px] text-zinc-500">SDK VER 4.2</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400">Secret API Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-white focus:outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

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
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default SettingsPage;
