import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { projects } from '../data/data';
import { X, ArrowUpRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export default function BentoGrid() {
  const [selectedId, setSelectedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(9);

  const visibleProjects = projects.slice(0, visibleCount);
  const hasMore = visibleCount < projects.length;

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 9, projects.length));
  };

  return (
    <div className="p-6 md:p-12 pb-32 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[240px]">
        {visibleProjects.map((project) => (
          <motion.div
            key={project.id}
            layoutId={`card-${project.id}`}
            onClick={() => setSelectedId(project.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "group relative overflow-hidden rounded-[20px] cursor-pointer",
              "bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300",
              project.colSpan === 2 ? "md:col-span-2" : "md:col-span-1"
            )}
          >
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  {project.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 text-[10px] font-medium tracking-wide uppercase rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-stone-400">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="w-6 h-6 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight className="w-3 h-3 text-stone-900 dark:text-white" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2 line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
            
            {/* Abstract Background Decoration */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-zinc-800 dark:to-zinc-900 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMore}
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md"
          >
            <span className="text-sm font-medium">Load More Archives</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}

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
              className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden relative z-10 shadow-2xl max-h-[80vh] flex flex-col"
            >
              {(() => {
                const project = projects.find(p => p.id === selectedId);
                return (
                  <>
                    {/* Header / Image Area (Optional, using gradient for now) */}
                    <div className="h-32 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-zinc-800 dark:to-zinc-900 relative">
                       <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                          className="absolute top-6 right-6 p-2 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 transition-colors backdrop-blur-md"
                        >
                          <X className="w-5 h-5 text-stone-600 dark:text-stone-300" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-10 overflow-y-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 text-xs font-medium tracking-wide uppercase rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4 tracking-tight">
                        {project.title}
                      </h2>

                      <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
                        {project.description}
                      </p>

                      <div className="flex gap-4 pt-4 border-t border-stone-100 dark:border-zinc-800">
                        <a 
                          href={project.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-2"
                        >
                          Read Documentation <ArrowUpRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

