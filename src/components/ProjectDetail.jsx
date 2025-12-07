import { motion } from 'framer-motion';
import Markdown from 'react-markdown';
import { 
  X, 
  Github, 
  ExternalLink, 
  Download, 
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

export function ProjectDetail({ project, onClose }) {
  const Icon = iconMap[project.thumbnail] || iconMap.default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />
      
      <motion.div
        layoutId={`card-${project.id}`}
        className="relative w-full max-w-4xl max-h-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-900 z-10 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-4 mb-6">
            <div className="p-4 bg-slate-800 rounded-xl text-indigo-400">
              <Icon size={32} />
            </div>
            <div>
              <motion.h2 
                layoutId={`title-${project.id}`}
                className="text-3xl font-bold text-white mb-2"
              >
                {project.title}
              </motion.h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="highlight">{project.status}</Badge>
                {project.tags.map(tag => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap gap-3">
            {project.links?.source && (
              <a
                href={project.links.source}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                <Github size={16} />
                View Source
              </a>
            )}
            {project.links?.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <ExternalLink size={16} />
                Live Demo
              </a>
            )}
            {project.links?.research && (
              <a
                href={project.links.research}
                download
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={16} />
                Download Research
              </a>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-8 bg-slate-900">
          <div className="prose prose-invert prose-slate max-w-none">
            <Markdown>{project.description}</Markdown>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
