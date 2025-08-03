'use client'
import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import GlassLensShader from '../components/GlassLensShader'

export default function GlassLensCanvas({ mouse }) {
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load('/video/ice-blurred.jpg', (loaded) => {
      setTexture(loaded)
    })
  }, [])

  if (!texture) return null // Не рендерим Canvas до загрузки

  return (
    <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
      <GlassLensShader texture={texture} mouse={mouse} />
    </Canvas>
  )
}
