import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import AdaptiveScrambleLink from '../components/AdaptiveScrambleLink'

export default function HeroSection() {
  const { scrollY } = useScroll()
  const [pinned, setPinned] = useState(false)
  const [activeSection, setActiveSection] = useState('hero'); // hero, projects, contact

  const [smoothScroll, setSmoothScroll] = useState(0)

  useEffect(() => {
    let raf
    const update = () => {
      setSmoothScroll(prev => prev + (scrollY.get() - prev) * 0.18)
      raf = requestAnimationFrame(update)
    }
    update()
    return () => cancelAnimationFrame(raf)
  }, [scrollY])

  // Простые функции для плавного преобразования
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const titleY = clamp(-smoothScroll / 2, -100, 0)
  const titleOpacity = clamp(1 - smoothScroll / 200, 0, 1)
  const sloganY = clamp(-smoothScroll / 2, -100, 0)
  const sloganOpacity = clamp(1 - smoothScroll / 200, 0, 1)

  const buttonY = clamp(-smoothScroll * 0.27, -80, 0)
  const buttonScale = clamp(1 - (smoothScroll / 300) * 0.15, 0.85, 1)
  const buttonOpacity = clamp(1 - smoothScroll / 300 * 0.1, 0.9, 1)


  // Слежение за прилипанием
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (y) => {
      setPinned(y > 300)
    })
    return () => unsubscribe()
  }, [scrollY])

  useEffect(() => {
    const sectionIds = ['projects', 'contact'];
    const observers = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          } else if (activeSection === id) {
            setActiveSection('hero');
          }
        },
        {
          threshold: 0.5, // 50% блока в зоне видимости
        }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, [activeSection]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white font-sans z-10">
      <motion.h1
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          willChange: 'transform'
        }}
        className="text-[clamp(2.5rem,8vw,7rem)] font-bold tracking-[0.15em] text-center leading-tight backdrop-blur-sm"
      >
        RHODIUM
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, scale: 0.8}}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}      
        style={{
          transform: `translateY(${sloganY}px)`,
          opacity: sloganOpacity,
          willChange: 'transform'
        }}
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
          zIndex: 100,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          willChange: 'transform' 
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8}}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          style={{
            transform: `translateY(${pinned ? 0 : buttonY}px) scale(${buttonScale})`,
            opacity: pinned ? 1 : buttonOpacity,
            pointerEvents: 'auto',
            willChange: 'transform', 
          }}
            className={`flex items-center gap-4 px-4 py-2 rounded-full border border-crimson text-sm md:text-base tracking-wide shadow-neon backdrop-blur-sm bg-white/5 hover:bg-white/10 ${pinned ? '' : 'mt-12'}`}
        >
          <AdaptiveScrambleLink
            text="ПРОЕКТЫ"
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className={`hover:scale-105 transition-transform ${activeSection === 'projects' ? 'opacity-60 pointer-events-none cursor-default' : ''}`}
            disabled={activeSection === 'projects'}
          />

          <div className="relative h-[44px] flex items-center justify-center w-[54px]">
            <motion.svg
              initial={false} 
              viewBox="0 0 54 10"
              width="54"
              height="10"
              className="absolute top-[40%] left-[calc(50%-27px)]"
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
                strokeWidth="1"
                fill="none"
                style={{ filter: 'drop-shadow(0 0 4px #ff003c)' }}
              />
            </motion.svg>
          </div>


          <AdaptiveScrambleLink
            text="СВЯЗАТЬСЯ"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className={`hover:scale-105 transition-transform ${activeSection === 'contact' ? 'opacity-60 pointer-events-none cursor-default' : ''}`}
            disabled={activeSection === 'contact'}
          />
        </motion.div>
      </div>
    </main>
  )
}
