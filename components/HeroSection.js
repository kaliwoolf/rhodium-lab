import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import * as flubber from 'flubber'

export default function HeroSection() {
  const [wave, setWave] = useState(false)
  const pathRef = useRef(null)

  const straight = 'M 0,5 L 60,5'
  const waveForm = 'M 0.00,5.00 L 15.00,9.00 L 30.00,5.00 L 45.00,1.00 L 60.00,5.00'

  const handleClick = (anchor) => {
    setWave(true)
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => setWave(false), 2500)
  }

  useEffect(() => {
    if (!pathRef.current) return;

    const interpolator = flubber.interpolate(
      wave ? straight : waveForm,
      wave ? waveForm : straight,
      { maxSegmentLength: 2 }
    );

    const controls = animate(0, 1, {
      duration: 0.6, // ускорено
      ease: [0.42, 0, 0.58, 1], // плавнее и резче одновременно
      onUpdate(latest) {
        const d = interpolator(latest);
        if (pathRef.current) {
          pathRef.current.setAttribute('d', d);
        }
      },
    });

    return () => controls.stop();
  }, [wave]);

  return (
    <main className="bg-transparent min-h-screen flex flex-col items-center justify-center text-white font-sans relative z-10">
      <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-bold tracking-[0.15em] text-center leading-tight backdrop-blur-sm">
        RHODIUM LAB
      </h1>

      <p className="mt-4 text-sm md:text-base text-white opacity-60 tracking-wide backdrop-blur">
        Лаборатория иммерсивных смыслов
      </p>

      <div className="mt-10 px-8 py-3 rounded-full border border-crimson text-base md:text-lg tracking-widest flex items-center gap-6 shadow-neon backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300">
        <button onClick={() => handleClick('projects')} className="hover:scale-105 transition-transform">
          ПРОЕКТЫ
        </button>

        <div className="relative w-[60px] h-[14px]">
          <svg viewBox="0 0 60 10" width="60" height="10" className="absolute top-2 left-0">
            <path
              ref={pathRef}
              d={straight}
              stroke="#ff003c"
              strokeWidth="2"
              fill="none"
              className="transition-all duration-300"
              style={{
                filter: 'drop-shadow(0 0 4px #ff003c)',
              }}
            />
          </svg>
        </div>

        <button onClick={() => handleClick('contact')} className="hover:scale-105 transition-transform">
          СВЯЗАТЬСЯ
        </button>
      </div>
    </main>
  )
}
