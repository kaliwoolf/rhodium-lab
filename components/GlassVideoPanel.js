import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'

export default function GlassVideoPanel() {
  const videoRef = useRef()
  const textureRef = useRef()

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
          transparent
          transmission={1} // для стекла
          roughness={0.03}
          thickness={0.2}
          ior={1.5} // показатель преломления
          reflectivity={0.7}
          clearcoat={1}
          clearcoatRoughness={0.05}
          attenuationDistance={1.5}
          attenuationColor={'#ffffff'}
          color="#ffffff"
        />
      </mesh>

      {/* Скрытое видео */}
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
