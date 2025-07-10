import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, BackSide, AdditiveBlending } from 'three'
import * as THREE from 'three'


export default function GlassSaturn({ mouse, scrollRef }) {
  const ref = useRef()
  const ringRef = useRef()
  const wrapperRef = useRef()
  const [scale, setScale] = useState(null)


  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const newScale = isMobile ? [1.3, 1.3, 1.3] : [2.4, 2.4, 2.4]
    setScale(newScale)
  }, [])

  useEffect(() => {
    if (ref.current) ref.current.layers.set(1)
    if (ringRef.current) ringRef.current.layers.set(1)
  }, [])

  useFrame(({ clock, mouse: m }) => {
    const t = clock.getElapsedTime()
    const scroll = scrollRef?.current || 0

    const fade = Math.max(1 - scroll * 1.0, 0)

    if (ref.current) {
    ref.current.rotation.y = t * 0.15 + scroll * 2.0
    }

    wrapperRef.current.traverse((child) => {
      if (child.material) {
        const mat = child.material

        // Пропускаем физическое стекло
        const isPhysicalGlass = mat.transmission !== undefined

        if (!isPhysicalGlass) {
          mat.transparent = true
          if ('opacity' in mat) {
            mat.opacity = fade
          }
        }
      }
    })


    if (ringRef.current) {
          ringRef.current.rotation.z = t * 0.02
    }

  })

  useFrame(({ camera }) => {
    camera.lookAt(0, 0, 0)
  })

  return scale && (
      <group ref={wrapperRef} scale={scale} rotation={[0.46, 0, 0.46]}>
        {/* 🌈 Цветовая контровая подсветка */}
        <spotLight
          position={[-3, 2, 2]}
          intensity={1.2}
          angle={0.5}
          penumbra={0.8}
          color="#99ffff"
        />
        <spotLight
          position={[3, 2, 2]}
          intensity={1.2}
          angle={0.5}
          penumbra={0.8}
          color="#cc88ff"
        />

        {/* 🪐 Стеклянные кольца */}
        <group ref={ringRef} position={[0, 0, 0]} rotation={[Math.PI / 2.2, 0, 0]}>

              <directionalLight
                position={[-1.5, -1, 1.5]}
                intensity={10}
                color="#d300ff"
              />

              <mesh>
                <torusGeometry args={[0.95, 0.04, 256, 1024]} />
                <meshPhysicalMaterial
                  transmission={1}
                  thickness={0.5}
                  roughness={0.25}
                  ior={1.45}
                  clearcoat={1}
                  clearcoatRoughness={0.15}
                  iridescence={1}
                  iridescenceIOR={1.3}
                  iridescenceThicknessRange={[200, 600]}
                  attenuationColor="#b083d9"
                  attenuationDistance={0.5}
                  metalness={0}
                  envMapIntensity={0.6}
                  transparent
                  toneMapped={false}
                  side={DoubleSide}
                />
              </mesh>

        </group>

        <mesh position={[-0.3, -0.7, 0]} rotation={[0.3, 0, 0]} renderOrder={5}>
            <planeGeometry args={[2.6, 2.6]} />
            <shaderMaterial
              transparent
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
              blending={THREE.NormalBlending}
              side={THREE.DoubleSide}
               vertexShader={`
                  varying vec2 vUv;
                  void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  }
                `}
                fragmentShader={`
                  varying vec2 vUv;

                  float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                  }

                  void main() {
                    vec2 center = vec2(0.4, 0.8);
                    float d = distance(vUv, center);
                    float mask = 1.0 - smoothstep(0.05, 0.3, d);

                    float grain = random(vUv * 50.0);
                    float alpha = min(mask * 1.5, 1.0) * mix(0.9, 1.0, grain);

                    gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
                  }
                `}
              />
          </mesh>

          {/* 🔮 Внешняя стеклянная сфера */}
          <mesh ref={ref} renderOrder={1}>
            <sphereGeometry args={[0.52, 128, 128]} />
            <meshPhysicalMaterial
              transmission={1}
              thickness={1.2}
              roughness={0}
              ior={1.52}
              reflectivity={0.02}
              clearcoat={1}
              clearcoatRoughness={0}
              metalness={0}
              envMapIntensity={0.2}
              iridescence={1}
              iridescenceIOR={1.25}
              iridescenceThicknessRange={[150, 400]}
              attenuationColor="#ffffff"
              attenuationDistance={0.3}
              transparent
              toneMapped={false}
            />
          </mesh>

          <mesh scale={[1.01, 1.01, 1.01]} renderOrder={3}>
            <sphereGeometry args={[0.52, 128, 128]} />
            <shaderMaterial
              transparent
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
              vertexShader={`
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                  vNormal = normalize(normalMatrix * normal);
                  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                  vViewPosition = -mvPosition.xyz;
                  gl_Position = projectionMatrix * mvPosition;
                }
              `}
              fragmentShader={`
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                  float fresnel = pow(1.0 - dot(normalize(vViewPosition), vNormal), 2.2);
                  float topMask = smoothstep(0.0, 0.15, vNormal.y); // только верхняя часть
                  vec3 color = vec3(1.0, 0.8, 0.5); // тёплый золотистый
                  gl_FragColor = vec4(color, fresnel * topMask * 0.8);
                }
              `}
            />
          </mesh>

          {/* ✨ Контурное аквамариново-аметистовое свечение (Fresnel Shader) */}
          <mesh scale={[1.02, 1.02, 1.02]} renderOrder={2}>
            <sphereGeometry args={[0.52, 128, 128]} />
            <shaderMaterial
              vertexShader={`
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                  vNormal = normalize(normalMatrix * normal);
                  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                  vViewPosition = -mvPosition.xyz;
                  gl_Position = projectionMatrix * mvPosition;
                }
              `}
              fragmentShader={`
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                  float fresnel = pow(1.0 - dot(normalize(vViewPosition), vNormal), 2.5);
                  vec3 color = mix(vec3(0.0), vec3(0.7, 1.0, 1.0), fresnel); // Аквамариново-аметистовый
                  gl_FragColor = vec4(color, fresnel * 0.6); // Мягкое свечение
                }
              `}
              transparent={true}
              depthWrite={false}
              depthTest={false}
              blending={AdditiveBlending}
            />
          </mesh>

          {/* 🌑 Внутренняя чёрная маска — в конце, позади колец */}
          <mesh scale={[0.985, 0.985, 0.985]} renderOrder={-1}>
              <sphereGeometry args={[0.52, 128, 128]} />
              <meshBasicMaterial
                color="black"
                side={BackSide}
                depthWrite={true}
                depthTest={true}
                toneMapped={false}
              />
            </mesh>
  </group>  
)

}
