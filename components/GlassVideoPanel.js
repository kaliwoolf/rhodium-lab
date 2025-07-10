import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Html, useEnvironment } from '@react-three/drei'

export default function GlassVideoPanel() {
  const videoRef = useRef()
  const textureRef = useRef()

  // 👇 Вот это окружение будет применено только к панели
  const envMap = useEnvironment({ preset: 'apartment' })

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
      {/* Задняя видеоплоскость */}
      {textureRef.current && (
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[2.8, 1.8]} />
          <meshBasicMaterial map={textureRef.current} toneMapped={false} />
        </mesh>
      )}

      {/* Стеклянная панель */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 2, 0.05]} />
        <meshPhysicalMaterial
          envMap={envMap} // 👈 используем окружение ТОЛЬКО для этой панели
          envMapIntensity={1}
          transmission={1}
          roughness={0.05}
          thickness={0.3}
          ior={1.5}
          reflectivity={0.8}
          clearcoat={1}
          transparent
          opacity={1}
        />
      </mesh>

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
