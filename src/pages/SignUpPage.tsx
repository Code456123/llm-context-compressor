import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Lock, Mail, User, Building2, AlertTriangle, Loader2 } from 'lucide-react';
import { InteractiveFlowCanvas } from '../components/auth/InteractiveFlowCanvas';
import { supabase } from '../lib/supabaseClient';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const { error: sbError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, company },
      },
    });

    if (sbError) {
      setError(sbError.message);
      setIsLoading(false);
    } else {
      // Supabase may require email confirmation; handle both flows
      setSuccessMsg('Account created! Check your email to confirm, then sign in.');
      setIsLoading(false);
      // If email confirmation is disabled in Supabase, navigate directly
      setTimeout(() => navigate('/signin'), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-center py-12 px-6 relative overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto w-full relative z-10">

        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center sm:text-left"
        >
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-bold shadow-lg group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ContextFlow <span className="text-xs font-mono text-zinc-400 font-normal">/ Register</span>
            </span>
          </Link>
        </motion.div>

        {/* Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Create Enterprise Account
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Start reducing LLM context costs by 70% with 14-day free pro trial
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-8 shadow-2xl space-y-6 backdrop-blur-xl">

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-400 font-mono">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success banner */}
              {successMsg && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400 font-mono">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aryan Sharma"
                      className="w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aryan@company.com"
                      className="w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme AI Technologies"
                      className="w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-9 pr-4 py-2.5 text-white placeholder-zinc-600 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-1 text-xs">
                  <label className="flex items-start gap-2 cursor-pointer select-none text-zinc-400 text-[10px]">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 rounded border-white/10 bg-zinc-900 accent-white"
                    />
                    <span className="leading-tight">
                      I agree to ContextFlow AI&apos;s Terms of Service &amp; Privacy Policy.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !agreed}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 font-semibold text-black hover:bg-zinc-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Started Free</span>
                      <ArrowRight className="h-4 w-4 text-black" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-white/10 text-xs font-mono text-zinc-400">
                Already have an account?{' '}
                <Link to="/signin" className="text-white font-semibold hover:underline">
                  Sign in instead
                </Link>
              </div>

            </div>
          </motion.div>

          {/* Right Column: Interactive Flow Canvas */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6 hidden lg:block"
          >
            <InteractiveFlowCanvas />
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
