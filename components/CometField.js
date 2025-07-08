// components/CometField.js
import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CometField() {
  const groupRef = useRef()
  const [comets, setComets] = useState([])

  useEffect(() => {
    const interval = setInterval(() => {
      const dir = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        -1
      ).normalize()

      const comet = {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          -5
        ),
        direction: dir,
        speed: 0.006 + Math.random() * 0.004,
        size: 0.04 + Math.random() * 0.05,
        life: 0,
      }

      setComets((prev) => [...prev, comet])
    }, 10000) // раз в 3 секунды новая комета

    return () => clearInterval(interval)
  }, [])

  useFrame(() => {
    if (!groupRef.current) return

    const newComets = comets.map((comet) => {
      comet.position.addScaledVector(comet.direction, comet.speed)
      comet.life += 1
      return comet
    }).filter((comet) => comet.life < 300) // удалить через ~5 сек

    setComets(newComets)
  })

  return (
    <group ref={groupRef}>
      {comets.map((comet, idx) => (
        <mesh key={idx} position={comet.position}>
          <sphereGeometry args={[comet.size, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}
