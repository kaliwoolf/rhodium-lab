import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

export default function SupernovaFlash({ explosionFactor }) {
  const meshRef = useRef()
  const flashTime = useRef(0)
  const active = useRef(false)
  const hasFlashed = useRef(false)

  useFrame((_, delta) => {
    const triggered = explosionFactor > 0.95

    if (triggered && !hasFlashed.current && !active.current) {
      active.current = true
      hasFlashed.current = true
      flashTime.current = 0
    }

    if (!triggered) {
      hasFlashed.current = false
    }

    if (active.current) {
      flashTime.current += delta
      const material = meshRef.current?.material
      if (flashTime.current > 0.5) {
        active.current = false
        material.uniforms.uIntensity.value = 0
      } else {
        // Всплеск: быстро до пика за 0.1 сек → потом затухание
        const t = flashTime.current
        const i = t < 0.1
          ? t / 0.1                  // подъем
          : 1 - (t - 0.1) / 0.4      // спад

        material.uniforms.uIntensity.value = Math.max(i, 0)
      }
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        toneMapped={false}
        uniforms={{
          uIntensity: { value: 0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uIntensity;

          void main() {
            float dist = distance(vUv, vec2(0.5));
            float core = smoothstep(0.02, 0.0, dist);
            float glow = smoothstep(0.2, 0.05, dist);
            vec3 color = mix(vec3(1.0, 0.8, 0.6), vec3(1.0), core);
            float alpha = uIntensity * (glow * 0.6 + core * 1.2);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  )
}
