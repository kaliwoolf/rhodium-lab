'use client'

// DesktopPanelCarousel3D.jsx
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, shaderMaterial, useCubeTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'

// ======== shaderMaterial (как в тесте, с трипланаром + rim/edge) ========
const VideoRefractionMaterial = shaderMaterial(
  {
    uVideo: null,
    uBackground: null,
    uEnvMap: null,
    uEnvMapRim: null,
    uIntensity: 0.22,
    uThickness: 2.4,
    uTint: new THREE.Color(0.63, 0.98, 0.86),
    uTintStrength: 0.0,
    uEnvAmount: 0.22,
    uRimAmount: 0.42,
    uVideoAlpha: 0.0,
    uPanelAlpha: 0.68,
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
      vObjNormal = normal; // в объектном пространстве (для маски фронта)
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
      // лёгкий шум/бамп
      float noise = fract(sin(dot(vUv * 0.87, vec2(12.9898,78.233))) * 43758.5453);
      float bump = sin(vUv.y * 18. + time * 0.8) * 0.012
                 + cos(vUv.x * 14. - time * 0.54) * 0.011
                 + (noise - 0.5) * 0.055;

      float chroma = 0.05 * uThickness * uIntensity;
      vec2 refractUv = vUv + vec2(bump, bump) * uIntensity * uThickness;

      // преломляем фон сцены
      vec3 bgColor;
      bgColor.r = texture2D(uBackground, refractUv + vec2(chroma, 0.0)).r;
      bgColor.g = texture2D(uBackground, refractUv).g;
      bgColor.b = texture2D(uBackground, refractUv - vec2(chroma, 0.0)).b;

      // === гибрид: UV на фронте + трипланар на гранях ===
      float s = 0.45; // масштаб проекции
      vec3 n = normalize(vWorldNormal);
      vec3 w = pow(abs(n), vec3(4.0));      // веса трипланара
      w /= (w.x + w.y + w.z + 1e-5);

      vec2 uvX = fract(vWorldPos.zy * s);
      vec2 uvY = fract(vWorldPos.xz * s);
      vec2 uvZ = fract(vWorldPos.xy * s);

      vec3 texX = texture2D(uVideo, uvX).rgb;
      vec3 texY = texture2D(uVideo, uvY).rgb;
      vec3 texZ = texture2D(uVideo, uvZ).rgb;
      vec3 videoTri = texX * w.x + texY * w.y + texZ * w.z;

      float frontMask = smoothstep(0.35, 0.65, abs(vObjNormal.z));
      vec3 videoUV  = texture2D(uVideo, vUv).rgb;
      vec3 videoColor = mix(videoTri, videoUV, frontMask);

      vec3 panelColor = mix(bgColor, videoColor, uVideoAlpha);
      panelColor = mix(panelColor, uTint, uTintStrength);

      // отражения
      vec3 viewDir    = normalize(cameraPosition - vWorldPos);
      vec3 nrm        = normalize(vWorldNormal);
      vec3 reflectDir = reflect(-viewDir, nrm);
      vec3 envColor   = textureCube(uEnvMap, reflectDir).rgb;
      vec3 rimColor   = textureCube(uEnvMapRim, reflectDir).rgb;

      float ndv = max(dot(nrm, viewDir), 0.0);
      float fresnel = pow(1.0 - ndv, 2.8);

      vec3 envCombined = mix(envColor, rimColor, pow(fresnel, 1.25));
      vec3 envMix = mix(panelColor, envCombined, uEnvAmount);

      vec3 edgeColor   = vec3(1.10, 1.05, 0.80);
      vec3 atEdgeColor = vec3(1.12, 0.78, 1.24);

      vec3 result = envMix + fresnel * edgeColor * (uRimAmount * 0.7);

      // hotspot + эмиссия на краях (деликатно)
      float spec    = pow(ndv, 20.0);
      float rimSpec = pow(1.0 - ndv, 8.0);
      result += spec * edgeColor * 0.06;
      result += rimSpec * edgeColor * 0.34;

      float glowRim = pow(1.0 - ndv, 9.0);
      result += glowRim * vec3(1.30, 1.15, 1.25) * 0.18;

      // тонкая рамка по периметру лицевой
      float edge = smoothstep(0.95, 1.0, length(vUv - 0.5) * 0.72);
      float edgeNoise = edge * (0.92 + 0.15 * noise);
      result += edgeNoise * atEdgeColor * 1.2;

      gl_FragColor = vec4(result, uPanelAlpha);
    }
  `
)
extend({ VideoRefractionMaterial })

// ======== одна 3D-панель (как в тесте) ========
function GlassPanel({ videoUrl, initialRotation = [0.06, -0.28, -0.03], scale = 0.65 }) {
  const panelRef = useRef()
  const shaderRef = useRef()
  const [videoTexture, setVideoTexture] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  // модель
  const { nodes, scene: gltfScene } = useGLTF('/models/p3.glb')

  const meshObject = useMemo(() => {
    // если есть nodes.Panel — используем его, иначе берём первый Mesh из сцены
    if (nodes && nodes.Panel) return nodes.Panel
    let mesh = null
    gltfScene.traverse((o) => { if (!mesh && o.isMesh) mesh = o })
    return mesh
  }, [nodes, gltfScene])

  // кубмапы
  const envMapNeutral = useCubeTexture(['px.png','nx.png','py.png','ny.png','pz.png','nz.png'], { path: '/hdr/studio/' })
  const envMapRim     = useCubeTexture(['px.png','nx.png','py.png','ny.png','pz.png','nz.png'], { path: '/hdr/hi01/' })

  // видео-текстура
  useEffect(() => {
    const video = document.createElement('video')
    video.src = videoUrl
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.preload = 'auto'
    video.play().catch(() => {})
    const tex = new THREE.VideoTexture(video)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = false
    setVideoTexture(tex)
    return () => {
      tex.dispose()
      video.pause()
      video.src = ''
    }
  }, [videoUrl])

  // фон в текстуру (для преломления)
  const { gl, scene, camera, size } = useThree()
  const bgRenderTarget = useRef()
  useEffect(() => {
    bgRenderTarget.current = new THREE.WebGLRenderTarget(size.width, size.height)
    return () => bgRenderTarget.current?.dispose()
  }, [size.width, size.height])

  // исходный угол
  const baseRot = useRef(new THREE.Euler(...initialRotation))

  // ховер
  const onOver  = () => setHovered(true)
  const onOut   = () => { setHovered(false); setMouse({x:0,y:0}) }
  const onMove  = (e) => setMouse({ x: (e.uv.x - 0.5) * 2, y: -(e.uv.y - 0.5) * 2 })

  // анимация + фон-пас
  useFrame((state, delta) => {
    if (!shaderRef.current || !panelRef.current) return

    const t = state.clock.getElapsedTime()
    shaderRef.current.uniforms.time.value = t

    // парение + hover tilt
    const wobX = Math.sin(t * 0.17) * 0.055
    const wobY = Math.cos(t * 0.14) * 0.055
    const wobZ = Math.sin(t * 0.11) * 0.035

    const targetX = baseRot.current.x + wobX + (hovered ? mouse.y * 0.32 : 0)
    const targetY = baseRot.current.y + wobY + (hovered ? mouse.x * 0.30 : 0)
    const targetZ = baseRot.current.z + wobZ

    panelRef.current.rotation.x += (targetX - panelRef.current.rotation.x) * 0.12
    panelRef.current.rotation.y += (targetY - panelRef.current.rotation.y) * 0.12
    panelRef.current.rotation.z += (targetZ - panelRef.current.rotation.z) * 0.12
    panelRef.current.position.y  = Math.sin(t * 0.6) * 0.03

    // плавный fade для видео
    const cur = shaderRef.current.uniforms.uVideoAlpha.value
    const to  = hovered ? 1 : 0
    shaderRef.current.uniforms.uVideoAlpha.value = THREE.MathUtils.lerp(cur, to, delta * 2.5)

    // фон-пас
    if (bgRenderTarget.current) {
      panelRef.current.visible = false
      gl.setRenderTarget(bgRenderTarget.current)
      gl.render(scene, camera)
      gl.setRenderTarget(null)
      panelRef.current.visible = true
    }
  })

  if (!meshObject) return null

  return (
    <group>
      <primitive
        object={meshObject}
        ref={panelRef}
        scale={[scale, scale, scale]}
        frustumCulled={false}
        onPointerMove={onMove}
        onPointerOver={onOver}
        onPointerOut={onOut}
      >
        {videoTexture && (
          <videoRefractionMaterial
            ref={shaderRef}
            uBackground={bgRenderTarget.current?.texture || null}
            uVideo={videoTexture}
            uEnvMap={envMapNeutral}
            uEnvMapRim={envMapRim}
            uIntensity={0.22}
            uThickness={2.4}
            uEnvAmount={0.22}
            uRimAmount={0.42}
            uPanelAlpha={0.68}
            uTint={[0.63, 0.98, 0.86]}
            uTintStrength={0.0}
            transparent
            depthWrite={false}
          />
        )}
      </primitive>
    </group>
  )
}

const PANELS = [
  { title: 'Проект 1', href: '#p1', video: '/video/ks.mp4' },
  { title: 'Проект 2', href: '#p2', video: '/video/p2.mp4' },
  { title: 'Проект 3', href: '#p3', video: '/video/bot.mp4' },
];

function Carousel() {
  const group = useRef();
  const spacing = 3.2;        // расстояние между панелями
  const speed = 0.18;         // скорость автопрокрутки (меньше — медленнее)
  const loopW = spacing * PANELS.length;
  const offset = useRef(0);

  useFrame((_, dt) => {
    offset.current = (offset.current + speed * dt) % loopW;
    // перекладываем панели по X с зацикливанием
    group.current.children.forEach((child, i) => {
      let x = i * spacing - offset.current - loopW / 2;
      if (x < -loopW / 2) x += loopW; // wrap
      child.position.set(x, 0, 0);
    });
  });

  return (
    <group ref={group}>
      {PANELS.map((p, i) => (
        <GlassPanelWithOverlay
          key={i}
          videoUrl={p.video}
          title={p.title}
          href={p.href}
          // базовый поворот каждой панели чуть разный — живее
          baseRotation={[0.02, -0.12 + i * 0.02, 0.0]}
        />
      ))}
    </group>
  );
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

// заранее грузим модель
useGLTF.preload('/models/p3.glb')
