import { useRef, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls, shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import * as THREE from "three"

// === ShaderMaterial объявляем прямо тут ===
const VideoRefractionMaterial = shaderMaterial(
  {
    uVideo: null,
    uIntensity: 0.13,
    uThickness: 1.2, // добавили толщину!
    time: 0
  },
  // vertex
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment
  `
    uniform sampler2D uVideo;
    uniform float uIntensity;
    uniform float uThickness;
    uniform float time;
    varying vec2 vUv;
    void main() {
      float bump = sin(vUv.y * 18. + time * 0.7) * 0.04
                 + cos(vUv.x * 15. - time * 0.5) * 0.035;
      vec2 refractUv = vUv + vec2(bump, bump) * uIntensity * uThickness;

      vec4 videoColor = texture2D(uVideo, refractUv);

      float vignette = smoothstep(0.0, 0.38, length(vUv - 0.5));
      videoColor.rgb *= 1.0 - vignette * 0.26;

      gl_FragColor = videoColor;
    }
  `
)

extend({ VideoRefractionMaterial })

function GlassPanel({ videoUrl }) {
  const mesh = useRef()
  const shaderRef = useRef()
  const [videoTexture, setVideoTexture] = useState(null)

  useEffect(() => {
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
    const texture = new THREE.VideoTexture(video)
    setVideoTexture(texture)
    return () => {
      texture.dispose()
      video.pause()
      video.src = ""
    }
  }, [videoUrl])

  useFrame((state) => {
    if (shaderRef.current) shaderRef.current.uniforms.time.value = state.clock.getElapsedTime()
  })

  return (
    <>
      {/* Видео-слой (фон, если нужен за пределами панели) */}
      {/* Можно убрать, если нужно только внутри панели */}
      {/* {videoTexture && (
        <mesh position={[0, 0, -0.18]} scale={[1.45, 0.85, 1]}>
          <planeGeometry args={[1.4, 0.8]} />
          <meshBasicMaterial map={videoTexture} toneMapped={false} />
        </mesh>
      )} */}
      {/* Стеклянная панель с искажением */}
      <mesh ref={mesh} rotation={[0.23, -0.32, 0]}>
        <planeGeometry args={[1.25, 0.75]} />
        {videoTexture && (
          <videoRefractionMaterial
            ref={shaderRef}
            uVideo={videoTexture}
            uIntensity={0.12} // крути силу эффекта
            uThickness={1.4} // ← крути это значение!
          />
        )}
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
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 2, 3]} intensity={1.16} />
        <GlassPanel videoUrl={videoUrl} />
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
