// VideoPanelOverlay3DTest.js
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Html, Environment, OrbitControls, shaderMaterial } from "@react-three/drei"
import { useRef, useState, useEffect } from "react"
import * as THREE from "three"
import styles from '../styles/VideoPanelOverlay3DTest.module.css'
import CourseSlider from '../components/CourseSlider'
import { extend } from "@react-three/fiber"


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

extend({ VideoRefractionMaterial })

function GlassPanelWithOverlay({ videoUrl }) {
  const mesh = useRef()
  const shaderRef = useRef()
  const [videoTexture, setVideoTexture] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const { nodes } = useGLTF('/models/p1.glb')
  console.log('nodes:', nodes)


  const handlePointerMove = (e) => {
    setHovered(true)
    setMouse({
      x: (e.uv.x - 0.5) * 2,
      y: -(e.uv.y - 0.5) * 2
    })
  }
  const handlePointerOut = () => {
    setHovered(false)
    setMouse({ x: 0, y: 0 })
  }


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

  useFrame(() => {
    if (mesh.current) {
      // Если навели мышь — крутится, ушли — плавно возвращается
      mesh.current.rotation.x += (((hovered ? mouse.y : 0) * 0.32) - mesh.current.rotation.x) * 0.13
      mesh.current.rotation.y += (((hovered ? mouse.x : 0) * 0.30) - mesh.current.rotation.y) * 0.13
    }
  })

  return (
    <primitive
      ref={mesh}
      object={nodes.Panel}
      scale={[0.36, 0.4, 0.25]} // подбери под свою сцену!
      rotation={[0, 0, 0]}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      {videoTexture && (
        <videoRefractionMaterial
          ref={shaderRef}
          uVideo={videoTexture}
          uIntensity={0.12}
          uThickness={1.4}
        />
      )}

      {/* HTML-оверлей */}
      <Html
        position={[0, 0, 0.009]} // чуть выше панели (толщина+)
        center
        occlude
        distanceFactor={1.01}
        transform
        className={styles.panel}
        style={{ width: '94vw', maxWidth: 1300, height: 740, pointerEvents: 'auto' }}
      >
        {/* Вставляем твою разметку и CSS */}
        <div className={styles.inner}>
          <div className={styles.videoWrapper}>
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{ width: '100%', height: '100%', objectFit: 'cover', background: 'black' }}
            />
          </div>
          <div className={styles.content}>
            <h3 className="text-white text-xl font-semibold px-6 py-2 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-white/20 shadow-md mb-6 w-fit mx-auto">
              Актуальные проекты
            </h3>
            <CourseSlider />
          </div>
        </div>
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
