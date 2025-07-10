import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function SupernovaFlash({ explosionFactor }) {
  const meshRef = useRef()
  const flashTime = useRef(0)
  const active = useRef(false)
  const hasFlashed = useRef(false)
  const ready = useRef(false)

  useFrame((_, delta) => {
    const triggered = explosionFactor > 0.95
    const material = meshRef.current?.material

    // ждём первого "живого" explosionFactor
    if (explosionFactor < 0.01) return
    if (!ready.current) {
      ready.current = true
      return
    }

    // вспышка один раз
    if (triggered && !hasFlashed.current && !active.current) {
      active.current = true
      hasFlashed.current = true
      flashTime.current = 0
      if (material) material.uniforms.uIntensity.value = 1
    }

    if (!triggered) {
      hasFlashed.current = false
    }

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
            float core = smoothstep(0.03, 0.0, dist);
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
