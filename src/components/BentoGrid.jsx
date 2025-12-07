import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { projects } from '../data/data';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function BentoGrid() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="p-4 md:p-8 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            layoutId={`card-${project.id}`}
            onClick={() => setSelectedId(project.id)}
            className={clsx(
              "group relative overflow-hidden rounded-3xl cursor-pointer",
              "bg-white/5 backdrop-blur-md border border-white/10",
              "hover:border-neon-cyan/50 transition-colors duration-500",
              i === 0 || i === 3 ? "md:col-span-2" : "md:col-span-1",
              i === 2 ? "md:row-span-2" : ""
            )}
          >
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 text-xs font-mono rounded-full bg-white/5 border border-white/10 text-neon-cyan">
                  {project.status}
                </span>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-neon-cyan -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
              
              <div>
                <h3 className="text-2xl font-technical font-bold text-slate-100 mb-2 group-hover:text-neon-cyan transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-400 line-clamp-2 text-sm">
                  {project.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              layoutId={`card-${selectedId}`}
              className="w-full max-w-3xl bg-slate-950 border border-white/10 rounded-3xl overflow-hidden relative z-10 shadow-2xl shadow-neon-purple/20"
            >
              {/* Content of the expanded card */}
              {(() => {
                const project = projects.find(p => p.id === selectedId);
                return (
                  <div className="flex flex-col h-full max-h-[80vh] overflow-y-auto">
                    <div className="p-8 md:p-12 bg-gradient-to-br from-slate-900 to-slate-950">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <X className="w-6 h-6 text-slate-300" />
                      </button>

                      <span className="text-neon-cyan font-mono text-sm tracking-wider uppercase mb-4 block">
                        {project.status} Project
                      </span>
                      
                      <h2 className="text-4xl md:text-5xl font-technical font-bold text-white mb-6">
                        {project.title}
                      </h2>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {project.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 text-sm rounded-full bg-white/5 border border-white/10 text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="text-lg text-slate-300 leading-relaxed mb-8">
                        {project.description}
                      </p>

                      <div className="flex gap-4">
                        <button className="px-6 py-3 rounded-xl bg-neon-cyan text-slate-950 font-bold hover:bg-cyan-300 transition-colors flex items-center gap-2">
                          <ExternalLink className="w-5 h-5" />
                          View Deployment
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors">
                          Download Research
                        </button>
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
