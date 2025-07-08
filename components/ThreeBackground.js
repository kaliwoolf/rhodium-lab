// components/ThreeBackground.js
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import { Points, PointMaterial, Stars } from '@react-three/drei'
import GlassSaturn from '../components/GlassSaturn'
import * as THREE from 'three'

function Starfield({ mouse }) {
  const pointsRef = useRef()
  const count = 4000
  const clock = useRef({ elapsedTime: 0 })
  const offsets = useRef([])

  // Генерация звёзд и цветов
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
        // 65% — бело-серые
        r = g = b = 0.85 + Math.random() * 0.1
      } else if (roll < 0.80) {
        // 15% — жёлто-оранжевые
        r = 1.0
        g = 0.85 + Math.random() * 0.1
        b = 0.4 + Math.random() * 0.1
      } else if (roll < 0.90) {
        // 10% — синие
        r = 0.3 + Math.random() * 0.2
        g = 0.5 + Math.random() * 0.2
        b = 1.0
      } else if (roll < 0.95) {
        // 5% — фиолетовые
        r = 0.8 + Math.random() * 0.2
        g = 0.3 + Math.random() * 0.2
        b = 1.0
      } else if (roll < 0.975) {
        // 2.5% — красные
        r = 1.0
        g = 0.2 + Math.random() * 0.2
        b = 0.2
      } else {
        // 2.5% — зелёные
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

  
  // Анимация
 useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pos = pointsRef.current.geometry.attributes.position.array
    const o = offsets.current

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Смещение звезды по синусоиде
      const dx = 0.05 * Math.sin(t * 0.25 + o[i])
      const dy = 0.05 * Math.cos(t * 0.25 + o[i])

      pos[i3] += dx * 0.005 + mouse.current.x * 0.002
      pos[i3 + 1] += dy * 0.005 + mouse.current.y * 0.002
      // Z — остаётся на месте
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })



  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.1}
        sizeAttenuation
        depthWrite={false}
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -10,
        width: '100%',
        height: '100%',
      }}
      camera={{ position: [0, 0, 10], fov: 60 }}
    >
      <color attach="background" args={['#12161C']} />
      
      {/* 💡 Свет */}
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={3} color="#1d1f22" />
      
      <GlassSaturn mouse={mouse} />
      <Starfield mouse={mouse} />

      <EffectComposer>
        <Bloom
          intensity={2.8}
          luminanceThreshold={0.05}
          luminanceSmoothing={0.65}
          mipmapBlur={true}
        />
      </EffectComposer>
    </Canvas>
  )
}
