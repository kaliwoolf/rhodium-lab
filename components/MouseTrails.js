'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

export default function MouseTrails() {
  const { gl, scene } = useThree()
  const trails = useRef([])

  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ffffff'),
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
  })

  const geometry = new THREE.CircleGeometry(0.015, 32)

  useEffect(() => {
    const handleMove = (e) => {
      const { width, height, left, top } = gl.domElement.getBoundingClientRect()
      const x = ((e.clientX - left) / width) * 2 - 1
      const y = -((e.clientY - top) / height) * 2 + 1

      const vector = new THREE.Vector3(x, y, 0.5).unproject(gl.camera)
      const dir = vector.sub(gl.camera.position).normalize()
      const distance = -gl.camera.position.z / dir.z
      const pos = gl.camera.position.clone().add(dir.multiplyScalar(distance))

      const mesh = new THREE.Mesh(geometry, material.clone())
      mesh.position.copy(pos)
      mesh.material.opacity = 0.25
      mesh.scale.setScalar(0.8)
      trails.current.push(mesh)
      scene.add(mesh)
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [gl, scene])

  useFrame(() => {
    trails.current.forEach((trail, i) => {
      trail.material.opacity *= 0.95
      trail.scale.multiplyScalar(0.98)
      if (trail.material.opacity < 0.01) {
        scene.remove(trail)
        trails.current.splice(i, 1)
      }
    })
  })

  return null
}
