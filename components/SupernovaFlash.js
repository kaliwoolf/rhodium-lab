import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

export default function SupernovaFlash({ explosionFactor }) {
  const meshRef = useRef()
  const [opacity, setOpacity] = useState(0)
  const flashTime = useRef(0)
  const active = useRef(false)
  const hasFlashed = useRef(false)

  useFrame((_, delta) => {
    const triggered = explosionFactor > 0.95

    // 👉 запускаем один раз
    if (triggered && !hasFlashed.current && !active.current) {
      active.current = true
      hasFlashed.current = true
      flashTime.current = 0
      setOpacity(1)
    }

    // сбрасываем возможность вспышки, если прокрутка вернулась
    if (!triggered) {
      hasFlashed.current = false
    }

    // проигрываем затухание
    if (active.current) {
      flashTime.current += delta
      if (flashTime.current > 0.6) {
        active.current = false
        setOpacity(0)
      } else {
        setOpacity(1 - flashTime.current / 0.6)
      }
    }

    if (meshRef.current?.material) {
      meshRef.current.material.opacity = opacity
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial
        color="white"
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
