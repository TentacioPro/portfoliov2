import { motion } from 'framer-motion';
import { Home, Activity, FolderGit2, User, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import clsx from 'clsx';

export default function Dock({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'projects', icon: FolderGit2, label: 'Archive' },
    { id: 'analytics', icon: Activity, label: 'Synapse' },
    { id: 'about', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-glass">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "relative p-3 rounded-full transition-all duration-300 group",
                isActive ? "bg-stone-100 dark:bg-white/10" : "hover:bg-stone-50 dark:hover:bg-white/5"
              )}
            >
              <Icon 
                strokeWidth={1.5}
                className={clsx(
                  "w-5 h-5 transition-colors duration-300",
                  isActive ? "text-stone-900 dark:text-white" : "text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300"
                )} 
              />
              
              {/* Tooltip */}
              <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-stone-900 dark:bg-zinc-950 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                {item.label}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900 dark:bg-zinc-950 rotate-45" />
              </span>
              
              {/* Active Dot */}
              {isActive && (
                <motion.div 
                  layoutId="dock-dot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-swiss-accent"
                />
              )}
            </motion.button>
          );
        })}
        
        <div className="w-px h-8 bg-stone-200 dark:bg-white/10 mx-1" />
        
        {/* Docs Link */}
        <motion.button
          onClick={() => navigate('/docs')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-3 rounded-full hover:bg-stone-50 dark:hover:bg-white/5 transition-all duration-300 group"
        >
          <BookOpen 
            strokeWidth={1.5}
            className="w-5 h-5 text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors duration-300" 
          />
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-stone-900 dark:bg-zinc-950 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
            Docs
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900 dark:bg-zinc-950 rotate-45" />
          </span>
        </motion.button>

        <div className="w-px h-8 bg-stone-200 dark:bg-white/10 mx-1" />
        <ThemeToggle />
      </div>
    </div>
  );
}

