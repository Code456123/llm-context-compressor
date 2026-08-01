import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

type PricingTier = {
  name: string;
  price: string;
  subtitle: string;
  credits: string;
  highlights: string[];
  featured?: boolean;
  cta: string;
};

const TIERS: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    subtitle: 'Try it at signup',
    credits: '2 credits',
    highlights: ['2 credits on signup', 'Any agent', 'Credits never expire'],
    cta: 'Get Free',
  },
  {
    name: 'Starter',
    price: '$9',
    subtitle: 'One-time',
    credits: '6 credits',
    highlights: ['6 credits', 'Any agent', 'Credits never expire', 'One-time payment'],
    cta: 'Buy Starter',
  },
  {
    name: 'Growth',
    price: '$25',
    subtitle: 'One-time',
    credits: '20 credits',
    highlights: ['20 credits', 'Any agent', 'Credits never expire', 'One-time payment'],
    featured: true,
    cta: 'Buy Growth',
  },
  {
    name: 'Scale',
    price: '$50',
    subtitle: 'One-time',
    credits: '50 credits',
    highlights: ['50 credits', 'Any agent', 'Credits never expire', 'One-time payment'],
    cta: 'Buy Scale',
  },
];

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="relative py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="max-w-3xl space-y-4 mb-12">
        <h2 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.02]">
          <span className="text-white">Pay once.</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300">
            Own everything.
          </span>
        </h2>
        <p className="text-zinc-300 text-lg leading-relaxed">
          Credits power each agent run. Start free, scale when needed, and keep full control with one-time purchases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-3xl border p-6 backdrop-blur-lg ${
              tier.featured
                ? 'border-cyan-300/35 bg-[linear-gradient(165deg,rgba(8,18,34,0.9)_0%,rgba(9,28,47,0.86)_100%)] shadow-[0_18px_45px_rgba(2,8,20,0.5),0_0_24px_rgba(34,211,238,0.12)]'
                : 'border-white/10 bg-[linear-gradient(165deg,rgba(8,13,25,0.8)_0%,rgba(9,18,34,0.72)_100%)]'
            }`}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-6 rounded-full border border-cyan-200/35 bg-cyan-300/20 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-cyan-100">
                Best value
              </span>
            )}

            <div className="space-y-2">
              <p className="text-zinc-400 text-sm font-semibold">{tier.name}</p>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-bold tracking-tight text-white">{tier.price}</p>
                <p className="text-zinc-500 text-sm pb-1">{tier.subtitle}</p>
              </div>
              <p className="text-cyan-200 font-semibold">{tier.credits}</p>
            </div>

            <ul className="space-y-2 mt-6">
              {tier.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-cyan-300 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all ${
                tier.featured
                  ? 'border border-cyan-200/35 bg-gradient-to-r from-[#0891B2] via-[#22D3EE] to-[#3B82F6] text-[#032238] hover:brightness-110'
                  : 'border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10'
              }`}
            >
              <span>{tier.cta}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
