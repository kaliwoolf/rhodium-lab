'use client'
import { Canvas } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import * as THREE from 'three'

export default function DebugVideoCanvas() {
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/video/ice.mp4'
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true

    const handleCanPlay = () => {
      const tex = new THREE.VideoTexture(video)
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.format = THREE.RGBAFormat
      tex.needsUpdate = true
      setTexture(tex)
      video.play()
    }

    video.addEventListener('canplay', handleCanPlay)
    video.load()

    return () => video.removeEventListener('canplay', handleCanPlay)
  }, [])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: 400, height: 300, zIndex: 9999, border: '1px solid red' }}>
      <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 10], near: 0.1, far: 100 }}>
        {texture && (
          <mesh>
            <planeGeometry args={[6, 4]} />
            <meshBasicMaterial map={texture} toneMapped={false} />
          </mesh>
        )}
      </Canvas>
    </div>
  )
}
