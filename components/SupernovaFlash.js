import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

export default function SupernovaFlash({ explosionFactor }) {
  const meshRef = useRef()
  const [intensity, setIntensity] = useState(0)

  useFrame(() => {
    const shouldFlash = explosionFactor > 0.95
    setIntensity((prev) =>
      shouldFlash ? Math.min(prev + 0.1, 1) : Math.max(prev - 0.05, 0)
    )

    if (meshRef.current?.material?.uniforms) {
      meshRef.current.material.uniforms.uIntensity.value = intensity
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
            float glow = smoothstep(0.25, 0.0, dist);
            float core = smoothstep(0.03, 0.0, dist);
            vec3 glowColor = vec3(1.0, 0.2, 0.9); // пурпурно-бело-фиолетовая
            vec3 color = mix(vec3(0.0), glowColor, glow + core);
            float alpha = uIntensity * (glow * 0.9 + core * 1.0);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  )
}
