import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SupernovaFlash({ explosionFactor }) {
  const meshRef = useRef()
  const [opacity, setOpacity] = useState(0)

  useFrame(() => {
    if (!meshRef.current) return

    const flash = explosionFactor > 0.95
    setOpacity((prev) =>
      flash ? Math.min(prev + 0.15, 1) : Math.max(prev - 0.08, 0)
    )
    meshRef.current.material.opacity = opacity
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial
        color="white"
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
