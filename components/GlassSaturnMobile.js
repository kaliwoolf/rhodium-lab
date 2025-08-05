import { useRef } from 'react'
import { BackSide } from 'three'
import { useFrame } from '@react-three/fiber'

export default function GlassSaturnMobile({ mouse, scrollRef, scale = 1.3 }) {
  const wrapperRef = useRef()
  // (по желанию: scale или покачивание по mouse)
  useFrame(() => {
    // Можно добавить лёгкое покачивание
    if (wrapperRef.current && mouse) {
      wrapperRef.current.rotation.y = mouse.current.x * 0.13
      wrapperRef.current.rotation.x = 0.46 + mouse.current.y * 0.1
    }
  })

  return (
    <group ref={wrapperRef} scale={[scale, scale, scale]} rotation={[0.46, 0, 0.46]}>
      {/* Упрощённая стеклянная сфера */}
      <mesh>
        <sphereGeometry args={[0.52, 64, 64]} />
        <meshPhysicalMaterial
          transmission={0.7}
          roughness={0.4}
          thickness={0.5}
          ior={1.52}
          reflectivity={0.01}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={0}
          attenuationColor="#ffffff"
          attenuationDistance={0.12}
          transparent
          toneMapped={false}
        />
      </mesh>
      {/* Лёгкое "свечение" — не обязательно */}
      <mesh scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[0.52, 64, 64]} />
        <meshBasicMaterial color="#fff9df" transparent opacity={0.08} depthWrite={false} />
      </mesh>
    </group>
  )
}
