import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'

export default function GlassSaturn({ mouse }) {
  const ref = useRef()
  const ringRef = useRef()

  const [scale, setScale] = useState([2.2, 2.2, 2.2])
  const [position, setPosition] = useState([1.2, 1.2, -3])

  // 📐 адаптация под размер экрана
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

  // ✅ слои для разделения постобработки
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
      {/* ✨ Свет в стиле Resn */}
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
        color="#e6faff"
      />

      <group position={position} scale={scale} rotation={[0.46, 0, 0.46]}>
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
            envMapIntensity={0.15}
            iridescence={0.6}
            iridescenceIOR={1.25}
            iridescenceThicknessRange={[80, 300]}
            attenuationColor="#ffffff"
            attenuationDistance={0.45}
            transparent
            toneMapped={false}
          />
        </mesh>

        {/* 🪐 радужные кольца */}
        <group ref={ringRef} position={[0, 0.1, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.95, 0.035, 64, 256]} />
            <meshPhysicalMaterial
              transmission={1}
              thickness={0.5}
              roughness={0}
              ior={1.45}
              clearcoat={1}
              clearcoatRoughness={0}
              iridescence={1}
              iridescenceIOR={1.3}
              iridescenceThicknessRange={[120, 400]}
              attenuationColor="#ffffff"
              attenuationDistance={0.4}
              metalness={0}
              envMapIntensity={0.5}
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
