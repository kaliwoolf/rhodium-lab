'use client'
import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import GlassLensShader from '../components/GlassLensShader'

export default function GlassLensCanvas({ mouse, texture }) {
  if (!texture) return null

  return (
    <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
      <GlassLensShader texture={texture} mouse={mouse} />
    </Canvas>
  )
}

