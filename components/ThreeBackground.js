// components/ThreeBackground.js
import React, { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Points, PointMaterial, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import GlassSaturn from './GlassSaturn'

function Starfield({ mouse }) {
  const pointsRef = useRef()
  const count = 4000
  const offsets = useRef([])

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
    const pos = posAttr.array
    const o = offsets.current

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const dx = 0.05 * Math.sin(t * 0.25 + o[i])
      const dy = 0.05 * Math.cos(t * 0.25 + o[i])
      pos[i3] += dx * 0.005 + mouse.current.x * 0.002
      pos[i3 + 1] += dy * 0.005 + mouse.current.y * 0.002
    }

    posAttr.needsUpdate = true
  })

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.1}
        sizeAttenuation
        depthWrite={true}
      />
    </Points>
  )
}

export default function ThreeBackground() {
  const mouse = useRef({ x: 0, y: 0 })

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

  return (
    <Canvas
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ position: [0, 0, 6], fov: 35 }}
      style={{ width: '100%', height: '100vh', background: '#05070a' }}
    >
      <Suspense fallback={null}>
        <Starfield mouse={mouse} />
        <GlassSaturn mouse={mouse} />
        <Environment preset="studio" background={false} />
        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.2} />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0015, 0.001]}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
