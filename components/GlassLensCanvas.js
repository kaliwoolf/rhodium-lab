'use client'
import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import GlassLensShader from '../components/GlassLensShader'

export default function GlassLensCanvas({ mouse, texture }) {
  if (!texture) return null

  return (
  <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none' }}>
    <Canvas
      orthographic
      camera={{ zoom: 1, position: [0, 0, 100], near: 0.1, far: 200 }}
    >
      <GlassLensShader texture={texture} mouse={mouse} />
    </Canvas>
  </div>
)

}

