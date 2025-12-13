import { motion } from 'framer-motion';
import { profile } from '../data/data';

export default function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center justify-center px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
        
        {/* Left: Text Manifesto */}
        <div className="order-2 md:order-1">
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-swiss-text dark:text-white leading-[1.1] mb-8">
              <span className="relative inline-block">
                A jack of all trades
                <svg className="absolute top-1/2 left-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <motion.path
                    d="M0 10 Q 50 20 100 5"
                    fill="transparent"
                    stroke="#ef4444" /* Red-500 */
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
                  />
                </svg>
              </span>
              <br />
              <span className="text-stone-400 dark:text-stone-500">is a master of none.</span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="text-2xl md:text-3xl font-medium text-swiss-secondary dark:text-indigo-400 leading-tight"
            >
              ...but oftentimes better than a master of one.
            </motion.p>
          </div>
        </div>

        {/* Right: Avatar */}
        <div className="order-1 md:order-2 flex justify-center md:justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-64 h-64 md:w-96 md:h-96"
          >
            <div className="absolute inset-0 bg-stone-200 dark:bg-zinc-800 rounded-[2rem] rotate-6 transform translate-y-4 translate-x-4" />
            <img 
              src={profile.avatar} 
              alt="Profile" 
              className="relative w-full h-full object-cover rounded-[2rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
