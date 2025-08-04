'use client'

import { Canvas, useThree } from '@react-three/fiber'
import GlassLensShader from '../components/GlassLensShader'

export default function GlassLensCanvas({ mouse, texture }) {
  if (!texture) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30, // можно поменять в зависимости от композиции
        pointerEvents: 'none',
      }}
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 100], near: 0.1, far: 200 }}
        gl={{ preserveDrawingBuffer: false }}
      >
        <GlassLensShader texture={texture} mouse={mouse} />
      </Canvas>
    </div>
  )
}
