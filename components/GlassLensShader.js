'use client'

import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const fragmentShader = `
uniform vec2 uMouse;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec2 mouseUV = uMouse / uResolution;
  float dist = distance(vUv, mouseUV);
  float radius = 0.2;
  float glow = smoothstep(radius, 0.0, dist);

  vec3 color = mix(vec3(1.0, 0.0, 1.0), vec3(0.0), glow);
  gl_FragColor = vec4(color, 1.0);
}
`

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

function Lens({ mouse }) {
  const materialRef = useRef()
  const { size } = useThree()

  useFrame(() => {
    if (!materialRef.current) return
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
        uniforms={{
          uMouse: { value: new THREE.Vector2(0, 0) },
          uResolution: { value: new THREE.Vector2(1, 1) },
        }}
      />
    </mesh>
  )
}

export default function DebugLens() {
  const mouse = useRef(new THREE.Vector2(0, 0))

  return (
    <div
      style={{ width: '100vw', height: '100vh' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouse.current.set(e.clientX - rect.left, rect.height - (e.clientY - rect.top))
      }}
    >
      <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
        <Lens mouse={mouse} />
      </Canvas>
    </div>
  )
}
