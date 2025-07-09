import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Lightformer } from '@react-three/drei'
import { DoubleSide, BackSide } from 'three'

export default function GlassSaturn({ mouse }) {
  const ref = useRef()
  const ringRef = useRef()

  const [scale, setScale] = useState([3.5, 3.5, 3.5])
  const [position, setPosition] = useState([3.2, 1.8, -3])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateLayout = () => {
      const isMobile = window.innerWidth < 768
      setScale(isMobile ? [1.6, 1.6, 1.6] : [3.5, 3.5, 3.5])
      setPosition(isMobile ? [1.2, 0.8, -3] : [3.2, 1.8, -3])
    }

    window.addEventListener('resize', updateLayout)
    updateLayout()

    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  const baseScale = 1

  useFrame(({ clock, mouse: m }) => {
    const t = clock.getElapsedTime()

    if (ref.current && ringRef.current) {
      mouse.current.x += (m.x - mouse.current.x) * 0.05
      mouse.current.y += (m.y - mouse.current.y) * 0.05

      const tilt = 0.15
      ref.current.rotation.x = mouse.current.y * tilt
      ref.current.rotation.y = mouse.current.x * tilt

      const scalePulse = baseScale + 0.012 * (mouse.current.x ** 2 + mouse.current.y ** 2)
      ref.current.scale.set(scalePulse, scalePulse, scalePulse)

      ringRef.current.rotation.z = t * 0.015
    }
  })

  return (
    <>
      {/* Световые ореолы */}
      <Lightformer form="ring" intensity={2} scale={10} position={[5, 3, 2]} color="#ddeeff" />
      <Lightformer form="ring" intensity={1.5} scale={8} position={[-5, -3, -2]} color="#ffddcc" />

      <group position={position} scale={scale} rotation={[0.45, 0, 0.46]}>
        {/* Едва заметное внутреннее свечение */}
        <mesh scale={[1.01, 1.01, 1.01]}>
          <sphereGeometry args={[0.52, 128, 128]} />
          <meshStandardMaterial
            emissive="#aaffff"
            emissiveIntensity={0.03}
            transparent
            opacity={0.02}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            side={BackSide}
          />
        </mesh>

        {/* Стеклянная сфера с преломлением */}
        <mesh ref={ref}>
          <sphereGeometry args={[0.52, 128, 128]} />
          <meshPhysicalMaterial
            transmission={1}
            thickness={2.0}
            roughness={0}
            ior={1.52}
            reflectivity={0.05}
            clearcoat={1}
            clearcoatRoughness={0}
            metalness={0}
            envMapIntensity={0.5}
            iridescence={0.3}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[50, 200]}
            attenuationColor="#ffffff"
            attenuationDistance={0.35}
            transparent
            toneMapped={false}
          />
        </mesh>

        {/* Кольца */}
        <group ref={ringRef} position={[0, 0.1, 0]} rotation={[Math.PI / 2.3, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.65, 0.05, 64, 256]} />
            <meshPhysicalMaterial
              transmission={1}
              thickness={0.5}
              roughness={0}
              ior={1.45}
              iridescence={1}
              iridescenceThicknessRange={[100, 400]}
              clearcoat={1}
              clearcoatRoughness={0}
              transparent
              side={DoubleSide}
              attenuationColor="#ddffff"
              attenuationDistance={0.5}
            />
          </mesh>
        </group>
      </group>
    </>
  )
}