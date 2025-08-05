import React, { Suspense, useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer } from '@react-three/postprocessing'
import { Points, PointMaterial, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'
import dynamic from 'next/dynamic'
import MouseTrails from '../components/MouseTrails'

const Starfield = dynamic(() => import('./Starfield'), { ssr: false })
const GlassSaturn = dynamic(() => import('./GlassSaturn'), { ssr: false })
const DynamicBloom = dynamic(() => import('./DynamicBloom'), { ssr: false })
const SupernovaFlash = dynamic(() => import('./SupernovaFlash'), { ssr: false })


export default function ThreeBackground({ ...props }) {
  const mouse = useRef({ x: 0, y: 0 })
  const rawScroll = useRef(0)
  const smoothScroll = useRef(0)
  const [explosionFactor, setExplosionFactor] = useState(0)

  const [isMobile, setIsMobile] = useState(false)
  const [showCanvas, setShowCanvas] = useState(false)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 640)
    }
  }, [])

  // Scroll event → rawScroll
  useEffect(() => {
    const handleScroll = () => {
      rawScroll.current = window.scrollY / window.innerHeight
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      const targetX = (e.clientX / window.innerWidth - 0.5) * 2
      const targetY = -(e.clientY / window.innerHeight - 0.5) * 2
      mouse.current.x += (targetX - mouse.current.x) * 0.05
      mouse.current.y += (targetY - mouse.current.y) * 0.05
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // 🔁 rAF сглаживание скролла
  useEffect(() => {
    let raf
    const update = () => {
      smoothScroll.current += (rawScroll.current - smoothScroll.current) * 0.1

      const newExplosion = smoothScroll.current > 1.0
        ? Math.tanh((smoothScroll.current - 1.0) * 3.3)
        : 0

      setExplosionFactor(newExplosion)

      raf = requestAnimationFrame(update)
    }
    update()
    return () => cancelAnimationFrame(raf)
  }, [])

  // Запуск Canvas: сразу на десктопе, лениво на мобилках
  useEffect(() => {
    if (!isMobile) {
      setShowCanvas(true)
      return
    }
    setShowCanvas(false)
    const handler = () => setShowCanvas(true)
    window.addEventListener('scroll', handler, { once: true })
    window.addEventListener('touchstart', handler, { once: true })
    const timer = setTimeout(() => setShowCanvas(true), 1000)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('touchstart', handler)
      clearTimeout(timer)
    }
  }, [isMobile])

  return (
    <>
      {showCanvas && (
        <>
          <Canvas
            camera={{ position: [0, 0, 9], fov: 35 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
            dpr={isMobile ? 0.7 : 1.2}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: -2,
              pointerEvents: 'none',
              background: '#000000',
              mixBlendMode: isMobile ? 'normal' : 'screen'
            }}
            onCreated={({ camera }) => camera.layers.set(0)}
          >
            <Suspense fallback={null}>
              <Starfield
                mouse={mouse}
                scrollRef={smoothScroll}
                explosionFactor={explosionFactor}
                count={isMobile ? 400 : 3000}
              />
              {!isMobile && (
                <>
                  <SupernovaFlash explosionFactor={explosionFactor} />
                  <MouseTrails />
                  <EffectComposer>
                    <DynamicBloom explosionFactor={explosionFactor} />
                  </EffectComposer>
                </>
              )}
            </Suspense>
          </Canvas>

          <Canvas
            camera={{ position: [0, 0, 8], fov: 35 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: -1,
              pointerEvents: 'none'
            }}
            onCreated={({ camera }) => camera.layers.enable(1)}
          >
            <Suspense fallback={null}>
              <GlassSaturn mouse={mouse} scrollRef={smoothScroll} />
              <Environment
                files="/env/starfield_2k.hdr"
                background={false}
              />          
            </Suspense>
          </Canvas>
        </>
      )}
    </>
  )
}
