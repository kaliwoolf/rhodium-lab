import React, { useRef, useEffect } from 'react'
import { useFrame, useThree, useLoader } from '@react-three/fiber'
import { RGBELoader } from 'three-stdlib'
import {
  DoubleSide
} from 'three'
import * as THREE from 'three'


export default function GlassSaturn() {
  const ref = useRef()
  const ringRef = useRef()
  const { scene } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  const hdrTexture = useLoader(RGBELoader, '/env/satara_night_no_lamps_1k.hdr')
  hdrTexture.mapping = THREE.EquirectangularReflectionMapping

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

      {/* Стеклянный Сатурн */}
      <mesh ref={ref} renderOrder={1}>
        <sphereGeometry args={[0.52, 128, 128]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={1.6}
          roughness={0.05}
          ior={1.52}
          reflectivity={0.6}
          clearcoat={1}
          clearcoatRoughness={0}
          metalness={0}
          envMapIntensity={0}
          opacity={0.3}
          transparent
          attenuationColor="#0f1015"
          attenuationDistance={0.2}
        />
      </mesh>

      {/* Внутренний свет */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2.5}
        distance={2}
        decay={2}
        color="#aaffff"
      />

      {/* Кольца */}
      <group position={[0, 0.1, 0]} rotation={[Math.PI / 2.2, 0, 0]} renderOrder={4} ref={ringRef}>
        <mesh>
          <ringGeometry args={[0.6, 0.9, 128]} />
          <meshPhysicalMaterial
            envMap={hdrTexture}
            color="#c0d8ff"
            transmission={1}
            thickness={0.2}
            roughness={0.3}
            ior={1.3}
            reflectivity={0.05}
            clearcoat={1}
            clearcoatRoughness={0.4}
            transparent
            side={DoubleSide}
            envMapIntensity={1.2}
            depthWrite={true}
          />
        </mesh>

        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[0.6, 0.9, 128]} />
          <meshPhysicalMaterial
            envMap={hdrTexture}
            transmission={1}
            thickness={0.2}
            roughness={0.3}
            ior={1.3}
            reflectivity={0.05}
            clearcoat={1}
            clearcoatRoughness={0.4}
            transparent
            side={DoubleSide}
            envMapIntensity={1}
            depthWrite={true}
          />
        </mesh>

        {/* Тень от планеты */}
        <mesh position={[0, 0, -0.005]} renderOrder={0}>
          <ringGeometry args={[0.55, 0.9, 128]} />
          <meshBasicMaterial
            color="black"
            opacity={0.5}
            transparent
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  )
}
