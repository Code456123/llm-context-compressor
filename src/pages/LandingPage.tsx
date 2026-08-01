import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '../components/effects/ParticleBackground';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { PipelineSection } from '../components/landing/PipelineSection';
import { LiveCompressionDemo } from '../components/landing/LiveCompressionDemo';
import { MetricsSection } from '../components/landing/MetricsSection';
import { TimelineSection } from '../components/landing/TimelineSection';
import { DashboardPreviewSection } from '../components/landing/DashboardPreviewSection';
import { FooterSection } from '../components/landing/FooterSection';

export const LandingPage: React.FC = () => {
  // Ensure page always starts at the top (Hero section) on reload / mount
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' as const },
    },
  };

  return (
    <div className="min-h-screen bg-[#08090A] text-white selection:bg-white selection:text-black relative overflow-x-hidden font-sans">
      {/* Particle Canvas Background */}
      <ParticleBackground />

      {/* Sticky Blur Navbar */}
      <LandingNavbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Section 2: Problem */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: '-60px' }}
        variants={sectionVariants}
      >
        <ProblemSection />
      </motion.div>

      {/* Section 3: Interactive Pipeline */}
      <motion.div
        id="pipeline"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: '-60px' }}
        variants={sectionVariants}
      >
        <PipelineSection />
      </motion.div>

      {/* Section 4: Live Compression Split View */}
      <motion.div
        id="demo"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: '-60px' }}
        variants={sectionVariants}
      >
        <LiveCompressionDemo />
      </motion.div>

      {/* Section 5: Metrics */}
      <motion.div
        id="metrics"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: '-60px' }}
        variants={sectionVariants}
      >
        <MetricsSection />
      </motion.div>

      {/* Section 6: How It Works Timeline */}
      <motion.div
        id="workflow"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: '-60px' }}
        variants={sectionVariants}
      >
        <TimelineSection />
      </motion.div>

      {/* Section 7: Dashboard Preview */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: '-60px' }}
        variants={sectionVariants}
      >
        <DashboardPreviewSection />
      </motion.div>

      {/* Section 8: Footer */}
      <FooterSection />
    </div>
  );
};

export default LandingPage;
