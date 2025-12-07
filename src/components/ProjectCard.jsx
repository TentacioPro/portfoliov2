import { motion } from 'framer-motion';
import { 
  Cpu, 
  BrainCircuit, 
  Archive, 
  Lock, 
  Code, 
  FileText, 
  Network, 
  Bot, 
  Database, 
  LayoutList, 
  MessageSquare, 
  Globe, 
  Terminal, 
  Mic, 
  Activity,
  Layers
} from 'lucide-react';
import { Badge } from './Badge';

const iconMap = {
  'cpu': Cpu,
  'brain-circuit': BrainCircuit,
  'archive': Archive,
  'lock': Lock,
  'file-text': FileText,
  'network': Network,
  'bot': Bot,
  'database': Database,
  'layout-list': LayoutList,
  'message-square': MessageSquare,
  'globe': Globe,
  'terminal': Terminal,
  'mic': Mic,
  'activity': Activity,
  'layers': Layers,
  'default': Code
};

export function ProjectCard({ project, onClick }) {
  const Icon = iconMap[project.thumbnail] || iconMap.default;

  return (
    <motion.div
      layoutId={`card-${project.id}`}
      onClick={onClick}
      className="group relative bg-slate-900 border border-slate-800 rounded-xl p-6 cursor-pointer overflow-hidden hover:border-slate-600 transition-colors"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-800 rounded-lg text-slate-300 group-hover:text-indigo-400 transition-colors">
            <Icon size={24} />
          </div>
          <Badge variant="highlight">{project.status}</Badge>
        </div>

        <motion.h3 
          layoutId={`title-${project.id}`}
          className="text-xl font-bold text-slate-100 mb-2"
        >
          {project.title}
        </motion.h3>

        <p className="text-slate-400 text-sm mb-6 flex-grow">
          {project.abstract}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs text-slate-500 font-mono">#{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
