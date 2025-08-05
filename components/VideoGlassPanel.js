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

  // Панель чуть наклонена для 3D-эффекта!
  return (
    <>
      {/* Видео-слой (фон) */}
      {videoTexture && (
        <mesh position={[0, 0, -0.18]} scale={[1.45, 0.85, 1]}>
          <planeGeometry args={[1.4, 0.8]} />
          <meshBasicMaterial map={videoTexture} toneMapped={false} />
        </mesh>
      )}
      {/* Стеклянная панель поверх */}
      <mesh ref={mesh} rotation={[0.23, -0.32, 0]}>
        <planeGeometry args={[1.25, 0.75]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.78}
          ior={1.475}
          roughness={0.04}
          metalness={0.09}
          reflectivity={0.98}
          clearcoat={0.88}
          clearcoatRoughness={0.14}
          envMapIntensity={2.1}
          color="#d0e7ff"
          iridescence={0.13}
          iridescenceIOR={1.12}
          iridescenceThicknessRange={[180, 520]}
          attenuationColor="#b8e8ff"
          attenuationDistance={0.47}
        />
      </mesh>
    </>
  )
}

export default function VideoGlassPanel({ videoUrl = "/video/00002.mp4" }) {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#171923" }}>
      <Canvas
        camera={{ position: [0, 0, 2.7], fov: 40 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      >
        {/* Свет поярче для бликов */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 2, 3]} intensity={1.16} />
        <GlassPanel videoUrl={videoUrl} />
        {/* Окружение даёт классные reflections */}
        <Environment preset="sunset" />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.12}
          minPolarAngle={Math.PI / 2.6}
        />
      </Canvas>
    </div>
  )
}
