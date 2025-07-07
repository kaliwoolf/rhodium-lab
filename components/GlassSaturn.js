import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

export default function GlassSaturn({ mouse }) {
  const saturnRef = useRef()
  const ringsRef = useRef()

  // Покачивание при движении мыши
  useFrame(() => {
    if (saturnRef.current) {
      saturnRef.current.rotation.y += 0.002
      saturnRef.current.rotation.x += (mouse.current.y - saturnRef.current.rotation.x) * 0.02
      saturnRef.current.rotation.z += (mouse.current.x - saturnRef.current.rotation.z) * 0.02
    }

    if (ringsRef.current) {
      ringsRef.current.rotation.z = 0.4 // Наклон колец
    }
  })

  return (
    <group position={[1.2, 0.6, 0]}>
      {/* Сам Сатурн — кристаллический */}
      <mesh ref={saturnRef}>
        <icosahedronGeometry args={[0.5, 2]} />
        <MeshTransmissionMaterial
          backside
          thickness={0.6}
          roughness={0}
          transmission={1}
          ior={1.5}
          chromaticAberration={0.06}
          anisotropy={0.1}
          distortion={0.4}
          distortionScale={0.5}
          temporalDistortion={0.2}
          clearcoat={1}
          attenuationColor="#aaffff"
          attenuationDistance={1.2}
        />
      </mesh>

      {/* Кольца */}
      <mesh ref={ringsRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 1.1, 64]} />
        <meshBasicMaterial color="#8899ff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Окружение для преломлений */}
      <Environment preset="sunset" background={false} />
    </group>
  )
}
