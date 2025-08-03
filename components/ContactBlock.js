import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import RippleShaderPlane from './RippleShaderPlane'

export default function ContactBlock() {
  const mouse = useRef(new THREE.Vector2(0.5, 0.5))

  return (
    <section
      id="contact"
      className="relative text-white min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouse.current.set(
          (e.clientX - rect.left) / rect.width,
          (e.clientY - rect.top) / rect.height
        )
      }}
    >
      {/* Ripple Canvas фон */}
      <div className="absolute inset-0 z-0">
        <Canvas
          orthographic
          gl={{ preserveDrawingBuffer: true }}
          camera={{ zoom: 1, position: [0, 0, 100] }}
        >
          <RippleShaderPlane mouse={mouse} />
        </Canvas>
      </div>

      {/* Контактная панель */}
      <Tilt
        glareEnable
        glareMaxOpacity={0.15}
        scale={1.02}
        transitionSpeed={2500}
        tiltMaxAngleX={6}
        tiltMaxAngleY={6}
        className="relative w-[90vw] max-w-[960px] h-[720px] rounded-3xl overflow-hidden shadow-[0_0_120px_rgba(255,255,255,0.1)] z-10"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80 blur-sm"
          src="/video/ice.mp4"
        />
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
              className="absolute inset-0 w-full h-full object-cover opacity-80 blur-[1px]"
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
