// components/GlassSaturn.js
import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
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
      
      {/* Внешняя стеклянная оболочка */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[0.52, 64, 64]} />
          <meshPhysicalMaterial
            transparent
            transmission={1}
            thickness={1.6}
            roughness={0}
            ior={1.52}
            reflectivity={0.8}
            clearcoat={1}
            clearcoatRoughness={0}
            metalness={0}
            envMapIntensity={1.2}
            color="#ffffff"
            attenuationDistance={0.5}
            attenuationColor="#ffffff"
          />
      </mesh>

      {/* Кольца — двойной слой для псевдо-объёма */}
        <group position={[0, 0.1, 0]} rotation={[Math.PI / 2.2, 0, 0]} renderOrder={4}>
          {/* Нижнее кольцо */}
          <mesh>
            <ringGeometry args={[0.6, 0.9, 128]} />
            <meshPhysicalMaterial
              color="#12161C"
              transmission={1}
              thickness={0.2}
              roughness={0.3}
              ior={1.3}
              reflectivity={0.05}
              clearcoat={1}
              clearcoatRoughness={0.4}
              transparent
              side={DoubleSide}
              envMapIntensity={0.2}
              depthWrite={true}
            />
          </mesh>

          {/* Верхнее кольцо, чуть ближе к камере */}
          <mesh position={[0, 0, 0.02]}>
            <ringGeometry args={[0.6, 0.9, 128]} />
            <meshPhysicalMaterial
              color="#12161C"
              transmission={1}
              thickness={0.2}
              roughness={0.3}
              ior={1.3}
              reflectivity={0.05}
              clearcoat={1}
              clearcoatRoughness={0.4}
              transparent
              side={DoubleSide}
              envMapIntensity={0}
              depthWrite={true}
            />
          </mesh>

          {/* "Тень" под кольцами от планеты */}
          <mesh position={[0, 0, -0.005]} renderOrder={0}>
            <ringGeometry args={[0.55, 0.9, 128]} />
            <meshBasicMaterial
              color="black"
              opacity={0.5} // ← можно регулировать силу тени
              transparent
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>

        </group>

      {/* Свет */}
      <Environment preset="studio" background={false}>
        <Lightformer intensity={2.5} position={[6, 4, -4]} scale={[5, 5, 1]} color="#445566" />
        <Lightformer intensity={3} position={[0, 0, 5]} scale={[4, 4, 1]} color="#ffffff" />
      </Environment>
    </group>
  )
}