'use client'
import { Canvas } from '@react-three/fiber'
import GlassLensShader from '../components/GlassLensShader'

export default function GlassLensCanvas({ mouse, texture }) {
  return (
    <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
      <GlassLensShader mouse={mouse} texture={texture} />
    </Canvas>
  )
}
