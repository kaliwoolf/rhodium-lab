import React, { useRef, useEffect } from 'react'
import { useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

export default function GlassSaturn({ mouse }) {
  const ref = useRef()
  const ringRef = useRef()

  const baseScale = 1

  useFrame(({ clock, mouse: m }) => {
    const t = clock.getElapsedTime()

    if (ref.current && ringRef.current) {
      mouse.current.x += (m.x - mouse.current.x) * 0.05
      mouse.current.y += (m.y - mouse.current.y) * 0.05

      const tilt = 0.15
      ref.current.rotation.x = mouse.current.y * tilt
      ref.current.rotation.y = mouse.current.x * tilt

      // 💡 Добавим мягкую "пульсацию" от мыши
      const scalePulse = baseScale + 0.015 * (mouse.current.x ** 2 + mouse.current.y ** 2)
      ref.current.scale.set(scalePulse, scalePulse, scalePulse)

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
          thickness={2.5}
          roughness={0.05}
          ior={1.5}
          reflectivity={0.2}
          clearcoat={1}
          clearcoatRoughness={0}
          metalness={0}
          envMapIntensity={0.6}
          opacity={0.08}
          transparent
          attenuationColor="#0b1118"
          attenuationDistance={0.15}
        />
      </mesh>

      
      {/* Объёмные кольца (торы) */}
     <group ref={ringRef} renderOrder={1} position={[0, 0.1, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
      {/* Внешний тор — шире */}
      <mesh scale={[1.08, 1.08, 0.15]}>
        <torusGeometry args={[0.61, 0.025, 64, 256]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.6}
          roughness={0.1}
          ior={1.52}
          reflectivity={0.1}
          clearcoat={1}
          clearcoatRoughness={0.2}
          envMapIntensity={0.1}
          attenuationColor="#0a0d12"
          attenuationDistance={0.25}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Внутренний тор — ближе к планете */}
      <mesh scale={[1.0, 1.0, 0.15]}>
        <torusGeometry args={[0.57, 0.025, 64, 256]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.6}
          roughness={0.1}
          ior={1.52}
          reflectivity={0.1}
          clearcoat={1}
          clearcoatRoughness={0.2}
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
