import React, { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import dynamic from 'next/dynamic'

const Starfield = dynamic(() => import('./Starfield'), { ssr: false })
const GlassSaturn = dynamic(() => import('./GlassSaturn'), { ssr: false })
const DynamicBloom = dynamic(() => import('./DynamicBloom'), { ssr: false })
const SupernovaFlash = dynamic(() => import('./SupernovaFlash'), { ssr: false })
const MouseTrails = dynamic(() => import('../components/MouseTrails'), { ssr: false })

const isSafariUA = () =>
  typeof navigator !== 'undefined' &&
  /safari/i.test(navigator.userAgent) &&
  !/chrome|crios|fxios|edg/i.test(navigator.userAgent)

export default function ThreeBackground() {
  const mouse = useRef({ x: 0, y: 0 })
  const rawScroll = useRef(0)
  const smoothScroll = useRef(0)

  const [explosionFactor, setExplosionFactor] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [showCanvas, setShowCanvas] = useState(false)
  const [saturnVisible, setSaturnVisible] = useState(false)
  const [saturnOpacity, setSaturnOpacity] = useState(1)
  const [saturnScale, setSaturnScale] = useState(1)

  const isSafari = isSafariUA()

  useEffect(() => {
    if (typeof window !== 'undefined') setIsMobile(window.innerWidth < 640)
  }, [])

  useEffect(() => {
    const onScroll = () => { rawScroll.current = window.scrollY / window.innerHeight }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // rAF сглаживание скролла + фактор вспышки
  useEffect(() => {
    let raf
    const loop = () => {
      smoothScroll.current += (rawScroll.current - smoothScroll.current) * 0.1
      const ex = smoothScroll.current > 1.0
        ? Math.tanh((smoothScroll.current - 1.0) * 3.3)
        : 0
      setExplosionFactor(ex)
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  // запуск Canvas (лениво на мобиле)
  useEffect(() => {
    if (!isMobile) { setShowCanvas(true); return }
    setShowCanvas(false)
    const handler = () => setShowCanvas(true)
    window.addEventListener('scroll', handler, { once: true })
    window.addEventListener('touchstart', handler, { once: true })
    const t = setTimeout(() => setShowCanvas(true), 1000)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('touchstart', handler)
      clearTimeout(t)
    }
  }, [isMobile])

  // мышь
  useEffect(() => {
    const onMove = (e) => {
      const tx = (e.clientX / window.innerWidth - 0.5) * 2
      const ty = -(e.clientY / window.innerHeight - 0.5) * 2
      mouse.current.x += (tx - mouse.current.x) * 0.05
      mouse.current.y += (ty - mouse.current.y) * 0.05
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // плавность Сатурна
  useEffect(() => {
    const updateSaturn = () => {
      const scroll = smoothScroll.current || 0
      const fade = Math.max(1 - scroll * 1.0, 0)
      setSaturnOpacity(0.1 + 0.9 * fade)
      const desktopMin = 1.2, desktopMax = 2.4
      const mobileMin = 0.7, mobileMax = 1.1
      setSaturnScale(isMobile
        ? mobileMin + (mobileMax - mobileMin) * fade
        : desktopMin + (desktopMax - desktopMin) * fade
      )
      requestAnimationFrame(updateSaturn)
    }
    updateSaturn()
    return () => {}
  }, [isMobile])

  // показывать/скрывать Сатурн на мобиле
  useEffect(() => {
    if (!isMobile) return
    const fn = () => {
      const scroll = window.scrollY / window.innerHeight
      setSaturnVisible(scroll < 0.2)
    }
    window.addEventListener('scroll', fn)
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [isMobile])

  // Safari: Сатурн видим всегда (без второго Canvas/оверлея)
  const showSaturn = isSafari ? true : (isMobile ? saturnVisible : true)

  if (!showCanvas) return null

  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 35 }}
      // Safari-режим: меньше DPR, без MSAA, без альфы, простой тонмапинг
      dpr={isSafari ? [1, 1.05] : (isMobile ? [1, 1.1] : [1, 1.5])}
      frameloop="always"
      gl={{
        powerPreference: 'high-performance',
        antialias: !isSafari,
        alpha: false,
        depth: true,
        stencil: false,
        preserveDrawingBuffer: false,
        toneMapping: isSafari ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping,
      }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        pointerEvents: 'none',
        background: '#000',          // убрали mixBlendMode: 'screen' — дорогой композитинг
      }}
      onCreated={({ gl }) => {
        try { gl.outputColorSpace = THREE.SRGBColorSpace } catch {}
        const canvas = gl.getContext().canvas
        canvas.addEventListener('webglcontextlost', (e) => e.preventDefault(), { passive: false })
      }}
    >
      <Suspense fallback={null}>
        {/* Звёзды: сильнее режем в Safari */}
        <Starfield
          mouse={mouse}
          scrollRef={smoothScroll}
          explosionFactor={explosionFactor}
          count={isSafari ? (isMobile ? 300 : 1200) : (isMobile ? 400 : 3000)}
        />

        {/* Вспышка и трейлы — только НЕ в Safari */}
        {!isSafari && (
          <>
            <SupernovaFlash explosionFactor={explosionFactor} />
            <MouseTrails />
          </>
        )}

        {/* Сатурн в том же Canvas: без HDR в Safari */}
        {showSaturn && (
          <group
            // на Safari имитируем прежнюю «прозрачность» Сатурна
            // через материал/шейдер внутри GlassSaturn или в самом компоненте
            // тут просто не трогаем стиль Canvas, чтобы не было второго композитинга
          >
            <GlassSaturn mouse={mouse} scrollRef={smoothScroll} scale={saturnScale} />
            {/* HDR окружение вырублено в Safari */}
            {!isSafari && (
              // оставь свой Environment, если действительно нужен, НО локальный файл
              // <Environment files="/env/starfield_2k.hdr" background={false} />
              null
            )}
          </group>
        )}

        {/* Bloom — только НЕ в Safari */}
        {!isSafari && (
          <DynamicBloom explosionFactor={explosionFactor} />
        )}
      </Suspense>
    </Canvas>
  )
}
