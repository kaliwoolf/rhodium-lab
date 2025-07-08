// components/GlassSaturn.js
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
// Стало:
import {
  DoubleSide,
  MeshPhysicalMaterial,
  TextureLoader,
  AdditiveBlending,
  Color
} from 'three'

import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei' 

import * as THREE from 'three'


export default function GlassSaturn() {
  const ref = useRef()
  const ringRef = useRef()
  const mouse = useRef({ x: 0, y: 0 })

  // Покачивание
  useFrame(({ clock, mouse: m }) => {
    const t = clock.getElapsedTime()
    if (ref.current && ringRef.current) {
      mouse.current.x += (m.x - mouse.current.x) * 0.05
      mouse.current.y += (m.y - mouse.current.y) * 0.05

      const tilt = 0.15
      ref.current.rotation.x = mouse.current.y * tilt
      ref.current.rotation.y = mouse.current.x * tilt

      ringRef.current.rotation.x = Math.PI / 2.2
      ringRef.current.rotation.z = t * 0.02
    }
  })

  return (
    <group
      position={[3.3, 2, -2]}
      scale={[4.8, 4.8, 4.8]}
      rotation={[Math.PI / 5, Math.PI / 12, Math.PI / 32]}
    />
      {/* Сфера (Сатурн) */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.45, 64, 64]} />
        <MeshTransmissionMaterial
          resolution={1024}
          thickness={2}
          roughness={0.05}
          transmission={1}
          ior={1.4}
          chromaticAberration={0.1}
          anisotropy={0.2}
          distortion={0.15}
          distortionScale={0.5}
          temporalDistortion={0.3}
          backside
        />
      </mesh>

      {/* Кольца */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 1.1, 64]} />
        <meshStandardMaterial
          color="#222"
          opacity={0.4}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      <Environment background={false} resolution={512}>
        <Lightformer intensity={4} position={[5, 5, -5]} scale={[10, 10, 1]} color="#ffffff" />
        <Lightformer intensity={2} position={[-5, -5, 5]} scale={[10, 10, 1]} color="#88aaff" />
      </Environment>
    </group>
  )
}