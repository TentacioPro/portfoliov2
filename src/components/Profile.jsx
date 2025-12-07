import { motion } from 'framer-motion';
import { profile } from '../data/data';
import { ArrowUpRight, Mail, MapPin, Calendar } from 'lucide-react';

export default function Profile() {
  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Left Column: Header & Quick Info */}
        <div className="md:col-span-5 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8 mx-auto md:mx-0">
              <div className="absolute inset-0 bg-stone-200 dark:bg-zinc-800 rounded-[2rem] rotate-3" />
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="relative w-full h-full object-cover rounded-[2rem] shadow-xl grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white tracking-tight mb-2">
              {profile.name}
            </h1>
            <p className="text-xl text-stone-500 dark:text-stone-400 font-medium">
              {profile.role}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400">
              <MapPin className="w-5 h-5" />
              <span>Chennai, India</span>
            </div>
            <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400">
              <Mail className="w-5 h-5" />
              <span>hello@tentacio.pro</span>
            </div>
            <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400">
              <Calendar className="w-5 h-5" />
              <span>Joined Earth in 2003</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex gap-4"
          >
            {profile.socials.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-stone-900 transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </motion.div>
        </div>

        {/* Right Column: Bio & Details */}
        <div className="md:col-span-7 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h3 className="text-sm font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-6">
              About Me
            </h3>
            <div className="prose prose-lg prose-stone dark:prose-invert">
              <p className="text-2xl md:text-3xl font-medium text-stone-800 dark:text-stone-200 leading-relaxed">
                {profile.bio}
              </p>
              <p className="text-stone-600 dark:text-stone-400 mt-6 leading-relaxed">
                I'm a builder at heart, obsessed with the intersection of systems programming and user experience. 
                My journey started with breaking things to see how they work, and evolved into building things that just work.
              </p>
              <p className="text-stone-600 dark:text-stone-400 mt-4 leading-relaxed">
                Currently focused on <strong>Agentic AI</strong>, <strong>Local LLM Orchestration</strong>, and <strong>High-Performance Web Architectures</strong>.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800">
              <h4 className="font-bold text-stone-900 dark:text-white mb-2">Engineering</h4>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Full-Stack Development, Systems Architecture, API Design, Database Optimization
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800">
              <h4 className="font-bold text-stone-900 dark:text-white mb-2">AI & ML</h4>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                RAG Pipelines, Agentic Workflows, Local LLM Fine-tuning, Computer Vision
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
             <a 
              href="mailto:hello@tentacio.pro"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
            >
              Let's Collaborate <ArrowUpRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
