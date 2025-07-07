// components/ThreeBackground.js
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import { Points, PointMaterial, Stars } from '@react-three/drei'
import * as THREE from 'three'

function Starfield() {
  const pointsRef = useRef()
  const count = 2000
  const clock = useRef({ elapsedTime: 0 })
  const mouse = useRef({ x: 0, y: 0 })
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

      if (roll < 0.7) {
        r = g = b = 0.85 + Math.random() * 0.1
      } else if (roll < 0.9) {
        r = 1.0
        g = 0.85 + Math.random() * 0.1
        b = 0.4 + Math.random() * 0.1
      } else {
        r = 0.3 + Math.random() * 0.2
        g = 0.5 + Math.random() * 0.2
        b = 1.0
      }

      col.push(r, g, b)
    }

    offsets.current = offs
    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col)
    }
  }, [count])

  // Параллакс
  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  // Анимация
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (pointsRef.current) {
      const s = pointsRef.current.material
      s.size = 0.15 + 0.05 * Math.sin(t * 2.0)

      pointsRef.current.rotation.y = t * 0.05
      pointsRef.current.rotation.x = mouse.current.y * 0.1
      pointsRef.current.rotation.z = mouse.current.x * 0.1
    }
  })

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.2}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  )
}



export default function ThreeBackground() {
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
      <color attach="background" args={['#050510']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#9999ff" />

      <Starfield />

      <EffectComposer>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.75}
          mipmapBlur={true}
        />
      </EffectComposer>
    </Canvas>
  )
}
