import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, BackSide } from 'three'

export default function GlassSaturn({ mouse }) {
  const ref = useRef()
  const ringRef = useRef()

  const [scale, setScale] = useState([2.2, 2.2, 2.2])
  const [position, setPosition] = useState([1.2, 1.2, -3])

  // 📐 адаптивная позиция
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateLayout = () => {
      const isMobile = window.innerWidth < 768
      setScale(isMobile ? [1.3, 1.3, 1.3] : [2.2, 2.2, 2.2])
      setPosition(isMobile ? [0.5, 0.8, -3] : [1.2, 1.2, -3])
    }

    window.addEventListener('resize', updateLayout)
    updateLayout()
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  // ✅ назначение на слой 1
  useEffect(() => {
    if (ref.current) ref.current.layers.set(1)
    if (ringRef.current) ringRef.current.layers.set(1)
  }, [])

  // 🎥 вращение и параллакс
  useFrame(({ clock, mouse: m }) => {
    const t = clock.getElapsedTime()
    if (ref.current && ringRef.current) {
      mouse.current.x += (m.x - mouse.current.x) * 0.05
      mouse.current.y += (m.y - mouse.current.y) * 0.05

      const tilt = 0.15
      ref.current.rotation.x = mouse.current.y * tilt
      ref.current.rotation.y = mouse.current.x * tilt

      ringRef.current.rotation.z = t * 0.02
    }
  })

  return (
    <>
      {/* ✨ Световая схема в стиле Resn */}
      <spotLight
        intensity={1.2}
        angle={0.6}
        penumbra={0.8}
        position={[-4, 3, 3]}
        color="#aaffff"
      />
      <spotLight
        intensity={1.0}
        angle={0.4}
        penumbra={1}
        position={[4, 3, -4]}
        color="#ffe6ff"
      />
      <rectAreaLight
        intensity={2}
        width={5}
        height={3}
        position={[0, 2.5, 3]}
        color="#cceeff"
      />

      <group position={position} scale={scale} rotation={[0.46, 0, 0.46]}>
        {/* 🌫️ внутренний ореол */}
        <mesh scale={[1.01, 1.01, 1.01]}>
          <sphereGeometry args={[0.52, 128, 128]} />
          <meshStandardMaterial
            emissive="#aaffff"
            emissiveIntensity={0.05}
            transparent
            opacity={0.03}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            side={BackSide}
          />
        </mesh>

        {/* 🔮 стеклянная сфера */}
        <mesh ref={ref}>
          <sphereGeometry args={[0.52, 128, 128]} />
          <meshPhysicalMaterial
            transmission={1}
            thickness={2.5}
            roughness={0}
            ior={1.52}
            reflectivity={0.05}
            clearcoat={1}
            clearcoatRoughness={0}
            metalness={0}
            envMapIntensity={0.3}
            iridescence={1}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[150, 450]}
            attenuationColor="#ccffff"
            attenuationDistance={0.25}
            transparent
            toneMapped={false}
          />
        </mesh>

        {/* 🪐 кольца — расширенные и радужные */}
        <group ref={ringRef} position={[0, 0.1, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.95, 0.035, 64, 256]} />
            <meshPhysicalMaterial
              transmission={1}
              thickness={0.4}
              roughness={0}
              ior={1.45}
              clearcoat={1}
              clearcoatRoughness={0}
              iridescence={1}
              iridescenceIOR={1.2}
              iridescenceThicknessRange={[120, 380]}
              attenuationColor="#b8ffe5"
              attenuationDistance={0.4}
              metalness={0}
              envMapIntensity={0.6}
              transparent
              toneMapped={false}
              side={DoubleSide}
            />
          </mesh>
        </group>
      </group>
    </>
  )
}
