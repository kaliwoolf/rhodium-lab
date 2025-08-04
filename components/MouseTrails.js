'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

export default function MouseTrails() {
  const { gl, scene, camera } = useThree()
  const trails = useRef([])

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#ffffff') },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;

      void main() {
        float alpha = 1.0 - length(vUv - 0.5) * 2.0;
        vec3 rainbow = vec3(
          0.5 + 0.5 * sin(uTime + vUv.x * 10.0),
          0.5 + 0.5 * sin(uTime + vUv.x * 10.0 + 2.0),
          0.5 + 0.5 * sin(uTime + vUv.x * 10.0 + 4.0)
        );
        gl_FragColor = vec4(rainbow, alpha * 0.3);
      }
    `
  })

  const geometry = new THREE.CircleGeometry(0.05, 32) // ← увеличено

  useEffect(() => {
    const handleMove = (e) => {
      const { width, height, left, top } = gl.domElement.getBoundingClientRect()
      const x = ((e.clientX - left) / width) * 2 - 1
      const y = -((e.clientY - top) / height) * 2 + 1

      const vector = new THREE.Vector3(x, y, 0.5).unproject(camera)
      const dir = vector.sub(camera.position).normalize()
      const distance = -camera.position.z / dir.z
      const pos = camera.position.clone().add(dir.multiplyScalar(distance))

      const mesh = new THREE.Mesh(geometry, material.clone())
      mesh.position.copy(pos)
      mesh.material.opacity = 0.35
      mesh.scale.setScalar(1.2)
      trails.current.push(mesh)
      scene.add(mesh)
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [gl, scene, camera])

  useFrame(() => {
    trails.current.forEach((trail, i) => {
      trail.material.opacity *= 0.93
      material.uniforms.uTime.value += 0.05;
      trail.scale.multiplyScalar(0.97)
      if (trail.material.opacity < 0.01) {
        scene.remove(trail)
        trails.current.splice(i, 1)
      }
    })
  })

  return null
}
