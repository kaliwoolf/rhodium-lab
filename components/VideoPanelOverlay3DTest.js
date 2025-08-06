// VideoPanelOverlay3DTest.js
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Html, Environment } from "@react-three/drei"
import { useRef, useState, useEffect } from "react"
import * as THREE from "three"
import styles from '../styles/VideoPanelOverlay.module.css'
import CourseSlider from '../components/CourseSlider'

// shaderMaterial как в твоём VideoGlassPanel.js
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

      // Разные смещения для каналов
      float chroma = 0.008 * uThickness * uIntensity;
      vec2 refractUv = vUv + vec2(bump, bump) * uIntensity * uThickness;

      // Chromatic aberration — R, G, B сдвигаются по-разному
      float r = texture2D(uVideo, refractUv + vec2(chroma, 0.0)).r;
      float g = texture2D(uVideo, refractUv).g;
      float b = texture2D(uVideo, refractUv - vec2(chroma, 0.0)).b;

      vec3 color = vec3(r, g, b);

      // Лёгкая металлизация — усиливаем яркость и контраст, "отблёски"
      color = mix(color, vec3(1.12, 1.09, 1.17), 0.18 * uThickness);

      // Чуть темнее по краям (в центре ярче)
      float vignette = smoothstep(0.0, 0.38, length(vUv - 0.5));
      color *= 1.0 - vignette * 0.22;

      gl_FragColor = vec4(color, 1.0);
    }
    `
)

function GlassPanelWithOverlay({ videoUrl, children }) {
  const mesh = useRef()
  const shaderRef = useRef()
  const { nodes } = useGLTF('/models/p1.glb')
  const [videoTexture, setVideoTexture] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

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

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += (((hovered ? mouse.y : 0) * 0.18) - mesh.current.rotation.x) * 0.12
      mesh.current.rotation.y += (((hovered ? mouse.x : 0) * 0.32) - mesh.current.rotation.y) * 0.12
    }
    if (shaderRef.current)
      shaderRef.current.uniforms.time.value = performance.now() * 0.001
  })

  return (
    <primitive
      ref={mesh}
      object={nodes.Panel}
      scale={[0.36, 0.4, 0.25]}
      onPointerMove={e => {
        setHovered(true)
        setMouse({
          x: (e.uv.x - 0.5) * 2,
          y: -(e.uv.y - 0.5) * 2,
        })
      }}
      onPointerOut={() => {
        setHovered(false)
        setMouse({ x: 0, y: 0 })
      }}
    >
      {videoTexture && (
        <videoRefractionMaterial
          ref={shaderRef}
          uVideo={videoTexture}
          uIntensity={0.12}
          uThickness={1.2}
        />
      )}
      {/* HTML-оверлей */}
      <Html center>
  <div style={{ color: "white", background: "#171923", fontSize: 40, padding: 32 }}>Тест панели!</div>
</Html>

    </primitive>
  )
}

export default function VideoPanelOverlay3DTest() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#171923" }}>
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 40 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      >
        <ambientLight intensity={2} />
        <directionalLight position={[3, 2, 3]} intensity={1.14} />
        <Environment preset="sunset" />
        <GlassPanelWithOverlay videoUrl="/video/00004.mp4" />
      </Canvas>
    </div>
  )
}
