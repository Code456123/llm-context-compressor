import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CountUp } from '../ui/CountUp';
import { ArrowRight, Sparkles, Copy, Check, SlidersHorizontal, RefreshCw } from 'lucide-react';

export const LiveCompressionDemo: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedSample, setSelectedSample] = useState(0);
  const [compressionRatio, setCompressionRatio] = useState(72);

  const samples = [
    {
      title: 'SEC 10-K Filing & Earnings',
      rawTokens: 108400,
      rawText: `UNITED STATES SECURITIES AND EXCHANGE COMMISSION
Washington, D.C. 20549
FORM 10-K
[X] ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934
Item 7. Management's Discussion and Analysis of Financial Condition...
[DUPLICATE FOOTER REDUNDANCY LINE 1-840]
Note 12. Commitments and Contingencies...
In connection with ongoing regulatory inquiries regarding capital reserve ratios, management has accrued $45,000,000 in reserves...
[UNNECESSARY HTML BOILERPLATE TABLES & STYLE BLOCKS 12,450 TOKENS]...`,
      compressedText: `SEC 10-K KEY SUMMARY & METRICS:
- Form 10-K MD&A: Capital reserve ratio regulatory inquiry.
- Accrual: $45,000,000 management reserve logged under Note 12.
- Liquidity: Free Cash Flow $1.2B (+14% YoY). Operational covenants fully compliant.
[PRUNED: 78,048 redundant table tags & legal footer tokens]`,
    },
    {
      title: 'Distributed System Microservices Trace',
      rawTokens: 84200,
      rawText: `2026-08-01T12:00:01.002Z [DEBUG] com.enterprise.gateway.RouterFilter - Request ID: req_9948192
2026-08-01T12:00:01.003Z [TRACE] org.springframework.web.servlet.DispatcherServlet - Rendering view [jsonView]
2026-08-01T12:00:01.004Z [ERROR] com.enterprise.payment.StripeService - Connection timeout contacting endpoint https://api.stripe.com/v1/charges
at com.enterprise.payment.StripeService.processCharge(StripeService.java:142)
at com.enterprise.payment.StripeService$$FastClassBySpringCGLIB.invoke(<generated>)
[2,400 REPEATED STACK TRACE FRAMES DELETED]...`,
      compressedText: `CRITICAL SYSTEM ERROR SUMMARY:
- Error: Connection timeout on https://api.stripe.com/v1/charges
- Root Location: StripeService.java:142 (processCharge)
- Impact: req_9948192 failed payment execution.
[PRUNED: 60,624 repetitive CGLIB & DispatcherServlet trace logs]`,
    },
    {
      title: '5-Year Customer Support Ticket Logs',
      rawTokens: 96000,
      rawText: `Ticket #88412 - User reported login loop on Chrome v126.
Agent: "Hello, have you tried clearing cache?"
User: "Yes I did."
Agent: "Can you send a screenshot?"
User: "Attached."
[45 ITERATIONS OF GREETINGS AND SIGNATURE LINES PRUNED]
Resolution: Updated JWT refresh token expiry setting in org_settings.`,
      compressedText: `TICKET SUMMARY (#88412):
- Issue: Chrome v126 login loop.
- Root Cause: Expired JWT refresh token configuration.
- Fix: Updated org_settings JWT expiry parameter.
[PRUNED: 69,120 repetitive greeting and attachment boilerplate tokens]`,
    },
  ];

  const current = samples[selectedSample];
  const compressedTokens = Math.floor(current.rawTokens * (1 - compressionRatio / 100));

  const handleCopy = () => {
    navigator.clipboard.writeText(current.compressedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative py-28 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Benchmark</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Live Context Compression
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg">
          Select an enterprise dataset or test the live compression ratio in real time.
        </p>
      </div>

      {/* Preset Switcher & Ratio Slider */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {samples.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSample(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                selectedSample === idx
                  ? 'bg-white text-black font-semibold shadow-lg'
                  : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-zinc-950/80 border border-white/10 px-4 py-2 rounded-xl text-xs font-mono text-zinc-300 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            <span>Target Compression:</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="40"
              max="85"
              value={compressionRatio}
              onChange={(e) => setCompressionRatio(Number(e.target.value))}
              className="w-28 accent-white cursor-pointer"
            />
            <span className="font-semibold text-emerald-400">{compressionRatio}%</span>
          </div>
        </div>
      </div>

      {/* Split Screen Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Original */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-zinc-950 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">ORIGINAL CONTEXT</span>
                <h3 className="text-base font-semibold text-white mt-0.5">Raw Enterprise Payload</h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-red-400 block font-semibold">
                  <CountUp end={current.rawTokens} duration={1.5} suffix=" Tokens" />
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Un-pruned</span>
              </div>
            </div>

            <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap bg-zinc-900/60 p-4 rounded-xl border border-white/5 leading-relaxed max-h-[260px] overflow-y-auto">
              {current.rawText}
            </pre>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Status: 100% Raw Volume</span>
            <span>Cost: ~$1.62 per call</span>
          </div>
        </div>

        {/* Middle: Stats & Arrow */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center py-6 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          >
            <span className="text-sm font-bold font-mono">
              <CountUp end={compressionRatio} suffix="%" duration={1.5} />
            </span>
            <span className="text-[9px] uppercase tracking-tighter text-emerald-300/80 font-mono">Saved</span>
          </motion.div>

          <div className="hidden lg:flex flex-col items-center gap-1">
            <div className="w-[1px] h-8 bg-gradient-to-b from-white/20 via-emerald-500/50 to-white/20" />
            <ArrowRight className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Right: Compressed Output */}
        <div className="lg:col-span-5 rounded-2xl border border-emerald-500/30 bg-zinc-950 p-6 flex flex-col justify-between shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">COMPRESSED CONTEXT</span>
                <h3 className="text-base font-semibold text-white mt-0.5">Dense Semantic Output</h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-emerald-400 block font-semibold">
                  <CountUp end={compressedTokens} duration={1.5} suffix=" Tokens" />
                </span>
                <span className="text-[10px] text-emerald-400/70 font-mono font-medium">98.9% Intent Retained</span>
              </div>
            </div>

            <pre className="text-xs font-mono text-emerald-200/90 whitespace-pre-wrap bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 leading-relaxed max-h-[260px] overflow-y-auto">
              {current.compressedText}
            </pre>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copied ? 'Copied Prompt' : 'Copy Output'}</span>
            </button>
            <span className="text-emerald-400 font-semibold">Cost: ~$0.48 per call</span>
          </div>
        </div>
      </div>
    </section>
  );
};
