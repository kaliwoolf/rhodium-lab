import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function HeroSection() {
  const { scrollY } = useScroll()
  const [pinned, setPinned] = useState(false)

  // Заголовок и слоган
  const titleY = useTransform(scrollY, [0, 200], [0, -100])
  const titleOpacity = useTransform(scrollY, [0, 200], [1, 0])
  const sloganY = useTransform(scrollY, [0, 200], [0, -100])
  const sloganOpacity = useTransform(scrollY, [0, 200], [1, 0])

  // Кнопка
  const buttonY = useTransform(scrollY, [0, 300], [0, -80])
  const buttonScale = useTransform(scrollY, [0, 300], [1, 0.85])
  const buttonOpacity = useTransform(scrollY, [0, 300], [1, 0.9])

  // Слежение за прилипанием
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (y) => {
      setPinned(y > 300)
    })
    return () => unsubscribe()
  }, [scrollY])

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

      {/* Обёртка: позиция зависит от pinned */}
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
        }}
      >
        <motion.div
          style={{
            y: pinned ? 0 : buttonY,
            scale: buttonScale,
            opacity: buttonOpacity,
            pointerEvents: 'auto',
          }}
          className={`flex items-center gap-4 px-4 py-2 rounded-full border border-crimson text-sm md:text-base tracking-wide shadow-neon backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all ${
            pinned ? '' : 'mt-12'
          }`}
        >
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:scale-105 transition-transform"
          >
            ПРОЕКТЫ
          </button>

          <div className="relative w-[54px] h-[14px]">
            <motion.svg
              viewBox="0 0 54 10"
              width="54"
              height="10"
              className="absolute top-[40%] left-[calc(50%-27px)] -translate-y-1/2"
              animate={{
                x: [0, 0.4, -0.3, 0.2, -0.2, 0],
                y: [0, -0.2, 0.3, -0.1, 0],
                strokeOpacity: [1, 0.85, 1, 0.95, 1],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <motion.path
                d="M 0,4.5 L 54,4.5"
                stroke="#ff003c"
                strokeWidth="2"
                fill="none"
                style={{ filter: 'drop-shadow(0 0 4px #ff003c)' }}
              />
            </motion.svg>
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
