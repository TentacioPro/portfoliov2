import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export function FilterBar({ categories, activeCategory, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 mb-12">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={clsx(
            'relative px-4 py-2 text-sm font-mono rounded-full transition-colors',
            activeCategory === category
              ? 'text-slate-950'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          )}
        >
          {activeCategory === category && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 bg-slate-200 rounded-full"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{category}</span>
        </button>
      ))}
    </div>
  );
}
