import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import roadmapData from '../data/roadmap.json';

const Roadmap = () => {
  const [hoveredPhase, setHoveredPhase] = useState(null);
  const navigate = useNavigate();

  const statusColors = {
    completed: {
      bg: 'bg-emerald-500/20 dark:bg-emerald-500/10',
      border: 'border-emerald-500/50 dark:border-emerald-500/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      line: 'bg-emerald-500 dark:bg-emerald-400',
      dot: 'bg-emerald-500 dark:bg-emerald-400'
    },
    'in-progress': {
      bg: 'bg-blue-500/20 dark:bg-blue-500/10',
      border: 'border-blue-500 dark:border-blue-400',
      text: 'text-blue-600 dark:text-blue-400',
      line: 'bg-blue-500 dark:bg-blue-400',
      dot: 'bg-blue-500 dark:bg-blue-400 animate-pulse shadow-lg shadow-blue-500/50'
    },
    planned: {
      bg: 'bg-zinc-200/30 dark:bg-zinc-800/30',
      border: 'border-zinc-400 dark:border-zinc-700 border-dashed',
      text: 'text-zinc-500 dark:text-zinc-500',
      line: 'bg-zinc-400 dark:bg-zinc-700',
      dot: 'bg-zinc-400 dark:bg-zinc-700'
    }
  };

  const taskStatusIcons = {
    done: '✓',
    pending: '○'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const phaseVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-stone-900 dark:text-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 dark:bg-zinc-900 hover:bg-stone-200 dark:hover:bg-zinc-800 transition-colors text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Second Brain OS
          </h1>
          <p className="text-stone-600 dark:text-zinc-400 text-lg">Development Roadmap</p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-stone-300 dark:bg-zinc-800" />

          {/* Phases */}
          <div className="space-y-8">
            {roadmapData.map((phase, index) => {
              const colors = statusColors[phase.status];
              const isHovered = hoveredPhase === phase.id;
              const completedTasks = phase.tasks.filter(t => t.status === 'done').length;
              const totalTasks = phase.tasks.length;
              const progress = (completedTasks / totalTasks) * 100;

              return (
                <motion.div
                  key={phase.id}
                  variants={phaseVariants}
                  className="relative pl-20"
                  onMouseEnter={() => setHoveredPhase(phase.id)}
                  onMouseLeave={() => setHoveredPhase(null)}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-6 top-6 -translate-x-1/2">
                    <div className={`w-5 h-5 rounded-full ${colors.dot} ring-4 ring-white dark:ring-black`} />
                  </div>

                  {/* Phase Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`
                      relative p-6 rounded-xl border-2 ${colors.border} ${colors.bg}
                      backdrop-blur-sm transition-all duration-300
                      ${isHovered ? 'shadow-xl' : ''}
                    `}
                  >
                    {/* Phase Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h2 className={`text-2xl font-bold ${colors.text} mb-2`}>
                          {phase.title}
                        </h2>
                        <p className="text-zinc-400 text-sm">
                          {phase.description}
                        </p>
                      </div>
                      <div className={`
                        px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                        ${colors.text} ${colors.bg} border ${colors.border}
                      `}>
                        {phase.status.replace('-', ' ')}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {phase.status !== 'planned' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-stone-500 dark:text-zinc-500 mb-1">
                          <span>{completedTasks} of {totalTasks} tasks</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full ${colors.line}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tasks List (Show on Hover) */}
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: isHovered ? 'auto' : 0,
                        opacity: isHovered ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-stone-300 dark:border-zinc-700/50">
                        <h3 className="text-sm font-semibold text-stone-600 dark:text-zinc-400 mb-3">Tasks:</h3>
                        <ul className="space-y-2">
                          {phase.tasks.map((task) => (
                            <li
                              key={task.id}
                              className="flex items-center text-sm"
                            >
                              <span className={`
                                mr-3 font-mono
                                ${task.status === 'done' ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-zinc-600'}
                              `}>
                                {taskStatusIcons[task.status]}
                              </span>
                              <span className={
                                task.status === 'done'
                                  ? 'text-stone-700 dark:text-zinc-300'
                                  : 'text-stone-500 dark:text-zinc-500'
                              }>
                                {task.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Connecting Line to Next Phase */}
                  {index < roadmapData.length - 1 && (
                    <div className={`absolute left-8 top-full h-8 w-0.5 ${colors.line} -translate-x-1/2`} />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Footer Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 p-6 rounded-xl bg-stone-100 dark:bg-zinc-900/50 border border-stone-300 dark:border-zinc-800"
        >
          <h3 className="text-sm font-semibold text-stone-600 dark:text-zinc-400 mb-4">Legend</h3>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span className="text-stone-700 dark:text-zinc-300">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
              <span className="text-stone-700 dark:text-zinc-300">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-400 dark:bg-zinc-700" />
              <span className="text-stone-700 dark:text-zinc-300">Planned</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Roadmap;
