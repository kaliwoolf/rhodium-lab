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
          transmission={1} // стеклянная прозрачность
          thickness={1} // толщина стекла
          roughness={0.05} // почти гладкий
          metalness={0}
          ior={1.52} // индекс преломления стекла
          reflectivity={1}
          transparent
          opacity={0.7}
          attenuationDistance={0.5}
          attenuationColor="#88ccff"
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[1.5, 2.2, 64]} />
        <meshBasicMaterial color="#88ccff" opacity={0.2} transparent side={DoubleSide} />
      </mesh>
    </group>
  )
}
