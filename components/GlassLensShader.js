import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const fragmentShader = `
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 mouseUV = uMouse / uResolution;
    vec2 uv = vUv;

    float dist = distance(uv, mouseUV);
    float strength = 0.3;
    float radius = 0.2;

    // 🔍 Градиентная заливка по UV
    vec3 base = vec3(uv.x, uv.y, 0.5);

    // 🔮 Искажение внутри радиуса
    vec2 offset = normalize(uv - mouseUV) * strength * smoothstep(radius, 0.0, dist);
    vec3 lens = vec3(1.0, 0.0, 1.0) * smoothstep(radius - 0.01, radius, dist);

    // 💡 Центр мыши — белое пятно
    float centerGlow = smoothstep(0.01, 0.0, dist);
    vec3 glow = vec3(centerGlow);

    gl_FragColor = vec4(base + lens + glow, 1.0);
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
