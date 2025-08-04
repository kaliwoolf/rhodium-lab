import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { ShaderMaterial, Mesh, PlaneGeometry } from 'three';

const vertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

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
`;

export default function GlassLensShader({ mouse, texture }) {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame(({ pointer }) => {
    const x = pointer.x * 0.5 + 0.5;
    const y = -pointer.y * 0.5 + 0.5;
    mouse.current.set(x, y);

    if (texture?.image) {
      console.log('Video time:', texture.image.currentTime);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
