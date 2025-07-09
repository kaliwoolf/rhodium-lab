import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function HeroSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  })

  const headingOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const paragraphOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const buttonY = useTransform(scrollYProgress, [0, 0.2], ['0%', '-120px'])
  const buttonScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.85])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-white font-sans z-10 overflow-hidden"
    >
      <motion.h1
        style={{ opacity: headingOpacity }}
        className="text-[clamp(2.5rem,8vw,7rem)] font-bold tracking-[0.15em] text-center leading-tight backdrop-blur-sm"
      >
        RHODIUM LAB
      </motion.h1>

      <motion.p
        style={{ opacity: paragraphOpacity }}
        className="mt-4 text-sm md:text-base text-white opacity-60 tracking-wide backdrop-blur text-center px-4"
      >
        Изымаем хаос. <br className="md:hidden" />
        Создаём структуры, в которых можно жить и думать.
      </motion.p>

      <motion.div
        style={{
          y: buttonY,
          scale: buttonScale,
          position: 'sticky',
          top: 32,
          zIndex: 50,
        }}
        className="mt-12"
      >
        <div className="flex items-center gap-6 px-8 py-3 rounded-full border border-crimson text-base md:text-lg tracking-widest shadow-neon backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all">
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:scale-105 transition-transform"
          >
            ПРОЕКТЫ
          </button>

          <div className="relative w-[60px] h-[14px]">
            <svg viewBox="0 0 60 10" width="60" height="10" className="absolute top-2 left-0">
              <path
                d="M 0,5 L 60,5"
                stroke="#ff003c"
                strokeWidth="2"
                fill="none"
                style={{ filter: 'drop-shadow(0 0 4px #ff003c)' }}
              />
            </svg>
          </div>

          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:scale-105 transition-transform"
          >
            СВЯЗАТЬСЯ
          </button>
        </div>
      </motion.div>
    </section>
  )
}
