import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function SupernovaFlash({ explosionFactor }) {
  const meshRef = useRef()
  const flashTime = useRef(0)
  const active = useRef(false)
  const hasFlashed = useRef(false)
  const ready = useRef(false) // ✅ ← сюда

  useFrame((_, delta) => {
    const triggered = explosionFactor > 0.95
    const material = meshRef.current?.material

    // ⛔ не запускаем, пока не появилось нормальное значение
    if (explosionFactor < 0.01) return
    if (!ready.current) {
      ready.current = true
      return
    }

    // Вспышка один раз
    if (triggered && !hasFlashed.current && !active.current) {
      active.current = true
      hasFlashed.current = true
      flashTime.current = 0
      if (material) material.uniforms.uIntensity.value = 1
    }

    // Сброс
    if (!triggered) {
      hasFlashed.current = false
    }

    // Плавное затухание
    if (active.current) {
      flashTime.current += delta
      if (flashTime.current > 0.5) {
        active.current = false
        if (material) material.uniforms.uIntensity.value = 0
      } else {
        const t = flashTime.current
        const fade = t < 0.1 ? 1 : 1 - (t - 0.1) / 0.4
        if (material) material.uniforms.uIntensity.value = Math.max(fade, 0)
      }
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -4]} renderOrder={100}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        toneMapped={false}
        uniforms={{
          uIntensity: { value: 0 },
        }}
        vertexShader={`...`}
        fragmentShader={`...`}
      />
    </mesh>
  )
}
