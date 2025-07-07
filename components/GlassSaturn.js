// components/GlassSaturn.js
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, Environment } from '@react-three/drei'
import * as THREE from 'three'

export default function GlassSaturn({ mouse }) {
  const groupRef = useRef()
  const sphereRef = useRef()
  const ringRef = useRef()

  // Анимация качания
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = 0.3 + mouse.current.y * 0.1
      groupRef.current.rotation.y = 0.8 + mouse.current.x * 0.1
    }
  })

  return (
    <>
      <group
        ref={groupRef}
        position={[1.5, 1.6, 0]}
        scale={2.5}
        rotation={[0.5, -0.3, 0]}
      >
        {/* Сатурн */}
        <mesh ref={sphereRef}>
          <sphereGeometry args={[0.4, 128, 128]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            thickness={0.8}
            roughness={0.05}
            transmission={1}
            ior={1.6}
            chromaticAberration={0.02}
            anisotropy={0.05}
            distortion={0.3}
            distortionScale={0.2}
            temporalDistortion={0.2}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </mesh>

        {/* Кольца */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.85, 64]} />
          <meshStandardMaterial
            color={'#88ccff'}
            transparent
            opacity={0.12}
            emissive={'#88ccff'}
            emissiveIntensity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Среда — не фон, только рефлексия */}
      <Environment preset="sunset" background={false} blur={0.9} />
    </>
  )
}
