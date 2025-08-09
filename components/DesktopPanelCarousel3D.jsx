import { Canvas, useFrame, extend, useThree } from "@react-three/fiber"
import { Html, Environment, useGLTF, useCubeTexture, shaderMaterial } from "@react-three/drei"
import * as THREE from "three"
import { useEffect, useMemo, useRef, useState } from "react"

// ======== ТЕ ЖЕ ШЕЙДЕРЫ (вырезка из твоего тестового, без правок по логике) ========
const VideoRefractionMaterial = shaderMaterial(
  {
    uVideo: null, uBackground: null,
    uEnvMap: null, uEnvMapRim: null,
    uIntensity: 0.22, uThickness: 2.4,
    uTint: new THREE.Color(0.63, 0.98, 0.86),
    uTintStrength: 0.0,
    uEnvAmount: 0.22, uRimAmount: 0.42,
    uVideoAlpha: 0.0, uPanelAlpha: 0.68, time: 0
  },
  /* glsl */`
    varying vec2 vUv; varying vec3 vWorldNormal; varying vec3 vWorldPos; varying vec3 vObjNormal;
    void main() {
      vUv=uv;
      vWorldNormal=normalize(normalMatrix*normal);
      vWorldPos=(modelMatrix*vec4(position,1.0)).xyz;
      vObjNormal=normal;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }`,
  /* glsl */`
    uniform sampler2D uVideo, uBackground;
    uniform samplerCube uEnvMap, uEnvMapRim;
    uniform float uIntensity,uThickness,uEnvAmount,uRimAmount,uVideoAlpha,uPanelAlpha,time;
    uniform vec3 uTint; uniform float uTintStrength;
    varying vec2 vUv; varying vec3 vWorldNormal; varying vec3 vWorldPos; varying vec3 vObjNormal;

    void main(){
      float noise=fract(sin(dot(vUv*0.87,vec2(12.9898,78.233)))*43758.5453);
      float bump=sin(vUv.y*18.+time*0.8)*0.012+cos(vUv.x*14.-time*0.54)*0.011+(noise-0.5)*0.055;
      float chroma=0.05*uThickness*uIntensity;
      vec2 refractUv=vUv+vec2(bump)*uIntensity*uThickness;

      vec3 bg; bg.r=texture2D(uBackground,refractUv+vec2(chroma,0.0)).r;
      bg.g=texture2D(uBackground,refractUv).g;
      bg.b=texture2D(uBackground,refractUv-vec2(chroma,0.0)).b;

      // — гибрид: UV по фронту + трипланар для граней
      float s=0.45;
      vec3 n=normalize(vWorldNormal);
      vec3 w=pow(abs(n),vec3(4.0)); w/= (w.x+w.y+w.z+1e-5);
      vec2 uvX=fract(vWorldPos.zy*s), uvY=fract(vWorldPos.xz*s), uvZ=fract(vWorldPos.xy*s);
      vec3 texX=texture2D(uVideo,uvX).rgb, texY=texture2D(uVideo,uvY).rgb, texZ=texture2D(uVideo,uvZ).rgb;
      vec3 videoTri=texX*w.x+texY*w.y+texZ*w.z;
      float frontMask=smoothstep(0.35,0.65,abs(vObjNormal.z));
      vec3 videoColor=mix(videoTri,texture2D(uVideo,vUv).rgb,frontMask);

      vec3 panelColor=mix(bg,videoColor,uVideoAlpha);
      panelColor=mix(panelColor,uTint,uTintStrength);

      vec3 viewDir=normalize(vWorldPos-cameraPosition);
      vec3 reflectDir=reflect(viewDir,normalize(vWorldNormal));
      vec3 envColor=textureCube(uEnvMap,reflectDir).rgb;
      vec3 rimColor=textureCube(uEnvMapRim,reflectDir).rgb;

      vec3 envMix=mix(panelColor,envColor,uEnvAmount);

      float fresnel=pow(1.0-abs(dot(normalize(vWorldNormal),normalize(viewDir))),2.8);
      float fresnelStrength=uRimAmount*1.1;
      vec3 edgeColor=vec3(1.1,1.05,0.8);
      vec3 atEdgeColor=vec3(1.12,0.78,1.24);

      vec3 result=envMix + fresnel*edgeColor*fresnelStrength;

      float spec=pow(max(dot(viewDir,vWorldNormal),0.0),20.0);
      result+=spec*edgeColor*0.08;
      float rimSpec=pow(1.0-max(dot(normalize(vWorldNormal),normalize(viewDir)),0.0),8.0);
      result+=rimSpec*edgeColor*0.35;
      float glowRim=pow(1.0-abs(dot(normalize(vWorldNormal),normalize(viewDir))),9.0);
      result+=glowRim*vec3(1.30,1.15,1.25)*0.2;

      float edge=smoothstep(0.95,1.0,length(vUv-0.5)*0.72);
      float edgeNoise=edge*(0.92+0.15*noise);
      result+=edgeNoise*atEdgeColor*1.2;

      gl_FragColor=vec4(result,uPanelAlpha);
    }`
)
extend({ VideoRefractionMaterial })

