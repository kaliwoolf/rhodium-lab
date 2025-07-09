import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

export default function HeroButtons() {
  const { scrollY } = useScroll()
  const [isPinned, setIsPinned] = useState(false)
  const wrapperRef = useRef(null)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsPinned(latest > window.innerHeight * 0.6) // только после первого экрана
  })

  return (
    <div ref={wrapperRef} className="relative w-full flex justify-center mt-6">
      <motion.div
        initial={false}
        animate={{
          position: isPinned ? 'fixed' : 'relative',
          top: isPinned ? '1.5rem' : 'unset',
          left: isPinned ? '50%' : 'unset',
          translateX: isPinned ? '-50%' : '0%',
          scale: isPinned ? 0.9 : 1,
          opacity: isPinned ? 0.95 : 1,
          zIndex: isPinned ? 50 : 'auto',
        }}
        transition={{ duration: 0.4, ease: [0.42, 0, 0.58, 1] }}
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
    </div>
  )
}
