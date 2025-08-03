import { useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import glsl from 'babel-plugin-glsl/macro'

const RippleMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0.5, 0.5),
    uResolution: new THREE.Vector2(1, 1)
  },
  // Vertex shader
  glsl`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  // Fragment shader
  glsl`
    precision mediump float;

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

      vec3 color = vec3(0.02, 0.015, 0.03); // оттенок стекла
      float vignette = smoothstep(0.9, 0.2, dist);
      gl_FragColor = vec4(color + ripple * 0.4, vignette);
    }
  `
)

extend({ RippleMaterial })

export default function RippleShaderPlane({ mouse }) {
  const materialRef = useRef()

  useFrame(({ clock, size }) => {
    if (!materialRef.current) return
    materialRef.current.uTime = clock.getElapsedTime()
    materialRef.current.uMouse.set(mouse.current.x, 1.0 - mouse.current.y)
    materialRef.current.uResolution.set(size.width, size.height)
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <rippleMaterial ref={materialRef} transparent />
    </mesh>
  )
}
