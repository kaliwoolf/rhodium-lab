import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 dir = uv - uMouse;
    float dist = length(dir);

    float ripple = 0.03 * sin(40.0 * dist - uTime * 5.0);
    uv += normalize(dir) * ripple * smoothstep(0.2, 0.0, dist);

    vec3 color = vec3(0.05, 0.015, 0.1);
    float vignette = smoothstep(0.9, 0.2, dist);
    gl_FragColor = vec4(color + ripple * 0.5, vignette);
  }
`

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

export default function RippleShaderPlane({ mouse }) {
  const materialRef = useRef()

  useFrame(({ clock, size }) => {
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
        }}
      />
    </mesh>
  )
}
