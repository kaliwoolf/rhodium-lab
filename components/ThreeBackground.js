// components/ThreeBackground.js
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import { Points, PointMaterial, Stars } from '@react-three/drei'
import * as THREE from 'three'

function Starfield() {
  const pointsRef = useRef()
  const count = 2000

  const { positions, colors } = useMemo(() => {
    const pos = []
    const col = []
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 50
      const y = (Math.random() - 0.5) * 50
      const z = -Math.random() * 100
      pos.push(x, y, z)

      // Цвета: серебро, золото, сапфир
      const roll = Math.random()
      let r, g, b

      if (roll < 0.7) {
        // серебро
        r = g = b = 0.85 + Math.random() * 0.1
      } else if (roll < 0.9) {
        // золото
        r = 1.0
        g = 0.85 + Math.random() * 0.1
        b = 0.4 + Math.random() * 0.1
      } else {
        // сапфир
        r = 0.3 + Math.random() * 0.2
        g = 0.5 + Math.random() * 0.2
        b = 1.0
      }

      col.push(r, g, b)
    }

    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col)
    }
  }, [count])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.01
    }
  })

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.25}
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
