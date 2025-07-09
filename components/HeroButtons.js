import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

export default function HeroButtons() {
  const { scrollY } = useScroll()
  const [isPinned, setIsPinned] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsPinned(latest > 100)
  })

  return (
    <motion.div
      className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-0
        transition-all duration-500 ease-in-out
        ${isPinned ? 'top-8 translate-y-0 scale-90 opacity-90 z-50' : '-translate-y-1/2 scale-100 opacity-100 z-10'}
      `}
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
  )
}
