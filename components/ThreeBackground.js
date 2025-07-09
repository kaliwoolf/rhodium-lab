// components/ThreeBackground.js
import React, { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Points, PointMaterial, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import GlassSaturn from './GlassSaturn'
import { useScroll } from 'framer-motion'
import DynamicBloom from './DynamicBloom'



function Starfield({ mouse, scrollRef, explosionFactor }) {
  const pointsRef = useRef()
  const count = 4000
  const offsets = useRef([])
  const originalColorsRef = useRef([])
  const targetColorsRef = useRef([])


  const { positions, colors } = useMemo(() => {
    const pos = []
    const col = []
    const offs = []

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 50
      const y = (Math.random() - 0.5) * 50
      const z = -Math.random() * 100
      pos.push(x, y, z)
      offs.push(Math.random() * Math.PI * 2)

      const roll = Math.random()
      let r, g, b

      if (roll < 0.65) {
        r = g = b = 0.85 + Math.random() * 0.1
      } else if (roll < 0.80) {
        r = 1.0
        g = 0.85 + Math.random() * 0.1
        b = 0.4 + Math.random() * 0.1
      } else if (roll < 0.90) {
        r = 0.3 + Math.random() * 0.2
        g = 0.5 + Math.random() * 0.2
        b = 1.0
      } else if (roll < 0.95) {
        r = 0.8 + Math.random() * 0.2
        g = 0.3 + Math.random() * 0.2
        b = 1.0
      } else if (roll < 0.975) {
        r = 1.0
        g = 0.2 + Math.random() * 0.2
        b = 0.2
      } else {
        r = 0.3
        g = 1.0
        b = 0.5
      }

      col.push(r, g, b)
      originalColorsRef.current.push(r, g, b)

      const hue = Math.floor(Math.random() * 360)
      const [tr, tg, tb] = new THREE.Color(`hsl(${hue}, 100%, 65%)`).toArray()
      targetColorsRef.current.push(tr, tg, tb)

    }

    offsets.current = offs
    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col)
    }
  }, [count])

  useFrame(({ clock }) => {
    if (!pointsRef.current || !pointsRef.current.geometry) return
    const posAttr = pointsRef.current.geometry.attributes.position
    if (!posAttr) return

    const t = clock.getElapsedTime()
    const scroll = scrollRef?.current || 0
    const factor = 1.0 - Math.min(scroll * 1.5, 0.95)
    const colorShift = Math.min(scroll * 2, 1)

    const pos = posAttr.array
    const o = offsets.current
    const colAttr = pointsRef.current.geometry.attributes.color
    const col = colAttr.array

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      const dx = 0.05 * Math.sin(t * 0.25 * factor + o[i])
      const dy = 0.05 * Math.cos(t * 0.25 * factor + o[i])
      pos[i3] += dx * 0.005 + mouse.current.x * 0.002
      pos[i3 + 1] += dy * 0.005 + mouse.current.y * 0.002

      const baseR = originalColorsRef.current[i3]
      const baseG = originalColorsRef.current[i3 + 1]
      const baseB = originalColorsRef.current[i3 + 2]

      // Вычисляем контрастную цель — например, смещаем к фиолетово-красным оттенкам
      const targetR = targetColorsRef.current[i3]
      const targetG = targetColorsRef.current[i3 + 1]
      const targetB = targetColorsRef.current[i3 + 2]


      let r = baseR * (1.0 - colorShift) + targetR * colorShift
      let g = baseG * (1.0 - colorShift) + targetG * colorShift
      let b = baseB * (1.0 - colorShift) + targetB * colorShift

      r = r + explosionFactor * (1.0 - r)
      g = g * (1.0 - explosionFactor * 0.6)
      b = b + explosionFactor * (1.0 - b)

      col[i3]     = Math.min(r, 1.0)
      col[i3 + 1] = Math.min(g, 1.0)
      col[i3 + 2] = Math.min(b, 1.0)
      }


    posAttr.needsUpdate = true
    colAttr.needsUpdate = true
  })

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} layers={0}>
      <PointMaterial
        transparent
        vertexColors
         size={0.1 + explosionFactor * 0.4}
        sizeAttenuation
        depthWrite={true}
      />
    </Points>
  )
}

export default function ThreeBackground() {
  const mouse = useRef({ x: 0, y: 0 })

  const scrollRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY / window.innerHeight
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMouseMove = (e) => {
      const targetX = (e.clientX / window.innerWidth - 0.5) * 2
      const targetY = -(e.clientY / window.innerHeight - 0.5) * 2
      mouse.current.x += (targetX - mouse.current.x) * 0.05
      mouse.current.y += (targetY - mouse.current.y) * 0.05
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const scroll = scrollRef.current || 0
  const explosionFactor = scroll > 1.5 ? Math.min((scroll - 1.5) * 2, 1.0) : 0


  return (
  <>
    <Canvas
      camera={{ position: [0, 0, 9], fov: 35 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        pointerEvents: 'none',
        background: '#000000',
      }}
      onCreated={({ camera }) => camera.layers.set(0)}
    >
      <Suspense fallback={null}>
        <Starfield mouse={mouse} scrollRef={scrollRef} explosionFactor={explosionFactor} />

        {/* 💥 Белая вспышка на весь экран */}
        <mesh visible={explosionFactor > 0.8}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color="white" transparent opacity={explosionFactor} />
          <primitive object={new THREE.Mesh()} />
        </mesh>  

        <EffectComposer>
          <DynamicBloom explosionFactor={explosionFactor} />
        </EffectComposer>
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
        pointerEvents: 'none',
      }}
      onCreated={({ camera }) => camera.layers.enable(1)}
    >
      <Suspense fallback={null}>

        <GlassSaturn mouse={mouse} scrollRef={scrollRef} />

        <Environment
          files="/env/starfield_2k.hdr"
          background={false}
        />

      </Suspense>
    </Canvas>
  </>
  )

}
