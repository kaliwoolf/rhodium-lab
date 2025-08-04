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
    float strength = 0.2;
    float radius = 0.15;

    if (dist > radius) discard; // ❗️ Убираем прямоугольник — остаётся только круг

    vec2 offset = normalize(uv - mouseUV) * strength * smoothstep(radius, 0.0, dist);
    vec4 baseColor = texture2D(uTexture, uv + offset);

    float glow = smoothstep(radius - 0.01, radius, dist);
    vec3 glowColor = vec3(1.4, 0.2, 1.0) * glow;

    gl_FragColor = vec4(baseColor.rgb + glowColor, 1.0);
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
    materialRef.current.uniforms.uMouse.value.copy(mouse.current)
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
