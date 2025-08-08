// VideoPanelOverlay3DTest.js
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, Html, Environment, OrbitControls, shaderMaterial, useCubeTexture } from "@react-three/drei"
import { useRef, useState, useEffect, useMemo } from "react"
import * as THREE from "three"
import styles from '../styles/VideoPanelOverlay3DTest.module.css'
import CourseSlider from '../components/CourseSlider'
import { extend } from "@react-three/fiber"
import { useThree } from "@react-three/fiber"


// shaderMaterial как в твоём VideoGlassPanel.js
const VideoRefractionMaterial = shaderMaterial(
  {
    uVideo: null,
    uBackground: null,
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
    uForward: new THREE.Vector3(0, 0, 1),
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
    uniform vec3 uForward;
    uniform float time;
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPos;

    void main() {

      // Фрагмент для классного дисторшна через noise:
      float noise = fract(sin(dot(vUv * 0.87, vec2(12.9898,78.233))) * 43758.5453);
      float bump = sin(vUv.y * 18. + time * 0.8) * 0.012
                 + cos(vUv.x * 14. - time * 0.54) * 0.011
                 + (noise - 0.5) * 0.055; 

      // Lens bump + chromatic
      float chroma = 0.05 * uThickness * uIntensity;
      vec2 refractUv = vUv + vec2(bump, bump) * uIntensity * uThickness;
      
      // Преломляем фон сцены:
      vec3 bgColor;
      bgColor.r = texture2D(uBackground, refractUv + vec2(chroma, 0.0)).r;
      bgColor.g = texture2D(uBackground, refractUv).g;
      bgColor.b = texture2D(uBackground, refractUv - vec2(chroma, 0.0)).b;

      vec3 videoColor = texture2D(uVideo, vUv).rgb;
      vec3 panelColor = mix(bgColor, videoColor, uVideoAlpha);
      panelColor = mix(panelColor, uTint, uTintStrength);

      // Reflection env
      vec3 viewDir    = normalize(cameraPosition - vWorldPos);
      vec3 nrm        = normalize(vWorldNormal);
      vec3 reflectDir = reflect(-viewDir, nrm);
      vec3 envColor   = textureCube(uEnvMap, reflectDir).rgb;
      vec3 rimColor   = textureCube(uEnvMapRim, reflectDir).rgb;

      // Насколько этот фрагмент "фронтальный" к плоскости панели (1 = фронт, 0 = бок)
      float faceFront = abs(dot(nrm, normalize(uForward)));
      float sideFactor = 1.0 - faceFront; // 1 на боках, 0 на фронте


      // Fresnel (сила у края)
      float ndv = max(dot(nrm, viewDir), 0.0);
      float fresnel = pow(1.0 - ndv, 2.8);
      float fresnelStrength = uRimAmount * 0.55;

      // У края берём более контрастный кубмап
      vec3 envCombined = mix(envColor, rimColor, pow(fresnel, 1.25));
      vec3 sidePanel   = mix(panelColor, bgColor, sideFactor * 0.55); // бока «тоньше»
      vec3 envMix      = mix(sidePanel, envCombined, uEnvAmount * mix(0.35, 1.0, faceFront));

      // Цвета каймы
      vec3 edgeColor   = vec3(1.10, 1.05, 0.80);
      vec3 atEdgeColor = vec3(1.12, 0.78, 1.24);

      vec3 result = envMix + fresnel * edgeColor * fresnelStrength;

      // Узкий hotspot на фаске + базовый спекуляр
      float spec    = pow(ndv, 20.0);
      float rimSpec = pow(1.0 - ndv, 8.0);
      result += spec * edgeColor * 0.08;
      result += rimSpec * edgeColor * 0.22;

      // Мягкий эмиссионный ореол по краям
      float glowRim = pow(1.0 - ndv, 9.0);
      result += glowRim * vec3(1.30, 1.15, 1.25) * 0.18;

      // === Скруглённая рамка по периметру (SDF rounded-rect) ===
      // Центрируем UV в [-0.5..0.5]
      vec2 uv = clamp(vUv, 0.0, 1.0);
      vec2 p  = uv - 0.5;

      // Полуразмеры прямоугольника (в UV). 0.5 — до самой границы карты.
      vec2 halfSize = vec2(0.5);

      // Радиус скругления в UV. Подбери под свой мэш/UV (0.07–0.12 обычно ок).
      float radius = 0.085;

      // Signed distance до скруглённого прямоугольника
      // (источник: iq, "rounded box sdf")
      vec2 q = abs(p) - (halfSize - vec2(radius));
      float sdf = length(max(q, 0.0)) - radius; // <0 внутри, ~0 на границе, >0 снаружи

      // Толщина контура и сглаживание
      float border = 0.016;              // толщина рамки (уменьши, если надо тоньше)
      float aa     = fwidth(sdf) * 1.5;  // антиалиас (мягче край)

      // Маска тонкого "кольца" по границе: внутри между [-border .. 0]
      float inner = smoothstep(-border - aa, -aa, sdf); // подкрашиваем до границы
      float outer = 1.0 - smoothstep(0.0, aa, sdf);     // убираем всё дальше от границы
      float edgeMask = inner * outer;

            // Внешний мягкий glow за краем
      float glowMask = smoothstep(0.0, border*2.2 + aa*2.0, sdf);

      // Чуть «живости» (как и было)
      float edgeNoise = edgeMask * (0.92 + 0.15 * noise);

      // Ослабляем все "яркие" слои на боках
      float brightGate = mix(0.25, 1.0, faceFront); // 0.25 на чистом боку, 1.0 на фронте
      result += brightGate * (spec * edgeColor * 0.08);
      result += brightGate * (rimSpec * edgeColor * 0.28);
      result += brightGate * (glowRim * vec3(1.30,1.15,1.25) * 0.18);

      // Рамку/глоу по периметру тоже поджать на боках
      result += brightGate * (edgeNoise * atEdgeColor * 0.90);
      result += brightGate * (edgeMask  * rimColor    * 0.10);
      result += brightGate * (glowMask  * atEdgeColor * 0.14);

      // Альфа: фронт плотнее, бока прозрачнее
      float viewAlpha = uPanelAlpha
        * mix(0.28, 1.0, faceFront)  // бока 28% от альфы, фронт 100%
        * mix(0.60, 1.0, ndv);       // grazing углы ещё чуть тоньше

      gl_FragColor = vec4(result, viewAlpha);
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
  const { nodes } = useGLTF('/models/p3.glb')
  const forceRerender = useRef(false)
  // Стартовая ориентация панели и настройки парения
  const baseRot = useRef(new THREE.Euler(
    THREE.MathUtils.degToRad(-12), // X — наклон вперёд/назад
    THREE.MathUtils.degToRad(25),  // Y — поворот вбок
    THREE.MathUtils.degToRad(0)    // Z — крен
  ))
  // амплитуда и скорости парения (можешь крутить)
  const floatAmp = useRef({ rot: 0.055, rotZ: 0.035, posY: 0.03 })
  const floatSpd = useRef({ x: 0.17, y: 0.14, z: 0.11, yPos: 0.60 })
  const tmpForward = useMemo(() => new THREE.Vector3(), [])

  // "Обычное" стекло
  const envMapNeutral = useCubeTexture(
    ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
    { path: '/hdr/studio/' }
  )
  // Для rimlight — контрастная
  const envMapRim = useCubeTexture(
    ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
    { path: '/hdr/hi01/' }
  )


  const handlePointerOver = (e) => {
   setHovered(true);
   // НЕ трогать mouse тут — пусть он остаётся в (0,0), если не двигается
  };
  const handlePointerMove = (e) => {
     setMouse({
       x: (e.uv.x - 0.5) * 2,
       y: -(e.uv.y - 0.5) * 2
     });
  };
  const handlePointerOut = () => {
     setHovered(false);
     setMouse({ x: 0, y: 0 });
  };

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


  // Анимация + "парение"
  useFrame((state, delta) => {
    if (!shaderRef.current || !panelRef.current) return

    const t = state.clock.getElapsedTime()
    shaderRef.current.uniforms.time.value = t

    // Мягкое «парение»: базовый угол + лёгкое покачивание
    const wobX = Math.sin(t * 0.17) * 0.055
    const wobY = Math.cos(t * 0.14) * 0.055
    const wobZ = Math.sin(t * 0.11) * 0.035

    // Целевые углы = базовый угол + парение + реакция на hover
    const targetX = baseRot.current.x + wobX + (hovered ? mouse.y * 0.32 : 0)
    const targetY = baseRot.current.y + wobY + (hovered ? mouse.x * 0.30 : 0)
    const targetZ = baseRot.current.z + wobZ

    // Плавно тянем текущую ротацию к целевой
    panelRef.current.rotation.x += (targetX - panelRef.current.rotation.x) * 0.12
    panelRef.current.rotation.y += (targetY - panelRef.current.rotation.y) * 0.12
    panelRef.current.rotation.z += (targetZ - panelRef.current.rotation.z) * 0.12

    // Небольшое вертикальное «плавание»
    panelRef.current.position.y = Math.sin(t * 0.6) * 0.03

    // Плавный fade-in/fade-out видео (как было)
    const cur = shaderRef.current.uniforms.uVideoAlpha.value
    const to = hovered ? 1 : 0
    shaderRef.current.uniforms.uVideoAlpha.value = THREE.MathUtils.lerp(cur, to, delta * 2.5)
  })

  const { gl, scene, camera, size } = useThree()
  const bgRenderTarget = useRef()  
  useEffect(() => {
    bgRenderTarget.current = new THREE.WebGLRenderTarget(size.width, size.height)
    return () => bgRenderTarget.current?.dispose()
  }, [size.width, size.height])

  useFrame(() => {
    if (!bgRenderTarget.current) return

    // Скрываем панель перед рендером фона
    if (panelRef.current) panelRef.current.visible = false

    gl.setRenderTarget(bgRenderTarget.current)
    gl.render(scene, camera)
    gl.setRenderTarget(null)

    if (panelRef.current) panelRef.current.visible = true

    // 🔥 Принудительный микроскопический сдвиг, чтобы фон обновился
    if (forceRerender.current && panelRef.current) {
      panelRef.current.rotation.x += 0.0001
      forceRerender.current = false
    }
  })

    const uf = shaderRef.current.uniforms.uForward;
    if (uf?.value?.copy) {
      panelRef.current.getWorldDirection(tmpForward);
      tmpForward.multiplyScalar(-1);                // делаем +Z «вперёд»
      uf.value.copy(tmpForward);                    // ⬅️ теперь ок
    }


  return (
    <group rotation={[0, 0, 0]}>
      <primitive
        object={nodes.Panel}
        scale={[0.8, 0.8, 0.8]} // подбери под свою сцену!
        ref={panelRef} 
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerOver={handlePointerOver} 
      >
        {videoTexture && (
          <videoRefractionMaterial
            ref={shaderRef}
            uBackground={bgRenderTarget.current?.texture}
            uVideo={videoTexture}  
            uEnvMap={envMapNeutral}
            uEnvMapRim={envMapRim}
            uIntensity={0.22}
            uThickness={2.4}
            uEnvAmount={0.22}    // Прозрачность envMap (0.12…0.22)
            uRimAmount={0.30}    // Сила rim-каймы
            uPanelAlpha={0.68}
            uTint={[0.63, 0.98, 0.86]}
            uTintStrength={0.0}
            transparent
            depthWrite={false}
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
    </group>
  )
}

export default function VideoPanelOverlay3DTest() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#171923" }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 25 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      >
        <ambientLight intensity={2.8} />
        <directionalLight position={[3, 2, 3]} intensity={2.4} />
        <Environment preset="sunset" />
        <GlassPanelWithOverlay videoUrl="/video/00004.mp4" />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  )
}
