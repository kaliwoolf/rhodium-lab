'use client'
import { Canvas } from '@react-three/fiber'
import GlassLensShader from '../components/GlassLensShader'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

export default function GlassLensCanvas({ mouse }) {
  const texture = useLoader(TextureLoader, '/video/ice-blurred.jpg')

  return (
    <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
      <GlassLensShader mouse={mouse} texture={texture} />
    </Canvas>
  )
}
