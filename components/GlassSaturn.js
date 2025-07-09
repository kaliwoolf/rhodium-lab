import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, BackSide, AdditiveBlending } from 'three'

export default function GlassSaturn({ mouse }) {
  const ref = useRef()
  const ringRef = useRef()

  const [scale, setScale] = useState([2.2, 2.2, 2.2])
  const [position, setPosition] = useState([1.2, 1.2, -3])

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    setScale(isMobile ? [1.3, 1.3, 1.3] : [2.2, 2.2, 2.2])
    setPosition(isMobile ? [0.5, 0.8, -3] : [1.2, 1.2, -3])
  }, [])

  useEffect(() => {
    if (ref.current) ref.current.layers.set(1)
    if (ringRef.current) ringRef.current.layers.set(1)
  }, [])

  useFrame(({ clock, mouse: m }) => {
    const t = clock.getElapsedTime()
    if (ref.current && ringRef.current) {
      mouse.current.x += (m.x - mouse.current.x) * 0.05
      mouse.current.y += (m.y - mouse.current.y) * 0.05

      const tilt = 0.15
      ref.current.rotation.x = mouse.current.y * tilt
      ref.current.rotation.y = mouse.current.x * tilt

      ringRef.current.rotation.z = t * 0.02
    }
  })

  return (
  <>
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


    <group position={position} scale={scale} rotation={[0.46, 0, 0.46]}>
      {/* 🪐 Стеклянные кольца */}
      <group ref={ringRef} position={[0, 0.1, 0]} rotation={[Math.PI / 2.2, 0, 0]}>

        <ambientLight intensity={0.4} color="#ffffff" />
        <directionalLight position={[2, 0, 2]} intensity={0.5} />
        <directionalLight position={[-2, 0, -2]} intensity={0.5} />

        <mesh>
          <torusGeometry args={[0.95, 0.04, 64, 256]} />
          <meshPhysicalMaterial
            transmission={1}
            thickness={0.5}
            roughness={0}
            ior={1.45}
            clearcoat={1}
            clearcoatRoughness={0}
            iridescence={1}
            iridescenceIOR={1.3}
            iridescenceThicknessRange={[200, 600]}
            attenuationColor="#ffffff"
            attenuationDistance={0.5}
            metalness={0}
            envMapIntensity={0.6}
            transparent
            toneMapped={false}
            side={DoubleSide}
          />
        </mesh>

        <mesh position={[-0.3, -0.15, 0.01]} rotation={[Math.PI / 2.2, 0, 0]} renderOrder={3}>
          <circleGeometry args={[0.9, 64]} />
          <meshBasicMaterial
            color="black"
            transparent
            opacity={0.8}
            side={DoubleSide}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </mesh>

      </group>

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
  </>
)

}
