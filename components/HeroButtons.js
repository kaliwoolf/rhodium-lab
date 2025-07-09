'use client'
import { useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

export default function HeroButtons() {
  const { scrollY } = useScroll()
  const [pinned, setPinned] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setPinned(y > window.innerHeight * 0.4) // можно подрегулировать
  })

  return (
    <motion.div
      initial={false}
      animate={{
        position: pinned ? 'fixed' : 'absolute',
        top: pinned ? '2rem' : 'calc(100% + 2rem)',
        left: '50%',
        translateX: '-50%',
        scale: pinned ? 0.9 : 1,
        opacity: 1,
        zIndex: 50,
      }}
      transition={{ duration: 0.5, ease: [0.42, 0, 0.58, 1] }}
    >
      <div className="flex items-center gap-6 px-8 py-3 rounded-full border border-crimson text-base md:text-lg tracking-widest shadow-neon backdrop-blur-sm bg-white/5 hover:bg-white/10 text-white">
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
  )
}
