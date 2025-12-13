import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { docsData } from '../data/docs';
import SmoothScroll from '../components/SmoothScroll';

export default function Docs() {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-stone-50 dark:bg-[#0c0c0c] text-stone-900 dark:text-[#ededed] font-sans selection:bg-stone-200 dark:selection:bg-zinc-800">
        
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-stone-50/80 dark:bg-[#0c0c0c]/80 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Lab</span>
          </Link>
          <span className="text-xs font-mono text-stone-400 uppercase tracking-widest">Spec Engineering v1.0</span>
        </nav>

        <main className="pt-32 pb-32 px-6 md:px-12 max-w-5xl mx-auto">
          
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-24"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              {docsData.title}
            </h1>
            <p className="text-xl md:text-2xl text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
              {docsData.subtitle}
            </p>
          </motion.div>

          {/* Mission Section */}
          <section className="mb-32">
            <h2 className="text-3xl font-bold tracking-tight mb-6">{docsData.mission.title}</h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-lg mb-8">
              {docsData.mission.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docsData.mission.specs.map((spec, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800"
                >
                  <div className="text-sm text-stone-500 dark:text-stone-400 mb-1">{spec.label}</div>
                  <div className="font-mono text-stone-900 dark:text-white">{spec.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Architecture Section */}
          <section className="mb-32">
            <h2 className="text-3xl font-bold tracking-tight mb-6">{docsData.architecture.title}</h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-lg mb-8">
              {docsData.architecture.description}
            </p>
            <div className="space-y-3">
              {docsData.architecture.services.map((service, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-6 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800"
                >
                  <div className="flex-1">
                    <div className="font-mono font-bold text-stone-900 dark:text-white mb-1">{service.name}</div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">{service.description}</div>
                  </div>
                  <div className="font-mono text-sm text-stone-500 dark:text-stone-400">:{service.port}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Philosophy Cards */}
          <section className="mb-32">
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="text-2xl font-bold tracking-tight">{docsData.philosophy.title}</h2>
              <span className="text-sm text-stone-400 italic">{docsData.philosophy.inspiration}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {docsData.philosophy.tenets.map((tenet, index) => (
                <motion.div
                  key={tenet.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-bold mb-4 text-stone-900 dark:text-white">{tenet.title}</h3>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm">
                    {tenet.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Prompt Log */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">The Prompt Log</h2>
            <p className="text-stone-600 dark:text-stone-400 mb-12">
              Every prompt used to build this system, organized by development phase.
            </p>
            
            <div className="space-y-12 relative border-l border-stone-200 dark:border-zinc-800 ml-4 md:ml-0">
              {docsData.prompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-8 md:pl-12"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-zinc-700 ring-4 ring-stone-50 dark:ring-[#0c0c0c]" />
                  
                  <div className="mb-4">
                    <div className="text-xs font-mono text-stone-400 dark:text-stone-500 mb-2">{prompt.phase}</div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white">{prompt.title}</h3>
                    <p className="text-stone-500 dark:text-stone-400 mt-1">{prompt.description}</p>
                  </div>

                  <div className="relative group">
                    <div className="absolute right-4 top-4 z-10">
                      <button
                        onClick={() => handleCopy(prompt.id, prompt.code)}
                        className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                      >
                        {copiedId === prompt.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <pre className="p-6 rounded-xl bg-stone-900 dark:bg-zinc-900 text-stone-100 overflow-x-auto text-sm font-mono leading-relaxed shadow-inner border border-stone-800 dark:border-zinc-800">
                      <code>{prompt.code}</code>
                    </pre>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

        </main>
      </div>
    </SmoothScroll>
  );
}
