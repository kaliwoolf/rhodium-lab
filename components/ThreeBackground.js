// components/ThreeBackground.js
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import { Points, PointMaterial, Stars } from '@react-three/drei'
import * as THREE from 'three'

function Starfield() {
  const pointsRef = useRef()
  const count = 2000

  const positions = useMemo(() => {
    const pos = []
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 50
      const y = (Math.random() - 0.5) * 50
      const z = -Math.random() * 100
      pos.push(x, y, z)
    }
    return new Float32Array(pos)
  }, [count])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.01
    }
  })

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#b7f0ff"
        size={0.15}
        sizeAttenuation={true}
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
      <Stars radius={80} depth={50} count={5000} factor={4} fade />
    </Canvas>
  )
}
