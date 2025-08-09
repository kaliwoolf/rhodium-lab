// DesktopPanelCarousel3D.jsx
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber"
import { Environment, useGLTF, useCubeTexture, shaderMaterial } from "@react-three/drei"
import * as THREE from "three"
import { useEffect, useRef, useState } from "react"

// ==== ШЕЙДЕР из твоего теста (тот, что «кайфушная панель») ====
const VideoRefractionMaterial = shaderMaterial(
  {
    uVideo: null, uBackground: null,
    uEnvMap: null, uEnvMapRim: null,
    uIntensity: 0.22, uThickness: 2.4,
    uTint: new THREE.Color(0.63, 0.98, 0.86),
    uTintStrength: 0.0,
    uEnvAmount: 0.20, uRimAmount: 0.32,
    uVideoAlpha: 0.0, uPanelAlpha: 0.68, time: 0
  },
  /* glsl */`
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPos;
    varying vec3 vObjNormal;
    void main() {
      vUv = uv;
      vWorldNormal = normalize(normalMatrix * normal);
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      vObjNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */`
    uniform sampler2D uVideo;
    uniform sampler2D uBackground;
    uniform samplerCube uEnvMap, uEnvMapRim;
    uniform float uIntensity, uThickness, uEnvAmount, uRimAmount, uVideoAlpha, uPanelAlpha, time;
    uniform vec3 uTint; uniform float uTintStrength;

    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPos;
    varying vec3 vObjNormal;

    void main(){
      // noise + bump
      float noise = fract(sin(dot(vUv*0.87, vec2(12.9898,78.233))) * 43758.5453);
      float bump  =  sin(vUv.y * 18. + time * 1.2) * 0.012
                   + cos(vUv.x * 14. - time * 0.78) * 0.011
                   + (noise - 0.5) * 0.055;
      bump *= 1.4;

      // chromatic refraction of background
      float chroma = 0.07 * uThickness * uIntensity;
      vec2 refractUv = clamp(vUv + vec2(bump) * uIntensity * uThickness, 0.001, 0.999);
      vec3 bg;
      bg.r = texture2D(uBackground, refractUv + vec2(chroma, 0.0)).r;
      bg.g = texture2D(uBackground, refractUv).g;
      bg.b = texture2D(uBackground, refractUv - vec2(chroma, 0.0)).b;

      // фронт — UV, грани — трипланар
      float s = 0.45;
      vec3 n = normalize(vWorldNormal);
      vec3 w = pow(abs(n), vec3(4.0)); w /= (w.x+w.y+w.z+1e-5);
      vec2 uvX = fract(vWorldPos.zy * s);
      vec2 uvY = fract(vWorldPos.xz * s);
      vec2 uvZ = fract(vWorldPos.xy * s);
      vec3 videoTri = texture2D(uVideo, uvX).rgb * w.x
                    + texture2D(uVideo, uvY).rgb * w.y
                    + texture2D(uVideo, uvZ).rgb * w.z;
      float frontMask = smoothstep(0.35, 0.65, abs(vObjNormal.z));
      vec3 videoUV  = texture2D(uVideo, vUv).rgb;
      vec3 videoCol = mix(videoTri, videoUV, frontMask);

      // base
      vec3 panel = mix(bg, videoCol, uVideoAlpha);
      panel = mix(panel, uTint, uTintStrength);

      // reflections (dir fixed)
      vec3 nrm = normalize(vWorldNormal);
      vec3 viewDir = normalize(cameraPosition - vWorldPos); // важно: от фрагмента к камере
      vec3 reflectDir = reflect(-viewDir, nrm);
      vec3 env = textureCube(uEnvMap, reflectDir).rgb;
      vec3 rim = textureCube(uEnvMapRim, reflectDir).rgb;

      float ndv = max(dot(nrm, viewDir), 0.0);
      float fresnel = pow(1.0 - ndv, 2.4);

      // чуть прозрачней на гранях
      panel = mix(panel, bg, (1.0 - ndv) * 0.20);

      vec3 envCombined = mix(env, rim, pow(fresnel, 1.2));
      vec3 result = mix(panel, envCombined, uEnvAmount);

      // highlights + edge glow
      vec3 edgeColor   = vec3(1.10, 1.05, 0.80);
      vec3 atEdgeColor = vec3(1.12, 0.78, 1.24);
      float spec    = pow(ndv, 20.0);
      float rimSpec = pow(1.0 - ndv, 9.5);
      float glowRim = pow(1.0 - ndv, 10.0);
      result += spec    * edgeColor * 0.06;
      result += rimSpec * edgeColor * 0.34;
      result += glowRim * vec3(1.20,1.10,1.20) * 0.12;

      // твоя UV-кайма
      float edge = smoothstep(0.95, 1.0, length(vUv - 0.5) * 0.72);
      float edgeNoise = edge * (0.92 + 0.15 * noise);
      result += edgeNoise * atEdgeColor * 1.2;

      gl_FragColor = vec4(result, uPanelAlpha);
    }
  `
)
extend({ VideoRefractionMaterial })

// ==== Одна панель (копия твоего GlassPanelWithOverlay, без Html-оверлея) ====
function Panel({ videoUrl, position=[0,0,0], baseRotation=[THREE.MathUtils.degToRad(8), THREE.MathUtils.degToRad(-9), THREE.MathUtils.degToRad(1)] }) {
  const panelRef = useRef()
  const shaderRef = useRef()
  const [videoTexture, setVideoTexture] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const { nodes } = useGLTF('/models/p3.glb')

  const envMapNeutral = useCubeTexture(['px.png','nx.png','py.png','ny.png','pz.png','nz.png'], { path: '/hdr/studio/' })
  const envMapRim     = useCubeTexture(['px.png','nx.png','py.png','ny.png','pz.png','nz.png'], { path: '/hdr/hi01/' })

  // видео
  useEffect(() => {
    const v = document.createElement("video")
    v.src = videoUrl
    v.crossOrigin = "anonymous"
    v.loop = true; v.muted = true; v.playsInline = true; v.autoplay = true; v.preload = "auto"
    v.play()
    const tex = new THREE.VideoTexture(v)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = false
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    setVideoTexture(tex)
    return () => { tex.dispose(); v.pause(); v.src = "" }
  }, [videoUrl])

  // рендер таргет для фона (преломление)
  const { gl, scene, camera, size } = useThree()
  const bgRT = useRef()
  useEffect(() => {
    bgRT.current = new THREE.WebGLRenderTarget(size.width, size.height)
    return () => bgRT.current?.dispose()
  }, [size.width, size.height])

  // hover
  const onMove = (e) => setMouse({ x: (e.uv.x - 0.5) * 2, y: -(e.uv.y - 0.5) * 2 })
  const onOver = () => setHovered(true)
  const onOut  = () => { setHovered(false); setMouse({x:0, y:0}) }

  const baseRot = useRef(new THREE.Euler(...baseRotation))

  useFrame((state, delta) => {
    if (!shaderRef.current || !panelRef.current) return
    const t = state.clock.getElapsedTime()
    shaderRef.current.uniforms.time.value = t

    // спрятали панель, отрендерили фон, вернули
    panelRef.current.visible = false
    gl.setRenderTarget(bgRT.current); gl.render(scene, camera); gl.setRenderTarget(null)
    panelRef.current.visible = true

    // парение + ховер
    const wobX = Math.sin(t * 0.17) * 0.055
    const wobY = Math.cos(t * 0.14) * 0.055
    const wobZ = Math.sin(t * 0.11) * 0.035
    const tx = baseRot.current.x + wobX + (hovered ? mouse.y * 0.32 : 0)
    const ty = baseRot.current.y + wobY + (hovered ? mouse.x * 0.30 : 0)
    const tz = baseRot.current.z + wobZ
    panelRef.current.rotation.x += (tx - panelRef.current.rotation.x) * 0.12
    panelRef.current.rotation.y += (ty - panelRef.current.rotation.y) * 0.12
    panelRef.current.rotation.z += (tz - panelRef.current.rotation.z) * 0.12
    panelRef.current.position.y  = Math.sin(t * 0.6) * 0.03

    // fade видео
    const cur = shaderRef.current.uniforms.uVideoAlpha.value
    const to  = hovered ? 0.8 : 0.0
    shaderRef.current.uniforms.uVideoAlpha.value = THREE.MathUtils.lerp(cur, to, delta * 2.5)
  })

  return (
    <group position={position}>
      <primitive
        object={nodes.Panel}
        scale={[0.65, 0.65, 0.65]}
        ref={panelRef}
        onPointerMove={onMove}
        onPointerOver={onOver}
        onPointerOut={onOut}
      >
        {videoTexture && (
          <videoRefractionMaterial
            ref={shaderRef}
            uBackground={bgRT.current?.texture}
            uVideo={videoTexture}
            uEnvMap={envMapNeutral}
            uEnvMapRim={envMapRim}
            transparent
            depthWrite={false}
          />
        )}
      </primitive>
    </group>
  )
}

// ==== Карусель (до 5 шт) c автопрокруткой ====
const ITEMS = [
  { videoUrl: "/video/ks.mp4" },
  { videoUrl: "/video/p2.mp4" },
  { videoUrl: "/video/bot.mp4" },
  { videoUrl: "/video/00004.mp4" },
  { videoUrl: "/video/00002.mp4" },
].slice(0,5)

function Slider() {
  const offset = useRef(0)
  const target = useRef(0)
  const gap = 3.2
  const speed = 0.035

  useEffect(() => {
    const id = setInterval(() => { target.current = (target.current + 1) % ITEMS.length }, 4500)
    return () => clearInterval(id)
  }, [])

  useFrame(() => {
    offset.current += (target.current - offset.current) * speed
  })

  return (
    <group>
      {ITEMS.map((it, i) => (
        <Panel key={i} videoUrl={it.videoUrl} position={[ (i - offset.current) * gap, 0, 0 ]} />
      ))}
    </group>
  )
}

export default function DesktopPanelCarousel3D() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position:[0,0,10], fov:18 }} gl={{ antialias:true, alpha:true }}>
        <ambientLight intensity={2.8} />
        <directionalLight position={[3,2,3]} intensity={2.4} />
        <Environment preset="sunset" />
        <Slider />
      </Canvas>
    </div>
  )
}
