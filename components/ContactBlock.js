import Image from 'next/image'
import Tilt from 'react-parallax-tilt'
import { useState, useEffect } from 'react'

export default function ContactBlock() {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = e.currentTarget?.getBoundingClientRect?.()
      if (!rect) return
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const section = document.getElementById('contact')
    if (section) section.addEventListener('mousemove', handleMouseMove)

    return () => {
      if (section) section.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <section
      id="contact"
      className="relative text-white min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden"
    >
      {/* 🔮 Свет от мышки — вне Tilt */}
      <div
        className="pointer-events-none absolute w-64 h-64 rounded-full bg-fuchsia-500/10 blur-2xl z-[-1] transition-transform duration-100"
        style={{
          transform: `translate(${pos.x - 128}px, ${pos.y - 128}px)`
        }}
      />

      {/* 🧊 Вся панель в Tilt */}
      <Tilt
        glareEnable
        glareMaxOpacity={0.15}
        scale={1.02}
        transitionSpeed={2500}
        tiltMaxAngleX={6}
        tiltMaxAngleY={6}
        className="w-[90vw] max-w-5xl h-[430px] sm:h-[400px] relative rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)]"
      >
        {/* 🎞 Видеоподложка */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          src="/video/ice.mp4"
        />

        {/* 📬 Контент поверх видео */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-10 px-4">
          <div className="uppercase tracking-widest text-sm text-white/60 flex items-center gap-2">
            <span className="text-white/40">✦</span>
            СВЯЗАТЬСЯ
            <span className="text-white/40">✦</span>
          </div>

          <a
            href="mailto:hi@rhodium.vision"
            className="text-2xl md:text-4xl font-mono font-light tracking-[0.15em] md:tracking-[0.3em] text-center text-fuchsia-300 drop-shadow-[0_0_6px_rgba(255,0,255,0.3)] hover:drop-shadow-[0_0_10px_rgba(255,0,255,0.5)] transition"
          >
            HI@RHODIUM.VISION
          </a>

          <div className="relative w-[160px] sm:w-[180px] h-[200px] sm:h-[220px] rounded-xl overflow-hidden border border-white/20 shadow-xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              src="/video/ice.mp4"
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
              <Image src="/qr-code.png" width={120} height={120} alt="QR" />
              <p className="text-xs text-white/60 text-center mt-3 tracking-widest">[ crafted in rhodium ]</p>
            </div>
          </div>
        </div>
      </Tilt>
    </section>
  )
}