// ======== Один элемент панели (копия твоего GlassPanelWithOverlay c hover/tilt/парением) ========
function Panel({ videoUrl, position = [0,0,0], baseRotation=[-0.05, 0.22, 0.0] }) {
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
    const v = document.createElement('video')
    v.src = videoUrl; v.crossOrigin='anonymous'; v.loop=true; v.muted=true; v.playsInline=true; v.autoplay=true; v.preload='auto'; v.play()
    const tex = new THREE.VideoTexture(v)
    setVideoTexture(tex)
    return () => { tex.dispose(); v.pause(); v.src='' }
  }, [videoUrl])

  // фон-рендер таргет (для преломления)
  const { gl, scene, camera, size } = useThree()
  const bgRT = useRef()
  useEffect(() => { bgRT.current = new THREE.WebGLRenderTarget(size.width, size.height); return () => bgRT.current?.dispose() }, [size])

  // события
  const handlePointerMove = (e) => setMouse({ x:(e.uv.x-0.5)*2, y:-(e.uv.y-0.5)*2 })
  const handlePointerOver = () => setHovered(true)
  const handlePointerOut  = () => { setHovered(false); setMouse({x:0,y:0}) }

  // парение + рендер фона + плавный фейд видео
  const baseRot = useRef(new THREE.Euler(...baseRotation))
  useFrame((state, delta) => {
    if (!shaderRef.current || !panelRef.current) return
    const t = state.clock.getElapsedTime()
    shaderRef.current.uniforms.time.value = t

    // скрываем панель, рендерим фон
    panelRef.current.visible = false
    gl.setRenderTarget(bgRT.current); gl.render(scene, camera); gl.setRenderTarget(null)
    panelRef.current.visible = true

    const wobX = Math.sin(t*0.17)*0.055, wobY = Math.cos(t*0.14)*0.055, wobZ = Math.sin(t*0.11)*0.035
    const tx = baseRot.current.x + wobX + (hovered ? mouse.y*0.32 : 0)
    const ty = baseRot.current.y + wobY + (hovered ? mouse.x*0.30 : 0)
    const tz = baseRot.current.z + wobZ
    panelRef.current.rotation.x += (tx - panelRef.current.rotation.x) * 0.12
    panelRef.current.rotation.y += (ty - panelRef.current.rotation.y) * 0.12
    panelRef.current.rotation.z += (tz - panelRef.current.rotation.z) * 0.12
    panelRef.current.position.y  = Math.sin(t*0.6)*0.03

    const curAlpha = shaderRef.current.uniforms.uVideoAlpha.value
    const target   = hovered ? 1 : 0
    shaderRef.current.uniforms.uVideoAlpha.value = THREE.MathUtils.lerp(curAlpha, target, delta*2.5)
  })

  return (
    <group position={position}>
      <primitive
        object={nodes.Panel}
        scale={[0.8,0.8,0.8]}
        ref={panelRef}
        onPointerMove={handlePointerMove}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {videoTexture && (
          <videoRefractionMaterial
            ref={shaderRef}
            uBackground={bgRT.current?.texture}
            uVideo={videoTexture}
            uEnvMap={envMapNeutral}
            uEnvMapRim={envMapRim}
          />
        )}
      </primitive>
    </group>
  )
}

// ======== Карусель с автопрокруткой (max 5 карточек) ========
const ITEMS = [
  { videoUrl: "/video/ks.mp4" },
  { videoUrl: "/video/p2.mp4" },
  { videoUrl: "/video/bot.mp4" },
  { videoUrl: "/video/00004.mp4" },
  { videoUrl: "/video/00002.mp4" },
].slice(0,5)

function Slider() {
  const offset = useRef(0)       // текущая позиция (плавающая)
  const target = useRef(0)       // целевой индекс
  const gap = 3.2                // расстояние между панелями
  const speed = 0.035            // скорость смещения

  // автопрокрутка
  useEffect(() => {
    const id = setInterval(() => {
      target.current = (target.current + 1) % ITEMS.length
    }, 4500)
    return () => clearInterval(id)
  }, [])

  // плавный переход offset → target
  useFrame(() => {
    offset.current += (target.current - offset.current) * speed
  })

  return (
    <group>
      {ITEMS.map((it, i) => (
        <Panel
          key={i}
          videoUrl={it.videoUrl}
          position={[ (i - offset.current) * gap, 0, 0 ]}
        />
      ))}
    </group>
  )
}

export default function DesktopPanelCarousel3D() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position:[0,0,8], fov:25 }} gl={{ antialias:true }}>
        <ambientLight intensity={2.2} />
        <directionalLight position={[3,2,3]} intensity={2.0} />
        <Environment preset="sunset" />
        <Slider />
      </Canvas>
    </div>
  )
}
