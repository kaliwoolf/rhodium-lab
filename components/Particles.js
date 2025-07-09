// components/Particles.js
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Particles({ opacity }) {
  const ref = useRef()

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 10
      const y = (Math.random() - 0.5) * 10
      const z = (Math.random() - 0.5) * 10
      temp.push(x, y, z)
    }
    return new Float32Array(temp)
  }, [])

  useFrame(() => {
    ref.current.rotation.y += 0.001
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  )
}
