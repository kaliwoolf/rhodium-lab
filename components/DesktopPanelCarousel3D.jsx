'use client'

// DesktopPanelCarousel3D.jsx
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, shaderMaterial, useCubeTexture, Html } from '@react-three/drei'
import * as THREE from 'three'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'

const VideoRefractionMaterial = shaderMaterial(
  {
    uVideo: null,
    uBackground: null,
    uEnvMap: null,
    uEnvMapRim: null,    
    uIntensity: 0.25,
    uThickness: 2.25, // добавили толщину!
    uTint: [0.85, 0.95, 1.0], // зелёный tint, как в референсе
    uTintStrength: 0.09,
    uEnvAmount: 0.18,    // Сила envMap по всей панели (0.15–0.23 — "стеклянность")
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
    varying vec3 vObjNormal;

    void main() {
      vUv = uv;
      vWorldNormal = normalize(normalMatrix * normal);
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      vObjNormal = normal; // локальная нормаль для маски фронта
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
    varying vec3 vObjNormal;

    void main() {
      // --- рефракция фона с лёгким шумом ---
      float noise = fract(sin(dot(vUv * 0.87, vec2(12.9898,78.233))) * 43758.5453);
      float bump  =  sin(vUv.y * 18. + time * 1.2) * 0.012
                   + cos(vUv.x * 14. - time * 0.78) * 0.011
                   + (noise - 0.5) * 0.055;

      bump *= 0.6;
      vec2 refractUv = clamp(vUv + vec2(bump) * uIntensity * uThickness, 0.001, 0.999);

      // равномерное радиальное смещение каналов — уходит «пятнистость»
      float chroma = 0.028 * uThickness;                 // меньше = аккуратнее
      vec2  dir    = (vUv - 0.5) * chroma;               // от центра к краям

      vec3 bgColor;
      bgColor.r = texture2D(uBackground, refractUv + dir).r;
      bgColor.g = texture2D(uBackground, refractUv).g;
      bgColor.b = texture2D(uBackground, refractUv - dir).b;


      // === ГИБРИД: фронт по UV, грани — трипланар ===
      float s = 0.45; // масштаб видео на гранях (0.3..0.8)
      vec3 n = normalize(vWorldNormal);
      vec3 w = pow(abs(n), vec3(4.0));                 // веса проекций
      w /= (w.x + w.y + w.z + 1e-5);

      vec2 uvX = fract(vWorldPos.zy * s);
      vec2 uvY = fract(vWorldPos.xz * s);
      vec2 uvZ = fract(vWorldPos.xy * s);

      vec3 texX = texture2D(uVideo, uvX).rgb;
      vec3 texY = texture2D(uVideo, uvY).rgb;
      vec3 texZ = texture2D(uVideo, uvZ).rgb;
      vec3 videoTri = texX * w.x + texY * w.y + texZ * w.z;

      float frontMask = smoothstep(0.35, 0.65, abs(vObjNormal.z)); // локальный фронт ±Z
      vec3 videoUV = texture2D(uVideo, vUv).rgb;
      vec3 videoColor = mix(videoTri, videoUV, frontMask);

      // База: фон+видео+tint
      vec3 panelColor = mix(bgColor, videoColor, uVideoAlpha);
      panelColor      = mix(panelColor, uTint, uTintStrength);

      // --- отражения (исправленное направление!) ---
      vec3 nrm      = normalize(vWorldNormal);
      vec3 viewDir  = normalize(cameraPosition - vWorldPos); // от фрагмента к камере
      vec3 reflectDir = reflect(-viewDir, nrm);
      vec3 envColor   = textureCube(uEnvMap,    reflectDir).rgb;
      vec3 rimColor   = textureCube(uEnvMapRim, reflectDir).rgb;

      float ndv     = max(dot(nrm, viewDir), 0.0);
      float fresnel = pow(1.0 - ndv, 2.4);

      // на гранях чуть "прозрачнее"
      panelColor = mix(panelColor, bgColor, (1.0 - ndv) * 0.20);

      vec3 envCombined = mix(envColor, rimColor, pow(fresnel, 1.2));
      vec3 result      = mix(panelColor, envCombined, uEnvAmount);

      // --- мягкие блики ---
      vec3 edgeColor   = vec3(1.10, 1.05, 0.80);
      vec3 atEdgeColor = vec3(1.12, 0.78, 1.24);

      float spec    = pow(ndv, 20.0);
      float rimSpec = pow(1.0 - ndv, 9.5);
      float glowRim = pow(1.0 - ndv, 10.0);

      result += spec    * edgeColor * 0.06;
      result += rimSpec * edgeColor * 0.34;
      result += glowRim * vec3(1.20,1.10,1.20) * 0.12;

      // --- твой UV-контур по периметру ---
      float edge = smoothstep(0.95, 1.0, length(vUv - 0.5) * 0.72);
      float edgeNoise = edge * (0.92 + 0.15 * noise);
      result += edgeNoise * atEdgeColor * 1.2;

      gl_FragColor = vec4(result, uPanelAlpha);
    }
  `
)

extend({ VideoRefractionMaterial })

const GlassPanelWithOverlay = forwardRef(function GlassPanelWithOverlay(
    { title, href, videoUrl, isActive = false, initialRotation = [0, 0, 0] },
    outerRef
  ) {
  const localGroup = useRef()
  const groupRef = outerRef ?? localGroup
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
    THREE.MathUtils.degToRad(initialRotation[0]), // X — наклон вперёд/назад
    THREE.MathUtils.degToRad(initialRotation[1]), // Y — поворот вбок
    THREE.MathUtils.degToRad(initialRotation[2])  // Z — крен
  ))
  // амплитуда и скорости парения (можешь крутить)
  const floatAmp = useRef({ rot: 0.055, rotZ: 0.035, posY: 0.03 })
  const floatSpd = useRef({ x: 0.17, y: 0.14, z: 0.11, yPos: 0.60 })

 
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

  // Помечаем объект как «панель»
  useEffect(() => {
    if (panelRef.current) panelRef.current.userData.__isGlassPanel = true
  }, [])


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
    texture.flipY = false;
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    texture.wrapS = THREE.RepeatWrapping   // на всякий случай
    texture.wrapT = THREE.RepeatWrapping
    texture.needsUpdate = true
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
    const targetX = baseRot.current.x + (hovered ? mouse.y * 0.32 : 0)
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
    const to = hovered ? 0.8 : 0
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

    // Скрываем все панели в сцене (не только текущую)
    const hidden = []
    scene.traverse((obj) => {
      if (obj.userData?.__isGlassPanel && obj.visible) {
        obj.visible = false
        hidden.push(obj)
      }
    })

    gl.setRenderTarget(bgRenderTarget.current)
    gl.render(scene, camera)
    gl.setRenderTarget(null)

    // Возвращаем видимость панелей
    for (const obj of hidden) obj.visible = true

    // микросдвиг — как было
    if (forceRerender.current && panelRef.current) {
      panelRef.current.rotation.x += 0.0001
      forceRerender.current = false
    }
  })


  return (
    <group ref={groupRef}>
      <mesh
        geometry={nodes.Panel.geometry}
        scale={[0.55, 0.55, 0.55]} // подбери под свою сцену!
        ref={panelRef} 
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerOver={handlePointerOver} 
      >
        {videoTexture && (
          <videoRefractionMaterial
            ref={shaderRef}
            attach="material"   
            uBackground={bgRenderTarget.current?.texture}
            uVideo={videoTexture}  
            uEnvMap={envMapNeutral}
            uEnvMapRim={envMapRim}
            uIntensity={0.22}
            uThickness={2.4}
            uEnvAmount={0.20}    // Прозрачность envMap (0.12…0.22)
            uRimAmount={0.32}    // Сила rim-каймы
            uPanelAlpha={0.68}
            uTint={[0.63, 0.98, 0.86]}
            uTintStrength={0.0}
            transparent
            depthWrite={false}
            />
        )}

        <Html
          position={[0, 0.02, 0.012]}
          center
          transform
          distanceFactor={isActive ? 1.0 : 1.06}
          style={{ pointerEvents: isActive ? 'auto' : 'none' }}
        >
          <div
            className={[
              'px-6 py-3 rounded-xl backdrop-blur-md',
              isActive ? 'bg-black/30' : 'bg-black/20',
              isActive ? 'opacity-100' : 'opacity-45',
              'transition-shadow'
            ].join(' ')}
            style={{
              boxShadow: isActive
                ? '0 10px 30px rgba(0,0,0,.35), inset 0 1px 8px rgba(255,255,255,.06)'
                : '0 6px 16px rgba(0,0,0,.25), inset 0 1px 6px rgba(255,255,255,.04)'
            }}
          >
            <div
              style={{ fontFamily: 'var(--titleFont)' }}
              className={[
                'uppercase tracking-[0.12em] font-extrabold leading-tight',
                // градиент по буквам
                'bg-gradient-to-r from-indigo-100 via-sky-100 to-fuchsia-100',
                'bg-clip-text text-transparent',
                // свечение для читаемости
                'drop-shadow-[0_2px_10px_rgba(0,0,0,.55)]',
                isActive ? 'text-[60px]' : 'text-[28px]'
              ].join(' ')}
            >
              {title}
            </div>
          </div>
        </Html>
      </mesh>
    </group>
  )
});

const PANELS = [
  { title: 'КОД СТЫДА', href: 'https://mysteriumlab.pro/code', video: '/video/ks.mp4' },
  { title: 'ПРИДВОРНЫЕ КАРТЫ', href: 'https://mysteriumlab.pro/mechanica', video: '/video/p2.mp4' },
  { title: 'ТАРО БОТ', href: 'https://t.me/portolux', video: '/video/bot.mp4' },
];

function Carousel() {
  const n = PANELS.length
  const [active, setActive] = useState(0)
  const group = useRef()
  const refs = useRef([])

  // раскладка «по дуге» для пяти слотов: L2, L1, CENTER, R1, R2
  const layout = useMemo(
    () => ([
      { x: -6.0, z: -3.2, rY:  -1.047, s: 0.82 },
      { x: -3.2, z: -1.6, rY:  -0.785, s: 0.92 },
      { x:  0.0, z:  0.0, rY:  0.00, s: 1.05 },
      { x:  3.2, z: -1.6, rY:  0.785, s: 0.92 },
      { x:  6.0, z: -3.2, rY:  1.047, s: 0.82 },
    ]),
    []
  )

  // куда поставить i-ю карточку относительно active
  function targetFor(i) {
    let rel = i - active
    // заворачиваем в диапазон [-2..2]
    while (rel < -2) rel += n
    while (rel >  2) rel -= n
    const slot = rel + 2
    return layout[slot] ?? { x: 0, z: -6, rY: 0, s: 0.7 }
  }

  // плавная интерполяция трансформов — без автоскролла
  useFrame(() => {
    refs.current.forEach((g, i) => {
      if (!g) return
      const t = targetFor(i)
      g.position.x += (t.x - g.position.x) * 0.12
      g.position.z += (t.z - g.position.z) * 0.12
      g.rotation.y += (t.rY - g.rotation.y) * 0.12
      const curS = g.scale.x
      const nextS = THREE.MathUtils.lerp(curS, t.s, 0.12)
      g.scale.setScalar(nextS)
    })
  })

  // кнопки навигации
  const prev = () => setActive((a) => (a - 1 + n) % n)
  const next = () => setActive((a) => (a + 1) % n)

  return (
    <>
      <group ref={group}>
        {PANELS.map((p, i) => (
          <GlassPanelWithOverlay
            key={i}
            ref={(el) => (refs.current[i] = el)}
            videoUrl={p.video}
            title={p.title}
            href={p.href}
            isActive={i === active}
            initialRotation={[
              8 + i * 1.5,   // X: чуть разный наклон вперёд
              -9 + i * 2,    // Y: разный поворот вбок
              1              // Z: крен пока одинаковый
            ]}
          />
        ))}
      </group>

      {/* Стрелки поверх канваса */}
       <Html fullscreen zIndexRange={[0, 0]} style={{ pointerEvents: 'none' }}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-6">
          <button
            onClick={prev}
            className="pointer-events-auto h-12 w-12 rounded-full bg-white/10 border border-white/25 backdrop-blur-md hover:bg-white/15 transition grid place-items-center"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="pointer-events-auto h-12 w-12 rounded-full bg-white/10 border border-white/25 backdrop-blur-md hover:bg-white/15 transition grid place-items-center"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </Html>
    </>
  )
}


// ======== корневой Canvas-виджет ========
export default function DesktopPanelCarousel3D() {

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 25 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={2.8} />
      <directionalLight position={[3, 2, 3]} intensity={2.4} />
      <Environment preset="sunset" />
      <Carousel />
    </Canvas>
  )
}