import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Html, useEnvironment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function GlassVideoPanel({ scrollRef }) {
  const videoRef = useRef()
  const textureRef = useRef()
  const meshRef = useRef()
  const groupRef = useRef()

  const envMap = useEnvironment({ preset: 'apartment' })

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

  useFrame(() => {
    const scroll = scrollRef?.current || 0
    const fade = Math.max(1 - Math.abs(scroll - 2.0) * 2.5, 0) // появление в центре экрана
    const visible = fade > 0.01

    if (groupRef.current) {
      groupRef.current.visible = visible
      groupRef.current.scale.set(fade, fade, fade)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Задняя видеоплоскость */}
      {textureRef.current && (
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[2.8, 1.8]} />
          <meshBasicMaterial map={textureRef.current} toneMapped={false} />
        </mesh>
      )}

      {/* Стеклянная панель */}
      <mesh ref={meshRef} position={[0, 0, 0]} rotation={[0.1, 0.15, 0]}>
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

      {/* Скрытое видео в DOM */}
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
    </group>
  )
}
