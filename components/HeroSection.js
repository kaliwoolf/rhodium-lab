import { useEffect, useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import HeroButtons from './HeroButtons'

export default function HeroSection() {
  const { scrollY } = useScroll()
  const [isPinned, setIsPinned] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsPinned(latest > 100)
  })

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white font-sans z-10">
      <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-bold tracking-[0.15em] text-center leading-tight backdrop-blur-sm">
        RHODIUM LAB
      </h1>

      <p className="mt-4 text-sm md:text-base text-white opacity-60 tracking-wide backdrop-blur text-center px-4">
        Изымаем хаос. <br className="md:hidden" />
        Создаём структуры, в которых можно жить и думать.
      </p>

      <motion.div
        animate={isPinned
          ? {
              position: 'fixed',
              top: '1.5rem',
              left: '50%',
              x: '-50%',
              y: '0%',
              scale: 0.9,
              opacity: 0.95,
              zIndex: 50
            }
          : {
              position: 'relative',
              top: 'auto',
              left: 'auto',
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
              zIndex: 10
            }
        }
        transition={{ duration: 0.6, ease: [0.42, 0, 0.58, 1] }}
        className="mt-10 w-full flex justify-center"
      >
        <HeroButtons />
      </motion.div>

    </main>
  )
}
