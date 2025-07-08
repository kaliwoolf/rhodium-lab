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
    <group position={[2.5, 1.6, -2]} scale={[7, 7, 7]} rotation={[0.45, 0, 0.46]}>
      {/* Маска чтобы звезды не просвечивали */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[0.44, 64, 64]} />
         <meshStandardMaterial
            color="black"
            transparent
            opacity={0.99}
            depthWrite
          />
      </mesh>

      {/* Стеклянная сфера */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[0.45, 64, 64]} />
        <MeshTransmissionMaterial
          resolution={1024}
          thickness={1.5}
          roughness={0.15}
          transmission={0.95}
          ior={1.15}
          chromaticAberration={0.08}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.3}
          temporalDistortion={0.2}
          backside
        />
      </mesh>

      {/* Кольца */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]} renderOrder={3}>
        <ringGeometry args={[0.6, 1.2, 128]} />
        <meshBasicMaterial
          color="#111"
          opacity={0.3}
          transparent
          depthWrite={true}
          side={DoubleSide}
        />
      </mesh>

      {/* Свет */}
      <Environment background={false} resolution={512}>
        <Lightformer intensity={0.8} position={[5, 5, -5]} scale={[4, 4, 1]} color="#aaaaff" /> 
        {/* <Lightformer intensity={0.5} position={[-5, -5, 5]} scale={[5, 5, 1]} color="#555577" /> */}
      </Environment>
    </group>
  )
}