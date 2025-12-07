import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Hero() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 2000); // Start strikethrough
    const timer2 = setTimeout(() => setStep(2), 3500); // Reveal rest
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <section className="min-h-[80vh] flex flex-col justify-center items-start px-8 md:px-20 max-w-5xl mx-auto">
      <div className="font-technical text-4xl md:text-6xl lg:text-7xl leading-tight text-slate-200">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative inline-block"
        >
          A jack of all trades...
          <motion.div 
            className="absolute top-1/2 left-0 w-full h-1 bg-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.8)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: step >= 1 ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ originX: 0 }}
          />
        </motion.div>
        
        <div className="h-4 md:h-8" /> {/* Spacer */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 20 }}
          transition={{ duration: 0.8 }}
        >
          is a master of none,
        </motion.div>

        <div className="h-4 md:h-8" /> {/* Spacer */}

        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ 
            opacity: step >= 2 ? 1 : 0, 
            filter: step >= 2 ? "blur(0px)" : "blur(10px)" 
          }}
          transition={{ duration: 1.2 }}
          className="text-neon-cyan drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
        >
          but oftentimes better than a master of one.
        </motion.div>
      </div>
    </section>
  );
}
