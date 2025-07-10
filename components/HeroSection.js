import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

export default function HeroSection() {
  const { scrollY } = useScroll()
  const [pinned, setPinned] = useState(false)

  // Плавное движение
  const y = useTransform(scrollY, [0, 300], [0, -80])
  const scale = useTransform(scrollY, [0, 300], [1, 0.85])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.9])

  // Заголовок и слоган
  const titleY = useTransform(scrollY, [0, 200], [0, -100])
  const titleOpacity = useTransform(scrollY, [0, 200], [1, 0])
  const sloganY = useTransform(scrollY, [0, 200], [0, -100])
  const sloganOpacity = useTransform(scrollY, [0, 200], [1, 0])

  // Плавный переход к pinned
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setPinned(latest > 300)
  })

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white font-sans z-10">
      <motion.h1
        style={{ y: titleY, opacity: titleOpacity }}
        className="text-[clamp(2.5rem,8vw,7rem)] font-bold tracking-[0.15em] text-center leading-tight backdrop-blur-sm"
      >
        RHODIUM LAB
      </motion.h1>

      <motion.p
        style={{ y: sloganY, opacity: sloganOpacity }}
        className="mt-4 text-sm md:text-base text-white opacity-60 tracking-wide backdrop-blur text-center px-4"
      >
        Изымаем хаос. <br className="md:hidden" />
        Создаём структуры, в которых можно жить и думать.
      </motion.p>

      {/* Обёртка, которая плавно становится fixed */}
      <div
        style={{
          position: pinned ? 'fixed' : 'relative',
          top: pinned ? '24px' : 'auto',
          left: pinned ? '50%' : 'auto',
          transform: pinned ? 'translateX(-50%)' : 'none',
          zIndex: 50,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          transition: 'all 0.4s ease',
        }}
      >
        <motion.div
          style={{
            y: pinned ? 0 : y,
            scale,
            opacity,
            pointerEvents: 'auto',
          }}
          className={`flex items-center gap-6 px-8 py-3 rounded-full border border-crimson text-base md:text-lg tracking-widest shadow-neon backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all ${
            pinned ? '' : 'mt-12'
          }`}
        >
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
        </motion.div>
      </div>
    </main>
  )
}
