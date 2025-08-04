'use client'

import * as THREE from 'three'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { useRef, useEffect } from 'react'

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
      float glow = smoothstep(pulse, pulse - 0.02, dist);
      gl_FragColor = vec4(1.0, 0.2, 0.5, glow * opacity);
    }
  `
)

extend({ EnergyMaterial })

export default function EnergyPulse() {
  const ref = useRef()
  const meshRef = useRef()
  const { camera } = useThree()

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.uniforms.time.value = clock.getElapsedTime()
    }
  })

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.layers.set(2) // 👈 вот тут задаём слой 2
    }
    camera.layers.enable(2) // чтобы камера этот слой тоже видела
  }, [camera])

  return (
    <mesh ref={meshRef} scale={[3, 3, 1]} position={[0, 0, -1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <energyMaterial ref={ref} transparent />
    </mesh>
  )
}
