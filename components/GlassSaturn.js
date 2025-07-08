import React, { useRef, useEffect } from 'react'
import { useFrame, useThree, useLoader } from '@react-three/fiber'
import { RGBELoader } from 'three-stdlib'
import * as THREE from 'three'

export default function GlassSaturn() {
  const ref = useRef()
  const ringRef = useRef()
  const mouse = useRef({ x: 0, y: 0 })

  const hdrTexture = useLoader(RGBELoader, '/env/satara_night_no_lamps_1k.hdr')
  hdrTexture.mapping = THREE.EquirectangularReflectionMapping

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
      <mesh ref={ref} renderOrder={2}>
        <sphereGeometry args={[0.52, 128, 128]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={1.6}
          roughness={0.01}
          ior={1.52}
          reflectivity={0.1}
          clearcoat={1}
          clearcoatRoughness={0.2}
          metalness={0}
          envMap={hdrTexture}
          envMapIntensity={0.3}
          opacity={0.05}
          transparent
          attenuationColor="#0b1118"
          attenuationDistance={0.3}
        />
      </mesh>

      <mesh scale={[1.015, 1.015, 1.015]}>
        <sphereGeometry args={[0.52, 128, 128]} />
        <meshBasicMaterial
          color="#aaffff"
          transparent
          opacity={0.025}
          depthWrite={false}
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

      <spotLight
        position={[2, 3, 3]}
        angle={0.5}
        penumbra={1}
        intensity={0.8}
        decay={2}
        color="#99ccff"
      />

      <pointLight
        position={[-2, 1.5, 2]}
        intensity={2.0}
        distance={5}
        decay={2}
        color="#aaccff"
      />


      {/* Объёмные кольца (торы) */}
     <group ref={ringRef} enderOrder={1}> position={[0, 0.1, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
      {/* Внешний тор — шире */}
      <mesh scale={[1.35, 1.35, 0.2]}>
        <torusGeometry args={[0.65, 0.03, 64, 256]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.6}
          roughness={0.1}
          ior={1.52}
          reflectivity={0.1}
          clearcoat={1}
          clearcoatRoughness={0.2}
          envMap={hdrTexture}
          envMapIntensity={0.1}
          attenuationColor="#0a0d12"
          attenuationDistance={0.25}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Внутренний тор — ближе к планете */}
      <mesh scale={[1.2, 1.2, 0.15]}>
        <torusGeometry args={[0.56, 0.02, 64, 256]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.6}
          roughness={0.1}
          ior={1.52}
          reflectivity={0.1}
          clearcoat={1}
          clearcoatRoughness={0.2}
          envMap={hdrTexture}
          envMapIntensity={0.1}
          attenuationColor="#0a0d12"
          attenuationDistance={0.25}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>

    </group>
  )
}
