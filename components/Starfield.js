'use client'

import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'

export default function Starfield({ mouse, scrollRef, explosionFactor }) {
  const pointsRef = useRef()
  const initialPositionsRef = useRef([])

  const [positions, o, factor] = useMemo(() => {
    const positions = []
    const o = []
    const count = 5000
    const f = 1.5 + Math.random()
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * 4
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      positions.push(x, y, z)
      o.push(Math.random() * 100)
    }
    initialPositionsRef.current = positions.slice() // ⬅ Сохраняем исходные
    return [positions, o, f]
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const positions = pointsRef.current.geometry.attributes.position.array
    const init = initialPositionsRef.current

    for (let i = 0; i < o.length; i++) {
      const i3 = i * 3

      const dx = 0.05 * Math.sin(t * 0.25 * factor + o[i])
      const dy = 0.05 * Math.cos(t * 0.25 * factor + o[i])

      positions[i3]     = init[i3]     + dx * 0.5 + mouse.current.x * 0.3
      positions[i3 + 1] = init[i3 + 1] + dy * 0.5 + mouse.current.y * 0.3
      positions[i3 + 2] = init[i3 + 2] // z остаётся без изменений
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group>
      <Points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={new Float32Array(positions)}
            itemSize={3}
          />
        </bufferGeometry>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}
