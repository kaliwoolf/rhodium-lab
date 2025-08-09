'use client'

import { useState, useEffect, useRef, Suspense, useMemo } from 'react'
import Image from 'next/image'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { VideoTexture } from 'three'

useGLTF.preload('/models/ContactFrame.glb')

const ROT = [
  THREE.MathUtils.degToRad(-8),
  THREE.MathUtils.degToRad(10),
  0
]

export default function ContactBlock() {
  const mouse = useRef(new THREE.Vector2(0.5, 0.5))
  const [videoTexture, setVideoTexture] = useState(null)

  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/video/00004.mp4'
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.playbackRate = 0.95

    const handleCanPlay = () => {
      const texture = new VideoTexture(video)
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      setVideoTexture(texture)
      video.play().catch(err => console.error('[🛑] Ошибка воспроизведения видео:', err))
    }

    video.addEventListener('canplay', handleCanPlay)
    video.load()

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top
    mouse.current.set(x / rect.width, 1 - y / rect.height)
  }

  return (
    <section
      id="contact"
      className="relative text-white min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden"
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
    >
      <div className="contact-canvas relative z-20">
        <div className="relative w-full h-full">
          <Canvas gl={{ alpha: true }} camera={{ position: [0, 0, 2.5], fov: 50 }}>
            <Suspense fallback={null}>
              <PanelWithVideo texture={videoTexture} mouse={mouse} />
              <Environment preset="city" />
            </Suspense>
          </Canvas>

          <div className="absolute inset-0 z-10 w-full h-full flex flex-col items-center justify-center gap-10 px-4 pointer-events-none">
            <div className="uppercase tracking-widest text-sm text-white/60 flex items-center gap-2">
              <span className="text-white/40">✦</span>
              НАПИШИТЕ
              <span className="text-white/40">✦</span>
            </div>

            <a
              href="mailto:hi@rhodium.vision"
              className="group relative pointer-events-auto text-2xl md:text-4xl font-mono font-light tracking-[0.15em] md:tracking-[0.3em] text-center text-fuchsia-300 drop-shadow-[0_0_6px_rgba(255,0,255,0.3)] hover:drop-shadow-[0_0_10px_rgba(255,0,255,0.5)] transition"
            >
              HI@RHODIUM.VISION
              <span className="absolute left-0 -bottom-1 h-[1px] w-full bg-fuchsia-300 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out" />
            </a>

            <div className="relative w-[160px] sm:w-[180px] h-[200px] sm:h-[220px] rounded-xl overflow-hidden border border-white/20 shadow-xl pointer-events-auto">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                src="/video/ice.mp4"
              />
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
                <Image src="/qr-code.png" width={120} height={120} alt="QR" />
                <p className="text-xs text-white/60 text-center mt-3 tracking-widest">[ crafted in rhodium ]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PanelWithVideo({ texture, mouse }) {
  const { nodes } = useGLTF('/models/ContactFrame.glb')
  const groupRef = useRef()
  const geoShift = useRef(new THREE.Vector3())
  const geoSize = useRef(new THREE.Vector3())

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    transparent: true,
    color: 0xffffff,
    transmission: 1.0,
    thickness: 0.1,
    roughness: 0.03,
    ior: 1.52,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    depthWrite: false,
    envMapIntensity: 0
  }), [])

  useEffect(() => {
    const frame = nodes?.Frame
    if (!frame?.geometry) return
    frame.geometry.computeBoundingBox()
    const bb = frame.geometry.boundingBox
    geoSize.current.subVectors(bb.max, bb.min)
    geoShift.current.addVectors(bb.min, bb.max).multiplyScalar(0.5)
    const targetH = 1.8
    const s = targetH / geoSize.current.y
    groupRef.current.scale.setScalar(s)
  }, [nodes])

  if (!nodes?.Frame) return null

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0.005]}
      rotation={[0, THREE.MathUtils.degToRad(3), 0]}
    >
      {texture && (
        <VideoPlane
          texture={texture}
          mouse={mouse}
          geometry={nodes.Frame.geometry} // ← передаём форму панели
          position={[-geoShift.current.x, -geoShift.current.y, -0.002]}
        />
      )}
      <mesh
        geometry={nodes.Frame.geometry}
        position={[-geoShift.current.x, -geoShift.current.y, 0]}
        material={glassMat}
        renderOrder={10}
      />
    </group>
  )
}

function VideoPlane({ texture, mouse, geometry, position = [0, 0, -0.006] }) {
  const shaderArgs = useMemo(() => ({
    uniforms: { uTexture: { value: texture }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform vec2 uMouse;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        float dist = distance(uv, uMouse);
        uv += 0.02 * sin(10.0 * dist - uTime * 3.0) * normalize(uv - uMouse);
        float lensRadius = 0.2;
        float lensPower = 0.1;
        if (dist < lensRadius) {
          float strength = (lensRadius - dist) / lensRadius;
          uv += (uv - uMouse) * strength * lensPower;
        }
        vec4 color = texture2D(uTexture, uv);
        float vignette = smoothstep(0.4, 0.9, distance(uv, vec2(0.5)));
        color.rgb *= 1.0 - vignette;
        color.a = 0.5;  
        gl_FragColor = color;
      }
    `
  }), [texture])

  useFrame(({ clock }) => {
    shaderArgs.uniforms.uTime.value = clock.getElapsedTime()
    shaderArgs.uniforms.uMouse.value.lerp(mouse.current, 0.15)
  })

  return (
    <mesh geometry={geometry} position={position} renderOrder={5}>
      <shaderMaterial args={[shaderArgs]} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

