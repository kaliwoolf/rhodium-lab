'use client'

import { useState, useEffect, useRef, Suspense, useMemo } from 'react'
import Image from 'next/image'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { VideoTexture } from 'three'

useGLTF.preload('/models/ContactFrame.glb')


export default function ContactBlock() {
  const mouse = useRef(new THREE.Vector2(0.5, 0.5))
  const [videoTexture, setVideoTexture] = useState(null)

  useEffect(() => {
    const video = document.createElement('video')
    video.src = '/video/ice.mp4'
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


      video.play().catch((err) => {
        console.error('[🛑] Ошибка воспроизведения видео:', err)
      })
    }

    video.addEventListener('canplay', handleCanPlay)
    video.load()

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  // Универсальный обработчик для мыши и тача
  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top
    mouse.current.set(x / rect.width, 1 - y / rect.height)
  }

  function BlenderGlass() {
    const { scene } = useGLTF('/models/ContactFrame.glb')
    const gRef = useRef()

    const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
      transparent: true,
      depthWrite: false,
      roughness: 0.02,
      transmission: 0.96,
      thickness: 0.08,
      ior: 1.52,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.0,
    }), [])

    useMemo(() => {
      scene.traverse((o) => {
        if (o.isMesh) {
          o.material = glassMat
          o.renderOrder = 10
          o.castShadow = false
          o.receiveShadow = false
        }
      })
    }, [scene, glassMat])

    // Центруем модель и подгоняем размер под 3.2 x 2.4 (+2%)
    useEffect(() => {
      scene.updateMatrixWorld(true)
      const box = new THREE.Box3().setFromObject(scene)
      const size = new THREE.Vector3()
      const center = new THREE.Vector3()
      box.getSize(size)
      box.getCenter(center)

      // перенести центр модели в (0,0,0)
      scene.position.sub(center)

      // целевой масштаб — ставим на group (НЕ на scene!)
      const targetW = 3.2 * 1.02
      const targetH = 2.4 * 1.02
      const s = Math.min(targetW / size.x, targetH / size.y)
      if (gRef.current) gRef.current.scale.setScalar(s)
    }, [scene])

    return (
      <group
        ref={gRef}
        position={[0, 0, 0.005]}                 // стекло чуть ближе к камере
        rotation={[
          THREE.MathUtils.degToRad(-7),          // X: наклон назад
          THREE.MathUtils.degToRad(9),           // Y: небольшой поворот
          0
        ]}
      >
        <primitive object={scene} />
      </group>
    )
  }


  return (
    <section
      id="contact"
      className="relative text-white min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden"
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
    >
       <div className="contact-canvas relative z-20 rounded-3xl overflow-hidden">
          <div className="relative w-full h-full">
            <Canvas
              gl={{ alpha: true }}
              camera={{ position: [0, 0, 2.5], fov: 50 }}
              className="absolute inset-0 z-0 pointer-events-none"
            >
              <Suspense fallback={null}>
                <BlenderGlass />
                <Environment preset="city" />
                {videoTexture && <VideoPlane texture={videoTexture} mouse={mouse} />}
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

// 🎥 Ripple Plane
function VideoPlane({ texture, mouse }) {
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform vec2 uMouse;
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        // Расстояние до курсора
        float dist = distance(uv, uMouse);

        // ----------------------
        // RIPPLE эффект
        uv += 0.02 * sin(10.0 * dist - uTime * 3.0) * normalize(uv - uMouse);

        // ----------------------
        // ЛИНЗА: преломление ближе к центру
        float lensRadius = 0.2;
        float lensPower = 0.1;
        if (dist < lensRadius) {
          float strength = (lensRadius - dist) / lensRadius;
          uv += (uv - uMouse) * strength * lensPower;
        }

        // ----------------------
        // Основной цвет
        vec4 color = texture2D(uTexture, uv);

        // ----------------------
        // VIGNETTE: мягкое затухание по краям
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
    <mesh position={[0, 0, -0.006]}>
      <planeGeometry args={[3.2, 2.4]} />
      <shaderMaterial args={[shaderArgs]} transparent depthWrite={false}/>
    </mesh>
  )
}