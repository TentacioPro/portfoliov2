import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SmoothScroll from './components/SmoothScroll';
import Hero from './components/Hero';
import BentoGrid from './components/BentoGrid';
import Analytics from './components/Analytics';
import Dock from './components/Dock';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-void text-slate-200 selection:bg-neon-cyan/30 selection:text-neon-cyan font-sans overflow-x-hidden">
        {/* Ambient Background */}
        <div className="fixed inset-0 bg-void-gradient pointer-events-none z-0" />
        <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none z-0 mix-blend-overlay" />

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
                className="pt-20 max-w-7xl mx-auto"
              >
                <h2 className="text-4xl font-technical font-bold px-8 mb-8 text-slate-100">The Lab</h2>
                <BentoGrid />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-20 max-w-7xl mx-auto"
              >
                <h2 className="text-4xl font-technical font-bold px-8 mb-8 text-slate-100">System Metrics</h2>
                <Analytics />
              </motion.div>
            )}
            
            {/* Placeholder for other tabs */}
            {(activeTab === 'about' || activeTab === 'terminal') && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-screen flex items-center justify-center"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-mono text-neon-purple mb-2">System Module Offline</h2>
                  <p className="text-slate-500">This section is currently under development.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Dock activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </SmoothScroll>
  );
}

export default App;
