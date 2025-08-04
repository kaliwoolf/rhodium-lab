'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

export default function MouseTrails() {
  const { gl, scene, camera } = useThree()
  const trails = useRef([])

  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ffffff'),
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
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
      trail.scale.multiplyScalar(0.97)
      if (trail.material.opacity < 0.01) {
        scene.remove(trail)
        trails.current.splice(i, 1)
      }
    })
  })

  return null
}
