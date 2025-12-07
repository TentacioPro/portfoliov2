import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { projects } from '../data/data';
import { X, ArrowUpRight, Download } from 'lucide-react';
import clsx from 'clsx';

export default function BentoGrid() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="p-6 md:p-12 pb-32 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            layoutId={`card-${project.id}`}
            onClick={() => setSelectedId(project.id)}
            className={clsx(
              "group relative overflow-hidden rounded-[24px] cursor-pointer",
              "bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-soft dark:shadow-none hover:shadow-xl hover:scale-[1.02] transition-all duration-500",
              project.colSpan === 2 ? "md:col-span-2" : "md:col-span-1"
            )}
          >
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 text-xs font-medium tracking-wide uppercase rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-stone-400">
                  {project.status}
                </span>
                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight className="w-4 h-4 text-stone-900 dark:text-white" />
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-sm text-stone-500 dark:text-stone-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Abstract Background Decoration */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-zinc-800 dark:to-zinc-900 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
            />
            
            <motion.div
              layoutId={`card-${selectedId}`}
              className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden relative z-10 shadow-2xl"
            >
              {(() => {
                const project = projects.find(p => p.id === selectedId);
                return (
                  <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px]">
                    {/* Left: Content */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col overflow-y-auto">
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-swiss-accent font-medium tracking-wider uppercase text-sm">
                          {project.status}
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                          className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <X className="w-6 h-6 text-stone-400" />
                        </button>
                      </div>
                      
                      <h2 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-6 tracking-tight">
                        {project.title}
                      </h2>

                      <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
                        {project.description}
                      </p>

                      <div className="mt-auto flex gap-4">
                        <button className="px-6 py-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-2">
                          View Project <ArrowUpRight className="w-4 h-4" />
                        </button>
                        {project.downloadUrl && (
                          <button className="px-6 py-3 rounded-xl border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-white font-medium hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                            Download PDF <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Visuals */}
                    <div className="w-full md:w-1/3 bg-stone-50 border-l border-stone-100 p-8 flex flex-col justify-center">
                       <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-4">Technologies</h4>
                       <div className="flex flex-wrap gap-2">
                        {project.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white border border-stone-200 rounded-lg text-sm text-stone-600 shadow-sm">
                            {tag}
                          </span>
                        ))}
                       </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

