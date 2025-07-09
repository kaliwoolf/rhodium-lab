import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, DoubleSide, BackSide } from 'three'
import { Lightformer } from '@react-three/drei'

export default function GlassSaturn({ mouse }) {
  const ref = useRef()
  const ringRef = useRef()

  const baseScale = 1

  // Плавное вращение от мыши
  useFrame(({ clock, mouse: m }) => {
    const t = clock.getElapsedTime()

    if (ref.current && ringRef.current) {
      mouse.current.x += (m.x - mouse.current.x) * 0.05
      mouse.current.y += (m.y - mouse.current.y) * 0.05

      const tilt = 0.15
      ref.current.rotation.x = mouse.current.y * tilt
      ref.current.rotation.y = mouse.current.x * tilt

      const scalePulse = baseScale + 0.016 * (mouse.current.x ** 2 + mouse.current.y ** 2)
      ref.current.scale.set(scalePulse, scalePulse, scalePulse)

      ringRef.current.rotation.z = t * 0.02
    }
  })

  return (
    <>
      {/* Свет как у Active Theory */}
      <Lightformer form="ring" intensity={20} scale={10} position={[5, 3, 2]} color="#aaffff" />
      <Lightformer form="ring" intensity={15} scale={8} position={[-5, -3, -2]} color="#ffccaa" />

      <group position={[2.5, 1.6, -2]} scale={[7, 7, 7]} rotation={[0.45, 0, 0.46]}>
        
        {/* Эмиссионная сфера — подсветка краёв (как Fresnel) */}
        <mesh scale={[1.01, 1.01, 1.01]}>
          <sphereGeometry args={[0.52, 128, 128]} />
          <meshStandardMaterial
            emissive="#aaffff"
            emissiveIntensity={0.3}
            transparent
            opacity={0.05}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            side={BackSide}
          />
        </mesh>

        {/* Основная стеклянная сфера */}
        <mesh ref={ref}>
          <sphereGeometry args={[0.52, 128, 128]} />
          <meshPhysicalMaterial
            transmission={1}
            thickness={2.5}
            roughness={0.02}
            ior={1.52}
            reflectivity={0.3}
            clearcoat={1}
            clearcoatRoughness={0.05}
            metalness={0}
            envMapIntensity={1.0}
            transparent
            attenuationColor="#ccffff"
            attenuationDistance={0.25}
            toneMapped={false}
          />
        </mesh>

        {/* Кольца */}
        <group ref={ringRef} position={[0, 0.1, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
          {/* Хрустальное кольцо (тороид) */}
          <mesh>
            <torusGeometry args={[0.6, 0.02, 64, 256]} />
            <meshPhysicalMaterial
              transmission={1}
              thickness={0.3}
              roughness={0.1}
              ior={1.4}
              metalness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.1}
              transparent
              side={DoubleSide}
            />
          </mesh>
        </group>
      </group>
    </>
  )
}
