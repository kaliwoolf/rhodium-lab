// components/Saturn.js
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Saturn() {
  const containerRef = useRef()

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 8

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    const light = new THREE.PointLight(0xffffff, 1.2)
    light.position.set(5, 5, 5)
    scene.add(light)

    const textureLoader = new THREE.TextureLoader()
    const saturnTexture = textureLoader.load('/textures/2k_saturn.jpg')
    const ringTexture = textureLoader.load('/textures/2k_saturn_ring_alpha.png')

    const geometry = new THREE.SphereGeometry(2, 64, 64)
    const material = new THREE.MeshStandardMaterial({ map: saturnTexture })
    const saturn = new THREE.Mesh(geometry, material)
    scene.add(saturn)

    const ringGeometry = new THREE.RingGeometry(2.5, 4.2, 64)
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: ringTexture,
      transparent: true,
      side: THREE.DoubleSide,
    })
    const rings = new THREE.Mesh(ringGeometry, ringMaterial)
    rings.rotation.x = Math.PI / 2
    scene.add(rings)

    // Группа для синхронного вращения
    const group = new THREE.Group()
    group.add(saturn)
    group.add(rings)
    scene.add(group)

    const animate = () => {
      requestAnimationFrame(animate)
      group.rotation.y += 0.0008 // Очень медленно
      renderer.render(scene, camera)
    }

    animate()

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })

    return () => {
      containerRef.current.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />
}
