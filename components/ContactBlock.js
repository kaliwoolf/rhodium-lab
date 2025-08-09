'use client'

import { useState, useEffect, useRef, Suspense, useMemo } from 'react'
import Image from 'next/image'
import { useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { VideoTexture } from 'three'

useGLTF.preload('/models/ContactFrame.glb')

function useBreakpoint() {
  const [bp, setBp] = useState('desktop')
  useEffect(() => {
    const m1 = matchMedia('(max-width: 640px)')
    const m2 = matchMedia('(max-width: 1024px)')
    const upd = () => setBp(m1.matches ? 'mobile' : (m2.matches ? 'tablet' : 'desktop'))
    upd()
    m1.addEventListener('change', upd)
    m2.addEventListener('change', upd)
    return () => { m1.removeEventListener('change', upd); m2.removeEventListener('change', upd) }
  }, [])
  return bp
}

export default function ContactBlock() {
  const bp = useBreakpoint()

  const cameraProps = useMemo(() => {
    if (bp === 'mobile') return { position: [0, 0, 1.7], fov: 45 }
    if (bp === 'tablet') return { position: [0, 0, 2.1], fov: 48 }
    return { position: [0, 0, 2.5], fov: 50 }
  }, [bp])

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
    return () => video.removeEventListener('canplay', handleCanPlay)
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
          <Canvas key={bp} gl={{ alpha: true }} camera={cameraProps}>
            <Suspense fallback={null}>
              <PanelWithVideo
                texture={videoTexture}
                mouse={mouse}
                viewportFit={bp === 'mobile'
                  ? { mode: 'height', frac: 0.88 }
                  : bp === 'tablet'
                    ? { mode: 'height', frac: 0.78 }
                    : { mode: 'height', frac: 0.70 }}
              />
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

function PanelWithVideo({ texture, mouse, viewportFit }) {
  const { nodes } = useGLTF('/models/ContactFrame.glb')
  const groupRef = useRef()
  const geoShift = useRef(new THREE.Vector3())
  const geoSize = useRef(new THREE.Vector3())
  const { camera, size } = useThree()

  // стеклянный материал рамки
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

    const applyScale = () => {
      const vh = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360)
      const vw = vh * (size.width / size.height)
      const target = viewportFit?.mode === 'width' ? viewportFit.frac * vw : viewportFit.frac * vh
      const s = target / geoSize.current.y
      groupRef.current.scale.setScalar(s)
    }

    applyScale()
    const ro = new ResizeObserver(applyScale)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [nodes, camera, size, viewportFit])

  if (!nodes?.Frame) return null

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0.005]}
      rotation={[0, THREE.MathUtils.degToRad(3), 0]}
    >
      {texture && (
        <TriplanarVideoMesh
          geometry={nodes.Frame.geometry}
          position={[-geoShift.current.x, -geoShift.current.y, -0.0015]}
          texture={texture}
          mouse={mouse}
          texScale={[1.0, 1.0]}
          blendSharpness={4.0}
          objCenter={[geoShift.current.x, geoShift.current.y, geoShift.current.z || 0]}
          objSize={[geoSize.current.x, geoSize.current.y, geoSize.current.z || 1]}
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

/** Трипланарная проекция видео + ripple/линза (экранные UV) */
function TriplanarVideoMesh({
  geometry, position = [0, 0, 0], texture, mouse,
  texScale = [1, 1], blendSharpness = 4.0,
  objCenter = [0, 0, 0], objSize = [1, 1, 1]
}) {
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTexScale: { value: new THREE.Vector2(texScale[0], texScale[1]) },
      uBlendSharpness: { value: blendSharpness },
      uCenter: { value: new THREE.Vector3(...objCenter) },
      uSize: { value: new THREE.Vector3(...objSize) }
    },
    // без кириллицы внутри GLSL-строк
    vertexShader: `
      varying vec3 vObjPos;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      varying vec4 vClip;
      void main(){
        vObjPos = position;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vWorldNormal = normalize(normalMatrix * normal);
        vClip = projectionMatrix * viewMatrix * worldPos;
        gl_Position = vClip;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform vec2  uMouse;
      uniform float uTime;
      uniform vec2  uTexScale;
      uniform float uBlendSharpness;
      uniform vec3  uCenter;
      uniform vec3  uSize;

      varying vec3 vObjPos;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      varying vec4 vClip;

      vec4 sampleTriplanar(vec3 pObj, vec3 nWorld, vec2 ripple){
        vec3 p = (pObj - uCenter) / uSize + 0.5;
        vec3 n = normalize(abs(nWorld));
        n = pow(n, vec3(uBlendSharpness));
        n /= (n.x + n.y + n.z + 1e-5);

        vec2 uvX = p.zy * uTexScale + ripple;
        vec2 uvY = p.xz * uTexScale + ripple;
        vec2 uvZ = p.xy * uTexScale + ripple;

        vec4 cx = texture2D(uTexture, uvX);
        vec4 cy = texture2D(uTexture, uvY);
        vec4 cz = texture2D(uTexture, uvZ);
        return cx*n.x + cy*n.y + cz*n.z;
      }

      void main(){
        vec2 uvS = vClip.xy / vClip.w * 0.5 + 0.5;

        float dist = distance(uvS, uMouse);
        vec2 dir = normalize(uvS - uMouse + 1e-6);
        vec2 ripple = 0.02 * sin(10.0 * dist - uTime * 3.0) * dir;

        float lensRadius = 0.2;
        float lensPower = 0.1;
        if (dist < lensRadius){
          float k = (lensRadius - dist) / lensRadius;
          ripple += (uvS - uMouse) * k * lensPower;
        }

        vec4 color = sampleTriplanar(vObjPos, vWorldNormal, ripple);

        float vig = smoothstep(0.4, 0.9, distance(uvS, vec2(0.5)));
        color.rgb *= (1.0 - vig);

        color.a = 0.5;
        gl_FragColor = color;
      }
    `
  }), [texture, texScale, blendSharpness, objCenter, objSize])

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
