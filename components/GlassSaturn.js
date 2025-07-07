import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function GlassSaturn() {
  const saturnRef = useRef()
  const ringRef = useRef()
  const glowRef = useRef()
  const mouse = useRef({ x: 0, y: 0 })

  // Реакция на курсор
  useEffect(() => {
    const onMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = -(e.clientY / window.innerHeight - 0.5) * 2
      mouse.current.x = x
      mouse.current.y = y
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (saturnRef.current) {
      // Пульсация
      saturnRef.current.scale.x = 1 + 0.02 * Math.sin(t * 3)
      saturnRef.current.scale.y = 1 + 0.02 * Math.sin(t * 2.5 + 1)
      saturnRef.current.scale.z = 1 + 0.02 * Math.sin(t * 4 + 2)

      // Покачивание от мыши
      saturnRef.current.rotation.x = mouse.current.y * 0.1
      saturnRef.current.rotation.y = mouse.current.x * 0.1
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = Math.sin(t * 0.5) * 0.02
    }

    if (glowRef.current) {
      glowRef.current.material.opacity = 0.3 + 0.1 * Math.sin(t * 2)
    }
  })

  return (
    <group position={[1.5, 1.5, 0]}>
      {/* Основная сфера */}
      <mesh ref={saturnRef}>
        <icosahedronGeometry args={[0.6, 6]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.8}
          roughness={0}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.05}
          reflectivity={1}
          ior={1.5}
          color={'#88ccff'}
          attenuationColor="#aaffff"
          attenuationDistance={2}
        />
      </mesh>

      {/* Кольцо */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.4, 64]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.4}
          roughness={0.2}
          metalness={0.2}
          transmission={0.7}
          thickness={0.5}
          color={'#c0e0ff'}
        />
      </mesh>

      {/* Дым / Glow под низом */}
      <mesh ref={glowRef} position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial
          color={'#88ccff'}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
