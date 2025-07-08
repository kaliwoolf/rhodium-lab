import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

export default function GlassSaturn({ mouse }) {
  const ref = useRef()
  const ringRef = useRef()

  // Загрузка текстур для внешнего кольца
  const ringTexture = useLoader(TextureLoader, '/textures/saturn_ring_texture.png')
  const ringAlphaMap = useLoader(TextureLoader, '/textures/saturn_ring_alpha_map.png')

  const baseScale = 1

  useFrame(({ clock, mouse: m }) => {
    const t = clock.getElapsedTime()

    if (ref.current && ringRef.current) {
      mouse.current.x += (m.x - mouse.current.x) * 0.05
      mouse.current.y += (m.y - mouse.current.y) * 0.05

      const tilt = 0.15
      ref.current.rotation.x = mouse.current.y * tilt
      ref.current.rotation.y = mouse.current.x * tilt

      // Пульсация от мыши
      const scalePulse = baseScale + 0.015 * (mouse.current.x ** 2 + mouse.current.y ** 2)
      ref.current.scale.set(scalePulse, scalePulse, scalePulse)

      // Плавное вращение колец
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

      {/* Гибридное кольцо */}
      <group ref={ringRef} position={[0, 0.1, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
        
        {/* Внутренний стеклянный тор */}
        <mesh>
          <torusGeometry args={[0.6, 0.02, 64, 256]} />
          <meshPhysicalMaterial
            transmission={1}
            thickness={0.6}
            roughness={0.1}
            ior={1.52}
            reflectivity={0.1}
            clearcoat={1}
            clearcoatRoughness={0.2}
            envMapIntensity={0.2}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Внешнее NASA-кольцо */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.62, 0.95, 128]} />
          <meshStandardMaterial
            map={ringTexture}
            alphaMap={ringAlphaMap}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={true}
            emissive="#222"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>
    </group>
  )
}
