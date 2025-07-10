// components/GlassVideoPanel.js
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'

export default function GlassVideoPanel() {
  const videoRef = useRef(null)
  const textureRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
      const texture = new THREE.VideoTexture(videoRef.current)
      texture.encoding = THREE.sRGBEncoding
      textureRef.current = texture
    }
  }, [])

  return (
    <>
      {/* Стекло */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 2, 0.05]} />
        <meshPhysicalMaterial
          transmission={1}
          roughness={0.1}
          thickness={0.2}
          transparent
          opacity={0.95}
          ior={1.5}
          reflectivity={0.6}
          clearcoat={1}
        />
      </mesh>

      {/* Видео внутри */}
      {textureRef.current && (
        <mesh position={[0, 0, -0.031]}>
          <planeGeometry args={[2.8, 1.8]} />
          <meshBasicMaterial map={textureRef.current} toneMapped={false} />
        </mesh>
      )}

      {/* Скрытое HTML-видео */}
      <Html style={{ display: 'none' }}>
        <video
          ref={videoRef}
          src="/videos/sample.mp4"
          muted
          loop
          playsInline
          crossOrigin="anonymous"
        />
      </Html>
    </>
  )
}
