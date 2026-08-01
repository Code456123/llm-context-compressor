import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Zap, Lock, Mail, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  // Already logged in — send them straight to dashboard
  if (session) return <Navigate to={from} replace />;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: sbError } = await supabase.auth.signInWithPassword({ email, password });

    if (sbError) {
      setError(sbError.message);
      setIsLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-center py-12 px-6 relative overflow-hidden font-sans">
      <div className="max-w-[520px] mx-auto w-full relative z-10">

        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-bold shadow-lg">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ContextFlow <span className="text-xs font-mono text-zinc-400 font-normal">/ Auth</span>
            </span>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="space-y-2.5 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Sign In to Enterprise Console
            </h2>
            <p className="text-xs text-slate-400/85 font-mono leading-relaxed">
              Access real-time prompt compression, route throughput analytics, and accuracy budgets.
            </p>
          </div>

          <div className="auth-card rounded-2xl p-8 space-y-6">

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-400 font-mono">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-slate-200">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-300/80" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="auth-input w-full rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200">Password</label>
                  <a href="#" className="text-[10px] text-teal-200/85 hover:text-cyan-200">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-300/80" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="auth-input w-full rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-cyan-200/35 bg-gradient-to-r from-[#0891B2] via-[#22D3EE] to-[#3B82F6] py-3 font-semibold text-[#032238] shadow-[0_8px_20px_rgba(20,155,214,0.3)] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110 hover:shadow-[0_10px_24px_rgba(39,179,233,0.36)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In →</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-white/10 text-xs font-mono text-slate-300">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-cyan-200 font-semibold hover:text-cyan-100 hover:underline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
