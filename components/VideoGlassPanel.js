import { useRef, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls, shaderMaterial } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import * as THREE from "three"
import { useGLTF } from '@react-three/drei'


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

function GlassPanel({ videoUrl }) {
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
      mesh.current.rotation.y += (((hovered ? mouse.x : 0) * 0.44) - mesh.current.rotation.y) * 0.13
    }
  })
  
  return (
    <>
      <primitive
        ref={mesh}
        object={nodes.Panel} // или nodes.Panel, если так назвал в Blender
        scale={[0.2, 0.3, 0.3]}
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
      </primitive>
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
        <ambientLight intensity={2} />
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
