// components/GlassSaturn.js
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshPhysicalMaterial } from 'three'
import { useGLTF } from '@react-three/drei'

export default function GlassSaturn(props) {
  const saturnRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (saturnRef.current) {
      saturnRef.current.rotation.y = t * 0.05
    }
  })

  return (
    <group
      ref={saturnRef}
      position={[2, 1.5, 0]}
      rotation={[Math.PI / 6, Math.PI / 4, 0]} // наклон оси
      scale={[2.5, 2.5, 2.5]} // увеличенный размер
    >
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          transmission={1}
          roughness={0}
          thickness={0.5}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
          ior={1.5}
          color="#aaccff"
          side={2}
        />
      </mesh>
    </group>
  )
}
