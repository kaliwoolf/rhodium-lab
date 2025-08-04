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
    vec2 mouseUV = uMouse;
    vec2 uv = vUv;

    float dist = distance(uv, mouseUV);
    float radius = 0.15;
    float strength = 0.12;

    // Преломление под курсором
    vec2 offset = normalize(uv - mouseUV) * strength * smoothstep(radius, 0.0, dist);
    vec4 baseColor = texture2D(uTexture, uv + (dist < radius ? offset : vec2(0.0)));

    // Светящийся обод
    float edge = smoothstep(radius - 0.01, radius, dist);
    vec3 glowColor = vec3(2.0, 0.4, 1.4) * edge; // яркая фуксия

    // Усилим насыщенность внутри линзы
    baseColor.rgb *= 1.2;

    gl_FragColor = vec4(glowColor, 1.0);
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
