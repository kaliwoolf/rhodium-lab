'use client'

import * as THREE from 'three'
import { extend, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { useRef } from 'react'

const EnergyMaterial = shaderMaterial(
  { time: 0, opacity: 0.15 },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    uniform float time;
    uniform float opacity;
    varying vec2 vUv;

    void main() {
      float dist = distance(vUv, vec2(0.5));
      float pulse = sin(time * 2.0) * 0.2 + 0.3;
      float glow = smoothstep(pulse, pulse - 0.05, dist);
      gl_FragColor = vec4(1.0, 0.2, 0.5, glow * opacity); // Цвет и сила
    }
  `
)

extend({ EnergyMaterial })

export default function EnergyPulse() {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.uniforms.time.value = clock.elapsedTime
    }
  })

  return (
    <mesh scale={[8, 8, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <energyMaterial ref={ref} transparent />
    </mesh>
  )
}
