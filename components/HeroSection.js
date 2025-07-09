import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useRef, useState } from 'react'
import HeroButtons from './HeroButtons'

export default function HeroSection() {
  const { scrollY } = useScroll()
  const [isPinned, setIsPinned] = useState(false)

  // Обновляем состояние, когда scrollY превышает 100
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsPinned(latest > 100)
  })

  // Анимации
  const y = useTransform(scrollY, [0, 100], [0, -80])
  const scale = useTransform(scrollY, [0, 100], [1, 0.9])
  const opacity = useTransform(scrollY, [0, 100], [1, 0.85])

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white font-sans z-10">
      <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-bold tracking-[0.15em] text-center leading-tight backdrop-blur-sm">
        RHODIUM LAB
      </h1>

      <p className="mt-4 text-sm md:text-base text-white opacity-60 tracking-wide backdrop-blur text-center px-4">
        Изымаем хаос. <br className="md:hidden" />
        Создаём структуры, в которых можно жить и думать.
      </p>

      {/* Кнопка */}
      <motion.div
        style={{ y, scale, opacity }}
        className={`
          mt-10 w-full flex justify-center transition-all duration-500 ease-in-out
          ${isPinned ? 'fixed top-8 left-1/2 -translate-x-1/2 z-50' : ''}
        `}
      >
        <HeroButtons />
      </motion.div>
    </main>
  )
}
