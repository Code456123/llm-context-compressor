import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Loader2, CheckCircle2, ArrowRight, Sparkles, Cpu, Clock, Activity } from 'lucide-react';
import { ProgressPipeline } from '../components/ProgressPipeline';
import { INITIAL_PIPELINE_STEPS } from '../constants/mockData';
import { PipelineStep } from '../types';
import { fadeIn, scaleIn } from '../animations/variants';

export const ProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_PIPELINE_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentTokenCount, setCurrentTokenCount] = useState<number>(108000);
  const targetTokenCount = 31000;
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Timer simulation for pipeline step execution
  useEffect(() => {
    // Timer clock increment
    const clockInterval = setInterval(() => {
      setElapsedMs(prev => prev + 25);
    }, 25);

    return () => clearInterval(clockInterval);
  }, []);

  // Sequential Step Execution effect
  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      setIsFinished(true);
      // Auto navigate to results page after completion
      const redirectTimer = setTimeout(() => {
        navigate('/dashboard/results');
      }, 1200);
      return () => clearTimeout(redirectTimer);
    }

    // Set current step to running
    setSteps(prev => prev.map((step, idx) => {
      if (idx === currentStepIndex) return { ...step, status: 'running', progress: 10 };
      return step;
    }));

    // Animate progress fill for current step
    let progress = 10;
    const progressInterval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        
        // Mark current step completed & advance index
        setSteps(prev => prev.map((step, idx) => {
          if (idx === currentStepIndex) return { ...step, status: 'completed', progress: 100 };
          return step;
        }));

        // Reduce token count progressively
        const tokenDecrease = Math.round((108000 - targetTokenCount) / 5);
        setCurrentTokenCount(prev => Math.max(prev - tokenDecrease, targetTokenCount));

        setCurrentStepIndex(prev => prev + 1);
      } else {
        setSteps(prev => prev.map((step, idx) => {
          if (idx === currentStepIndex) return { ...step, progress };
          return step;
        }));
      }
    }, 80);

    return () => clearInterval(progressInterval);
  }, [currentStepIndex]);

  const currentReduction = Math.round(((108000 - currentTokenCount) / 108000) * 100);

  return (
    <motion.div 
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-8"
    >
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-xs font-mono text-accent mb-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Live Attention-Aware Engine Executing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Compressing Context Stream...
          </h1>
          <p className="text-xs text-muted mt-1">
            Analyzing token attention entropy, AST node trees, and semantic repetition across 108,000 tokens.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/results')}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-mono text-zinc-300 hover:bg-card-hover hover:text-white transition-all"
        >
          <span>Skip to Results</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Grid: Pipeline Visualization & Live Countdown Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side (7 Cols): Progress Pipeline */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-bold font-heading text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-accent" />
              Real-Time Pruning Stages
            </h3>
            <span className="text-xs font-mono text-accent bg-accent/15 px-2.5 py-0.5 rounded-full">
              {isFinished ? 'Execution Complete' : `Stage ${Math.min(currentStepIndex + 1, 5)} of 5`}
            </span>
          </div>

          <ProgressPipeline steps={steps} currentStepIndex={currentStepIndex} />
        </div>

        {/* Right Side (5 Cols): Live Metrics Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Animated Token Counter Panel */}
          <div className="rounded-2xl border border-accent/40 bg-gradient-to-b from-card via-[#13151D] to-card p-6 shadow-card-glow space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs font-mono text-muted">
              <span className="flex items-center gap-1.5 text-white">
                <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                Live Metric Telemetry
              </span>
              <span className="text-accent">{elapsedMs} ms elapsed</span>
            </div>

            {/* Current Tokens Big Display */}
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-muted">Current Payload Tokens</span>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-4xl font-bold tracking-tight text-white transition-all">
                  {currentTokenCount.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-muted">/ 108,000 original</span>
              </div>
            </div>

            {/* Reduction Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted">Target Budget Fit</span>
                <span className="text-emerald-400 font-bold">-{currentReduction}% Reduction</span>
              </div>
              
              <div className="h-3 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-accent via-purple-500 to-emerald-400 rounded-full"
                  animate={{ width: `${currentReduction}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Metric Chips */}
            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="rounded-xl border border-border bg-zinc-950/80 p-3">
                <span className="text-[10px] text-muted uppercase">Target Ceiling</span>
                <p className="text-sm font-bold text-white mt-0.5">31,000 tokens</p>
              </div>
              <div className="rounded-xl border border-border bg-zinc-950/80 p-3">
                <span className="text-[10px] text-muted uppercase">Reasoning Retention</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">99.1% (High)</p>
              </div>
            </div>

            {/* Completion Status Notification */}
            {isFinished && (
              <motion.div 
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-emerald-400 text-xs font-semibold"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Compression pipeline finished successfully! Redirecting to Diff...</span>
              </motion.div>
            )}

          </div>

        </div>

      </div>

    </motion.div>
  );
};
