import React, { Suspense, useRef, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer } from '@react-three/postprocessing'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import dynamic from 'next/dynamic'
import MouseTrails from '../components/MouseTrails'

const Starfield = dynamic(() => import('./Starfield'), { ssr: false })
const GlassSaturn = dynamic(() => import('./GlassSaturn'), { ssr: false })
const DynamicBloom = dynamic(() => import('./DynamicBloom'), { ssr: false })
const SupernovaFlash = dynamic(() => import('./SupernovaFlash'), { ssr: false })

// ── Safari детектор (не срабатывает в Chrome/Brave/Edge на WebKit)
const useIsSafari = () =>
  useMemo(() => {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent
    return /safari/i.test(ua) && !/chrome|crios|fxios|edg/i.test(ua)
  }, [])

// ── rAF троттлинг (по умолчанию 30 FPS) + пауза при скрытой вкладке
const useRAFThrottle = (cb, fps = 30, enabled = true) => {
  useEffect(() => {
    if (!enabled) return
    let rafId = 0
    let last = 0
    let active = true
    const interval = 1000 / fps

    const loop = (t) => {
      if (!active) return
      rafId = requestAnimationFrame(loop)
      if (t - last >= interval) {
        last = t
        cb(t)
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        active = false
        cancelAnimationFrame(rafId)
      } else {
        active = true
        last = 0
        rafId = requestAnimationFrame(loop)
      }
    }
    const onBlur = () => { active = false; cancelAnimationFrame(rafId) }
    const onFocus = () => { if (!active) { active = true; last = 0; rafId = requestAnimationFrame(loop) } }

    rafId = requestAnimationFrame(loop)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)

    return () => {
      active = false
      cancelAnimationFrame(rafId)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [cb, fps, enabled])
}

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

  const isSafari = useIsSafari()

  // первичное отображение Сатурна
  useEffect(() => {
    if (showCanvas) {
      const timer = setTimeout(() => setSaturnVisible(true), 120)
      return () => clearTimeout(timer)
    } else {
      setSaturnVisible(false)
    }
  }, [showCanvas])

  // мобила/десктоп
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 640)
    }
  }, [])

  // трекинг сырых скролл-единиц
  useEffect(() => {
    const handleScroll = () => {
      rawScroll.current = window.scrollY / window.innerHeight
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // сглаживание скролла + расчёт вспышки
  useEffect(() => {
    if (isSafari) return // для Safari ниже поставим троттлинг
    let raf
    const update = () => {
      smoothScroll.current += (rawScroll.current - smoothScroll.current) * 0.1
      const sc = smoothScroll.current
      const ex = sc > 1.0 ? Math.tanh((sc - 1.0) * 3.3) : 0
      setExplosionFactor(ex)
      raf = requestAnimationFrame(update)
    }
    update()
    return () => cancelAnimationFrame(raf)
  }, [isSafari])

  // ТОЛЬКО Safari: та же логика, но 30 FPS и пауза при скрытой вкладке
  useRAFThrottle(() => {
    if (!isSafari) return
    smoothScroll.current += (rawScroll.current - smoothScroll.current) * 0.1
    const sc = smoothScroll.current
    const ex = sc > 1.0 ? Math.tanh((sc - 1.0) * 3.3) : 0
    setExplosionFactor(ex)
  }, 30, isSafari)

  // плавность Сатурна
  useEffect(() => {
    if (isSafari) return // у Safari ниже — троттлинг
    const updateSaturn = () => {
      const scroll = smoothScroll.current || 0
      const fade = Math.max(1 - scroll * 1.0, 0)
      setSaturnOpacity(0.1 + 0.9 * fade)
      const desktopMin = 1.2, desktopMax = 2.4
      const mobileMin = 0.7, mobileMax = 1.1
      const scale = isMobile
        ? mobileMin + (mobileMax - mobileMin) * fade
        : desktopMin + (desktopMax - desktopMin) * fade
      setSaturnScale(scale)
      requestAnimationFrame(updateSaturn)
    }
    updateSaturn()
    return () => {}
  }, [isSafari, isMobile])

  // ТОЛЬКО Safari: тот же апдейт Сатурна, но 30 FPS
  useRAFThrottle(() => {
    if (!isSafari) return
    const scroll = smoothScroll.current || 0
    const fade = Math.max(1 - scroll * 1.0, 0)
    setSaturnOpacity(0.1 + 0.9 * fade)
    const desktopMin = 1.2, desktopMax = 2.4
    const mobileMin = 0.7, mobileMax = 1.1
    const scale = isMobile
      ? mobileMin + (mobileMax - mobileMin) * fade
      : desktopMin + (desktopMax - desktopMin) * fade
    setSaturnScale(scale)
  }, 30, isSafari)

  // мышь
  useEffect(() => {
    const handleMouseMove = (e) => {
      const tx = (e.clientX / window.innerWidth - 0.5) * 2
      const ty = -(e.clientY / window.innerHeight - 0.5) * 2
      mouse.current.x += (tx - mouse.current.x) * 0.05
      mouse.current.y += (ty - mouse.current.y) * 0.05
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // ленивый монтаж Canvas на мобиле
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

  // видимость Сатурна на мобиле
  useEffect(() => {
    if (!isMobile) return
    const onScroll = () => {
      const scroll = window.scrollY / window.innerHeight
      setSaturnVisible(scroll < 0.2)
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isMobile])

  return (
    <>
      {showCanvas && (
        <>
          {/* ───────────────── Stars / Trails / Bloom ───────────────── */}
          <Canvas
            camera={{ position: [0, 0, 9], fov: 35 }}
            gl={{
              antialias: isSafari ? false : true,
              toneMapping: isSafari ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping,
              alpha: isSafari ? false : true,
            }}
            dpr={isSafari ? [1, 1.05] : (isMobile ? 0.7 : 1.2)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: -2,
              pointerEvents: 'none',
              background: '#000000',
              ...(isSafari ? {} : { mixBlendMode: 'screen' }),
            }}
            onCreated={({ camera }) => camera.layers.set(0)}
          >
            <Suspense fallback={null}>
              <Starfield
                mouse={mouse}
                scrollRef={smoothScroll}
                explosionFactor={explosionFactor}
                count={isSafari ? (isMobile ? 300 : 1200) : (isMobile ? 400 : 3000)}
              />

              {!isMobile && !isSafari && (
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

          {/* ───────────────── Saturn (в отдельном Canvas) ───────────────── */}
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0,
              width: '100vw', height: '100vh',
              zIndex: -1,
              pointerEvents: 'none',
              opacity: saturnVisible ? saturnOpacity : 0,
              transition: 'opacity 1.1s cubic-bezier(0.77,0,0.18,1)',
              willChange: 'opacity',
            }}
          >
            <Canvas
              camera={{ position: [0, 0, 8], fov: 35 }}
              gl={{
                antialias: isSafari ? false : true,
                toneMapping: isSafari ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping,
                alpha: isSafari ? false : true,
              }}
              dpr={isSafari ? [1, 1.05] : 1}
              style={{
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                pointerEvents: 'none',
                ...(isMobile ? {} : {
                  opacity: saturnOpacity,
                  transition: 'opacity 0.5s cubic-bezier(0.6,0.2,0.2,1)',
                  willChange: 'opacity',
                }),
              }}
              onCreated={({ camera }) => camera.layers.enable(1)}
            >
              <Suspense fallback={null}>
                <GlassSaturn mouse={mouse} scrollRef={smoothScroll} scale={saturnScale} />
                {!isSafari && (
                  <Environment files="/env/starfield_2k.hdr" background={false} />
                )}
              </Suspense>
            </Canvas>
          </div>
        </>
      )}
    </>
  )
}
