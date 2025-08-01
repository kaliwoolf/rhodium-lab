import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Html, useEnvironment } from '@react-three/drei'

export default function GlassVideoPanel() {
  const videoRef = useRef()
  const textureRef = useRef()
  const meshRef = useRef()

  const envMap = useEnvironment({ preset: 'apartment' })

  useFrame(() => {
  const scroll = scrollRef?.current || 0

  // Показываем панель только между 1.8 и 2.8
  let fade = 0
  if (scroll > 1.8 && scroll < 2.8) {
    fade = (scroll - 1.8) / 1.0
  } else if (scroll >= 2.8) {
    fade = 1.0
  } else {
    fade = 0 // ← обязательно!
  }

  if (groupRef.current) {
    groupRef.current.visible = fade > 0.01
    groupRef.current.scale.set(fade, fade, fade)
  }
})

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play()
      const texture = new THREE.VideoTexture(videoRef.current)
      texture.encoding = THREE.sRGBEncoding
      textureRef.current = texture
    }
  }, [])

  useEffect(() => {
    if (meshRef.current && envMap) {
      meshRef.current.material.envMap = envMap
      meshRef.current.material.envMapIntensity = 1
      meshRef.current.material.needsUpdate = true
    }
  }, [envMap])

  return (
    <>
      {/* Задняя видеоплоскость */}
      {textureRef.current && (
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[2.8, 1.8]} />
          <meshBasicMaterial map={textureRef.current} toneMapped={false} />
        </mesh>
      )}

      {/* Стеклянная панель */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        rotation={[0.1, 0.15, 0]}
      >
        <boxGeometry args={[3, 2, 0.05]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.4}
          roughness={0.05}
          ior={1.5}
          reflectivity={0.4}
          clearcoat={1}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Видео элемент скрыт в DOM */}
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
