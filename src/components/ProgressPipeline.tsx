import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';
import { PipelineStep } from '../types';

interface ProgressPipelineProps {
  steps: PipelineStep[];
  currentStepIndex: number;
}

export const ProgressPipeline: React.FC<ProgressPipelineProps> = ({ steps, currentStepIndex }) => {
  return (
    <div className="w-full space-y-4">
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'completed';
        const isRunning = step.status === 'running';
        const isPending = step.status === 'pending';
        const isError = step.status === 'error';

        return (
          <div key={step.id} className="relative flex gap-4">
            
            {/* Step Icon & Connecting Line */}
            <div className="flex flex-col items-center">
              <div className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
                isCompleted 
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                  : isRunning 
                  ? 'bg-accent/20 border-accent text-accent shadow-accent-glow ring-2 ring-accent/30' 
                  : isError 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-600'
              }`}>
                {isCompleted && <CheckCircle2 className="h-5 w-5" />}
                {isRunning && <Loader2 className="h-5 w-5 animate-spin" />}
                {isPending && <Circle className="h-4 w-4 fill-zinc-800" />}
                {isError && <AlertCircle className="h-5 w-5" />}
              </div>

              {/* Connecting Line to next step */}
              {idx < steps.length - 1 && (
                <div className="relative my-1 h-12 w-0.5 bg-zinc-800">
                  <motion.div 
                    className="absolute top-0 left-0 w-full bg-accent"
                    initial={{ height: '0%' }}
                    animate={{ height: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>

            {/* Step Details & Live Progress Bar */}
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-semibold transition-colors ${
                  isCompleted ? 'text-zinc-200' : isRunning ? 'text-white font-bold' : 'text-zinc-500'
                }`}>
                  {step.title}
                </h4>
                
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                  isCompleted ? 'bg-emerald-500/10 text-emerald-400' : isRunning ? 'bg-accent/20 text-accent font-bold' : 'text-zinc-600'
                }`}>
                  {isCompleted ? '100%' : isRunning ? `${Math.round(step.progress)}%` : 'Waiting'}
                </span>
              </div>

              <p className="mt-1 text-xs text-muted leading-relaxed">
                {step.description}
              </p>

              {/* Animated fill progress bar */}
              {isRunning && (
                <div className="mt-2.5 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-accent to-emerald-400"
                    style={{ width: `${step.progress}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};
