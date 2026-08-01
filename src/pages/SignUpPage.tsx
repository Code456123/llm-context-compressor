import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Lock, Mail, User, Building2 } from 'lucide-react';
import { InteractiveFlowCanvas } from '../components/auth/InteractiveFlowCanvas';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  const handleGoogleSignUp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-center py-12 px-6 relative overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto w-full relative z-10">
        
        {/* Top Brand Header */}
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
              
              <button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-xs font-mono text-white hover:bg-zinc-800 transition-all duration-200"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign Up with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-white/10" />
                <span className="bg-zinc-950 px-3 font-mono text-[10px] text-zinc-500 uppercase">
                  Or registration form
                </span>
              </div>

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
                      I agree to ContextFlow AI's Terms of Service & Privacy Policy.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !agreed}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 font-semibold text-black hover:bg-zinc-200 transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Get Started Free'}</span>
                  {!isLoading && <ArrowRight className="h-4 w-4 text-black" />}
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

          {/* Right Column: Interactive Pipeline Flow Animation */}
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
