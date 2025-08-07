// VideoPanelOverlay3DTest.js
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Html, Environment, OrbitControls, shaderMaterial, useCubeTexture } from "@react-three/drei"
import { useRef, useState, useEffect } from "react"
import * as THREE from "three"
import styles from '../styles/VideoPanelOverlay3DTest.module.css'
import CourseSlider from '../components/CourseSlider'
import { extend } from "@react-three/fiber"
import { useThree } from "@react-three/fiber"


// shaderMaterial как в твоём VideoGlassPanel.js
const VideoRefractionMaterial = shaderMaterial(
  {
    uVideo: null,
    uEnvMap: null,
    uEnvMapRim: null,    
    uIntensity: 0.15,
    uThickness: 1.25, // добавили толщину!
    uTint: [0.85, 0.95, 1.0], // зелёный tint, как в референсе
    uTintStrength: 0.12,
    uEnvAmount: 0.20,    // Сила envMap по всей панели (0.15–0.23 — "стеклянность")
    uRimAmount: 0.75,    // Rim-смешивание (0.5–0.85 — кайма по краю)
    uVideoAlpha: 0,   // Прозрачность видео (0.7–1.0)
    uPanelAlpha: 0.32,   // Альфа всей панели
    time: 0
  },
  // vertex
  `
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPos;
    void main() {
      vUv = uv;
      vWorldNormal = normalize(normalMatrix * normal);
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment
  `
    uniform sampler2D uVideo;
    uniform sampler2D uBackground;
    uniform samplerCube uEnvMap;
    uniform samplerCube uEnvMapRim;
    uniform float uIntensity;
    uniform float uThickness;
    uniform vec3 uTint;
    uniform float uTintStrength;
    uniform float uEnvAmount;
    uniform float uRimAmount;
    uniform float uVideoAlpha;
    uniform float uPanelAlpha;
    uniform float time;
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPos;

    void main() {

      // Фрагмент для классного дисторшна через noise:
      float noise = fract(sin(dot(vUv * 0.87, vec2(12.9898,78.233))) * 43758.5453);
      float bump = sin(vUv.y * 18. + time * 0.8) * 0.012
           + cos(vUv.x * 14. - time * 0.54) * 0.011
           + (noise - 0.5) * 0.055; // добавил шум

      // Lens bump + chromatic
      float chroma = 0.024 * uThickness * uIntensity;
      vec2 refractUv = vUv + vec2(bump, bump) * uIntensity * uThickness;
      
      // Преломляем фон сцены:
      vec3 bgColor;
      bgColor.r = texture2D(uBackground, refractUv + vec2(chroma, 0.0)).r;
      bgColor.g = texture2D(uBackground, refractUv).g;
      bgColor.b = texture2D(uBackground, refractUv - vec2(chroma, 0.0)).b;

      vec3 videoColor = vec3(0.0);

      if (uVideoAlpha > 0.01) {
        videoColor.r = texture2D(uVideo, refractUv + vec2(chroma, 0.0)).r;
        videoColor.g = texture2D(uVideo, refractUv).g;
        videoColor.b = texture2D(uVideo, refractUv - vec2(chroma, 0.0)).b;
      }

      vec3 panelColor = mix(bgColor, videoColor, uVideoAlpha);

      // Tint
      panelColor = mix(panelColor, uTint, uTintStrength);

      // Reflection env
      vec3 viewDir = normalize(vWorldPos - cameraPosition);
      vec3 reflectDir = reflect(viewDir, normalize(vWorldNormal));
      vec3 envColor = textureCube(uEnvMap, reflectDir).rgb;
      vec3 rimColor = textureCube(uEnvMapRim, reflectDir).rgb;

      // Rim по краю панели
      float rim = smoothstep(0.65, 0.92, length(vUv - 0.5) * 1.13);
      float hardRim = smoothstep(0.93, 0.98, length(vUv - 0.5));

      // Rim+env
      vec3 finalEnv = mix(envColor, rimColor, rim * 0.92);

      // Добавляем envAmount для стеклянности (0.14–0.23)
      vec3 baseMix = mix(panelColor, envColor, uEnvAmount);

      // Rim-кайма по краю
      vec3 rimMix = mix(baseMix, finalEnv, rim * uRimAmount);

      // Металлический specular + усиливаем кайму
      float spec = pow(max(dot(viewDir, vWorldNormal), 0.0), 22.0);
      rimMix += rim * 0.16 + hardRim * 0.25 + spec * 0.12;

      gl_FragColor = vec4(rimMix, uPanelAlpha);
    }
  `
)

extend({ VideoRefractionMaterial })

function GlassPanelWithOverlay({ videoUrl }) {
  const mesh = useRef()
  const panelRef = useRef()     
  const shaderRef = useRef()
  const [videoTexture, setVideoTexture] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const { nodes } = useGLTF('/models/p1.glb')
  
  // "Обычное" стекло
  const envMapNeutral = useCubeTexture(
    ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
    { path: '/hdr/warm02/' }
  )
  // Для rimlight — контрастная
  const envMapRim = useCubeTexture(
    ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
    { path: '/hdr/hi01/' }
  )


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

  useEffect(() => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uVideoAlpha.value = 0
    }
  }, [videoTexture])


  // Анимация
  useFrame((state, delta) => {
    if (!shaderRef.current) return

    // Время
    shaderRef.current.uniforms.time.value = state.clock.getElapsedTime()

    // Поворот панели
    if (panelRef.current) {
      panelRef.current.rotation.x += (((hovered ? mouse.y : 0) * 0.32) - panelRef.current.rotation.x) * 0.13
      panelRef.current.rotation.y += (((hovered ? mouse.x : 0) * 0.30) - panelRef.current.rotation.y) * 0.13
    }

    // Плавный fade-in/fade-out видео
    const currentAlpha = shaderRef.current.uniforms.uVideoAlpha.value
    const targetAlpha = hovered ? 1 : 0
    const fadeSpeed = 2.5
    shaderRef.current.uniforms.uVideoAlpha.value = THREE.MathUtils.lerp(currentAlpha, targetAlpha, delta * fadeSpeed)
  })

  const { gl, scene, camera, size } = useThree()
  const bgRenderTarget = useRef()  
  useEffect(() => {
    bgRenderTarget.current = new THREE.WebGLRenderTarget(size.width, size.height)
    return () => bgRenderTarget.current?.dispose()
  }, [size.width, size.height])

  useFrame(() => {
    if (!bgRenderTarget.current) return
    if (panelRef.current) panelRef.current.visible = false
    gl.setRenderTarget(bgRenderTarget.current)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    if (panelRef.current) panelRef.current.visible = true
  })

  return (
    <primitive
      object={nodes.Panel}
      scale={[0.46, 0.54, 0.28]} // подбери под свою сцену!
      rotation={[0, 0.18, 0]}
      ref={panelRef} 
      onPointerMove={handlePointerMove}     // ← для наклона
      onPointerOut={(e) => {
        handlePointerOut(e)                 // ← для сброса наклона
        setHovered(false)                   // ← для fade-out видео
      }}
      onPointerOver={() => setHovered(true)} 
    >
      {videoTexture && (
        <videoRefractionMaterial
          ref={shaderRef}
          uBackground={bgRenderTarget.current?.texture}
          uVideo={videoTexture}
          uEnvMap={envMapNeutral}
          uEnvMapRim={envMapRim}
          uIntensity={0.12}
          uThickness={1.4}
          uEnvAmount={0.20}    // Прозрачность envMap (0.12…0.22)
          uRimAmount={0.18}    // Сила rim-каймы
          uPanelAlpha={0.30}   // Итоговая прозрачность (0.20…0.38)
          uTint={[0.63, 0.98, 0.86]}
          uTintStrength={0.18}
          />
      )}

      {/* HTML-оверлей */}
      <Html
        position={[0, 0, 0.009]} // чуть выше панели (толщина+)
        center
        distanceFactor={1.01}
        transform
        className={styles.panel}
        style={{ width: '94vw', maxWidth: 1300, height: 740, pointerEvents: 'auto' }}
      >
        {/* Вставляем твою разметку и CSS */}
        <div className={styles.inner}>
           <div className={styles.content}>
            <h3 className="text-white text-xl font-semibold px-6 py-2 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-white/20 shadow-md mb-6 w-fit mx-auto">
              Актуальные проекты
            </h3>
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
