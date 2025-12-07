import { motion } from 'framer-motion';
import { Home, Activity, FolderGit2, User, Terminal } from 'lucide-react';
import clsx from 'clsx';

export default function Dock({ activeTab, setActiveTab }) {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'projects', icon: FolderGit2, label: 'The Lab' },
    { id: 'analytics', icon: Activity, label: 'The Data' },
    { id: 'about', icon: User, label: 'Profile' },
    { id: 'terminal', icon: Terminal, label: 'Console' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-end gap-2 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.2, y: -10 }}
              whileTap={{ scale: 0.9 }}
              className={clsx(
                "relative p-3 rounded-xl transition-colors duration-300 group",
                isActive ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <Icon 
                className={clsx(
                  "w-6 h-6 transition-colors duration-300",
                  isActive ? "text-neon-cyan" : "text-slate-400 group-hover:text-slate-200"
                )} 
              />
              
              {/* Tooltip */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {item.label}
              </span>
              
              {/* Active Indicator */}
              {isActive && (
                <motion.div 
                  layoutId="dock-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-cyan"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
