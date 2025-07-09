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
        animate={{
          position: isPinned ? 'fixed' : 'static',
          top: isPinned ? '1.5rem' : 'auto',
          left: isPinned ? '50%' : 'auto',
          translateX: isPinned ? '-50%' : '0%',
          translateY: isPinned ? '0%' : '0%',
          scale: isPinned ? 0.9 : 1,
          opacity: isPinned ? 0.95 : 1,
          zIndex: 50,
        }}
        transition={{ duration: 0.5, ease: [0.42, 0, 0.58, 1] }}
        className="mt-10"
      >
        <HeroButtons />
      </motion.div>
    </main>
  )
}
