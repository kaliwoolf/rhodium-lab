import { useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 mouseUV = uMouse / uResolution;
    vec2 uv = vUv;

    float dist = distance(uv, mouseUV);
    float strength = 0.2;    // 💥 было 0.05
    float radius = 0.2;      // 💥 чуть меньше, чтобы резче

    // 💧 Преломление
    vec2 refractOffset = normalize(uv - mouseUV) * strength * smoothstep(radius, 0.0, dist);
    vec3 baseColor = texture2D(uTexture, uv + (dist < radius ? refractOffset : vec2(0.0))).rgb;

    // ✨ Свечение по краю линзы
    float glow = exp(-50.0 * pow(dist - radius, 2.0));       // Узкая кайма
    vec3 glowColor = vec3(1.5, 0.4, 1.2) * glow;             // 💡 усилили цвет

    float vignette = smoothstep(0.0, radius, dist);
    baseColor *= 0.95 + 0.05 * vignette;

    gl_FragColor = vec4(baseColor + glowColor, 1.0);
  }
`

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export default function GlassLensShader({ texture, mouse }) {
  const materialRef = useRef()

  useFrame(({ size, clock }) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    materialRef.current.uniforms.uMouse.value = mouse.current
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height)
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        transparent
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uTexture: { value: texture },
        }}
      />
    </mesh>
  )
}
