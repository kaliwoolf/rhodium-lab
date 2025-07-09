import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function HeroSection() {
  const [wave, setWave] = useState(false);

  const handleClick = (anchor) => {
    setWave(true);
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => setWave(false), 2000);
  };

  return (
    <main className="bg-transparent min-h-screen flex flex-col items-center justify-center text-white font-sans relative z-10">
      <motion.h1
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4 }}
        className="text-[clamp(2.5rem,8vw,7rem)] font-bold tracking-[0.15em] text-center leading-tight backdrop-blur-sm"
      >
        RHODIUM LAB
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="mt-4 text-sm md:text-base text-white/60 tracking-wide backdrop-blur"
      >
        Лаборатория иммерсивных смыслов
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, delay: 0.6 }}
        className="mt-10 px-8 py-3 rounded-full border border-crimson text-base md:text-lg tracking-widest flex items-center gap-6 shadow-neon backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300"
      >
        <button onClick={() => handleClick('projects')} className="hover:scale-105 transition-transform">
          ПРОЕКТЫ
        </button>

        {/* Разделитель */}
        <div className="relative w-[60px] h-[10px]">
          <AnimatePresence mode="wait">
            {wave ? (
              <motion.svg
                key="wave"
                width="60"
                height="10"
                viewBox="0 0 60 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute top-0 left-0"
              >
                <motion.path
                  d="M0 5 Q 10 0, 20 5 T 40 5 T 60 5"
                  stroke="#ff003c"
                  strokeWidth="2"
                  fill="transparent"
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: [0, 1],
                    transition: { duration: 0.6, ease: 'easeInOut' }
                  }}
                />
                <motion.path
                  d="M0 5 Q 10 0, 20 5 T 40 5 T 60 5"
                  stroke="#ff003c"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray="20"
                  strokeDashoffset={0}
                  animate={{
                    strokeDashoffset: [0, 20],
                    transition: {
                      duration: 1.2,
                      ease: 'linear',
                      repeat: Infinity,
                    },
                  }}
                />
              </motion.svg>
            ) : (
              <motion.div
                key="line"
                className="absolute top-1/2 left-0 w-full h-[2px] bg-crimson"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </div>

        <button onClick={() => handleClick('contact')} className="hover:scale-105 transition-transform">
          СВЯЗАТЬСЯ
        </button>
      </motion.div>
    </main>
  );
}
