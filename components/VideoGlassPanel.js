// components/VideoGlassPanel.js
import { useRef, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function GlassPanel({ videoUrl = "/video/00002.mp4", ...props }) {
  const mesh = useRef()
  const video = useRef()
  const texture = useRef()

  // Инициализация видеотекстуры
  useEffect(() => {
    if (!video.current) return
    video.current.play()
    texture.current = new THREE.VideoTexture(video.current)
    texture.current.colorSpace = THREE.SRGBColorSpace
    texture.current.minFilter = THREE.LinearFilter
    texture.current.magFilter = THREE.LinearFilter
    texture.current.format = THREE.RGBFormat
  }, [])

  // Немного движения панели для вау-эффекта (по желанию)
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.16) * 0.12
      mesh.current.rotation.x = Math.cos(clock.getElapsedTime() * 0.09) * 0.09
    }
  })

  return (
    <>
      {/* Видео-слой (фоновый plane) */}
      <mesh position={[0, 0, -0.16]} scale={[1.27, 0.71, 1]}>
        <planeGeometry args={[1.4, 0.8]} />
        <meshBasicMaterial>
          <video
            ref={video}
            src={videoUrl}
            loop
            muted
            playsInline
            crossOrigin="anonymous"
            style={{ display: "none" }}
            preload="auto"
          />
        </meshBasicMaterial>
        {/* Видеотекстуру назначаем через useEffect ниже */}
        {texture.current && (
          <meshBasicMaterial map={texture.current} toneMapped={false} />
        )}
      </mesh>

      {/* Стеклянная панель поверх */}
      <mesh ref={mesh} {...props}>
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
