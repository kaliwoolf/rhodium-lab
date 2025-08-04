import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'

const vertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = `
  uniform sampler2D uTexture;
  uniform vec2 mouse;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 dist = uv - mouse;
    float len = length(dist);
    uv += dist * 0.1 * exp(-len * 20.0); // эффект искажения
    vec3 color = texture(uTexture, uv).rgb;
    gl_FragColor = vec4(color, 1.0);
  }
`

export default function GlassLensShader({ mouse, texture }) {
  const materialRef = useRef()

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.mouse.value.copy(mouse.current)
    }
    if (texture) {
      texture.needsUpdate = true
    }
  })

  return (
    <mesh position={[0, 0, 0]}>
      {/* Размер зададим через пропсы снаружи или по вьюпорту */}
      <planeGeometry args={[6, 6]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTexture: { value: texture },
          mouse: { value: mouse.current },
        }}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        toneMapped={false}
      />
    </mesh>
  )
}
