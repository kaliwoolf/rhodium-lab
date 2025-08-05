import { useRef, useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function GlassPanel({ videoUrl }) {
  const mesh = useRef()
  const [videoTexture, setVideoTexture] = useState(null)
  const videoElem = useRef(null)

  useEffect(() => {
    // Создаём видео DOM-элемент
    const video = document.createElement("video")
    video.src = videoUrl
    video.crossOrigin = "anonymous"
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.preload = "auto"
    video.style.display = "none"
    video.play()
    videoElem.current = video

    // Создаём текстуру
    const texture = new THREE.VideoTexture(video)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBFormat

    setVideoTexture(texture)

    // Очистка
    return () => {
      texture.dispose()
      video.pause()
      video.src = ""
    }
  }, [videoUrl])

  return (
    <>
      {/* Видео-слой (фон) */}
      {videoTexture && (
        <mesh position={[0, 0, -0.16]} scale={[1.27, 0.71, 1]}>
          <planeGeometry args={[1.4, 0.8]} />
          <meshBasicMaterial map={videoTexture} toneMapped={false} />
        </mesh>
      )}
      {/* Стеклянная панель поверх */}
      <mesh ref={mesh}>
        <planeGeometry args={[1.25, 0.75]} />
        <meshPhysicalMaterial
          transmission={1}
          transparent
          thickness={0.27}
          ior={1.51}
          roughness={0.01}
          metalness={0.04}
          reflectivity={1}
          attenuationColor="#e6e6ff"
          attenuationDistance={1.7}
          color="#ffffff"
          clearcoat={0.9}
          clearcoatRoughness={0.15}
          iridescence={0.18}
          envMapIntensity={1.5}
        />
      </mesh>
    </>
  )
}

export default function VideoGlassPanel({ videoUrl = "/video/00002.mp4" }) {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#171923" }}>
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 40 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      >
        <ambientLight intensity={0.32} />
        <directionalLight position={[3, 2, 3]} intensity={0.66} />
        <GlassPanel videoUrl={videoUrl} />
        <Environment preset="sunset" />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 2.3}
        />
      </Canvas>
    </div>
  )
}
