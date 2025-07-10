import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SupernovaFlash({ explosionFactor }) {
  const meshRef = useRef()
  const [opacity, setOpacity] = useState(0)

  useFrame(() => {
    if (!meshRef.current) return

    const shouldFlash = explosionFactor > 0.95

    // Плавное появление и исчезновение
    setOpacity((prev) => {
      if (shouldFlash) {
        return Math.min(prev + 0.15, 1)
      } else {
        return Math.max(prev - 0.1, 0)
      }
    })

    meshRef.current.material.opacity = opacity
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="white" transparent opacity={0} />
    </mesh>
  )
}
