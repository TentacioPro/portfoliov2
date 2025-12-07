import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SmoothScroll from '../components/SmoothScroll';
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';
import Analytics from '../components/Analytics';
import Profile from '../components/Profile';
import Dock from '../components/Dock';

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-swiss-bg dark:bg-[#0c0c0c] text-swiss-text dark:text-[#ededed] font-sans overflow-x-hidden selection:bg-swiss-accent/20 dark:selection:bg-swiss-accent/20 selection:text-swiss-accent transition-colors duration-300">
        {/* Noise Overlay */}
        <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-50 mix-blend-multiply dark:mix-blend-screen" />

        <main className="relative z-10 pb-32">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Hero />
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-20"
              >
                <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
                  <h2 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-white">The Archive</h2>
                  <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">Selected works and experiments.</p>
                </div>
                <BentoGrid />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-20"
              >
                <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
                  <h2 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-white">The Synapse</h2>
                  <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">Quantifying the creative process.</p>
                </div>
                <Analytics />
              </motion.div>
            )}
            
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-20"
              >
                <Profile />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Dock activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </SmoothScroll>
  );
}
