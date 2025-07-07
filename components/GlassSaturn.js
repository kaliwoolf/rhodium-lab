// components/GlassSaturn.js
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
  DoubleSide,
  MeshPhysicalMaterial,
  MeshTransmissionMaterial,
  TextureLoader,
  AdditiveBlending,
  Color
} from 'three'

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
    <group position={[2.5, 1.6, -2]} scale={[1.2, 1.2, 1.2]}>
      {/* Сфера (Сатурн) */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.45, 64, 64]} />
        <MeshTransmissionMaterial
          resolution={1024}
          thickness={1.5}
          roughness={0}
          transmission={1}
          ior={1.3}
          chromaticAberration={0.08}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.3}
          temporalDistortion={0.2}
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

      <Environment preset="sunset" background={false} />
    </group>
  )
}