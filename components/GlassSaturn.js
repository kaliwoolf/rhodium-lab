import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, BackSide } from 'three'

export default function GlassSaturn({ mouse }) {
  const ref = useRef()
  const ringRef = useRef()

  const [scale, setScale] = useState([2.2, 2.2, 2.2])
  const [position, setPosition] = useState([1.2, 1.2, -3])

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    setScale(isMobile ? [1.3, 1.3, 1.3] : [2.2, 2.2, 2.2])
    setPosition(isMobile ? [0.5, 0.8, -3] : [1.2, 1.2, -3])
  }, [])

  useEffect(() => {
    if (ref.current) ref.current.layers.set(1)
    if (ringRef.current) ringRef.current.layers.set(1)
  }, [])

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
      {/* 🔵 Аквамариновый свет */}
      <spotLight
        position={[-3, 2, 2]}
        intensity={1.2}
        angle={0.5}
        penumbra={0.8}
        color="#99ffff"
      />
      {/* 🟣 Аметистовый свет */}
      <spotLight
        position={[3, 2, 2]}
        intensity={1.2}
        angle={0.5}
        penumbra={0.8}
        color="#cc88ff"
      />

      <group position={position} scale={scale} rotation={[0.46, 0, 0.46]}>
        {/* 🌑 Внутреннее затемнение */}
        <mesh scale={[0.99, 0.99, 0.99]}>
          <sphereGeometry args={[0.52, 128, 128]} />
          <meshStandardMaterial
            color="#000000"
            transparent
            opacity={0.6}
            side={BackSide}
          />
        </mesh>

        {/* 🔮 Внешняя стеклянная сфера */}
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
            envMapIntensity={0.5}
            iridescence={1}
            iridescenceIOR={1.25}
            iridescenceThicknessRange={[150, 400]}
            attenuationColor="#ffffff"
            attenuationDistance={0.9}
            transparent
            toneMapped={false}
          />
        </mesh>

        {/* 🪐 Радужные кольца */}
        <group ref={ringRef} position={[0, 0.1, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.95, 0.04, 64, 256]} />
            <meshPhysicalMaterial
              transmission={1}
              thickness={0.5}
              roughness={0}
              ior={1.45}
              clearcoat={1}
              clearcoatRoughness={0}
              iridescence={1}
              iridescenceIOR={1.3}
              iridescenceThicknessRange={[200, 600]}
              attenuationColor="#ffffff"
              attenuationDistance={0.5}
              metalness={0}
              envMapIntensity={0.7}
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
