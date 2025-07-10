import { useScroll, useTransform, motion } from 'framer-motion'

export default function HeroSection() {
  const { scrollY } = useScroll()

  // Расстояние от центра до верхнего края кнопки в начальной позиции
  const initialOffset = 240 // подбери вручную: отступ от верха, где кнопка находится под слоганом

  // Двигаем кнопку вверх от её начального положения до top: 24px
  const y = useTransform(scrollY, [0, initialOffset], [0, -initialOffset + 24])

  // Остальное — заголовок и слоган
  const titleY = useTransform(scrollY, [0, 200], [0, -100])
  const titleOpacity = useTransform(scrollY, [0, 200], [1, 0])
  const sloganY = useTransform(scrollY, [0, 200], [0, -100])
  const sloganOpacity = useTransform(scrollY, [0, 200], [1, 0])

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

      {/* Фиксированная кнопка, но с анимацией по Y */}
      <motion.div
        style={{
          position: 'fixed',
          top: initialOffset,
          left: '50%',
          transform: 'translateX(-50%)',
          y,
          zIndex: 50,
        }}
        className="flex items-center gap-6 px-8 py-3 rounded-full border border-crimson text-base md:text-lg tracking-widest shadow-neon backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all"
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
    </main>
  )
}
