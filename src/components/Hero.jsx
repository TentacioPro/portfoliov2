import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="py-20 sm:py-32 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl sm:text-6xl font-bold text-slate-100 mb-6 tracking-tight">
          The Archive of <span className="text-indigo-500">My Name</span>.
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
          A collection of experiments, pivots, and code that taught me how to think.
          Not a resume, but a gallery of attempts, failures, and breakthroughs.
        </p>
      </motion.div>
    </section>
  );
}
