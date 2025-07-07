import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function Saturn() {
  const containerRef = useRef()

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 8

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    const pointLight = new THREE.PointLight(0xffffff, 1.4)
    pointLight.position.set(5, 5, 5)
    scene.add(ambientLight, pointLight)

    const textureLoader = new THREE.TextureLoader()
    const saturnTexture = textureLoader.load('/textures/2k_saturn.jpg')
    const ringTexture = textureLoader.load('/textures/2k_saturn_ring_alpha.png')

    const saturnGeometry = new THREE.SphereGeometry(2, 64, 64)
    const saturnMaterial = new THREE.MeshStandardMaterial({
      map: saturnTexture,
      metalness: 0.4,
      roughness: 0.5,
    })
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial)

    const ringGeometry = new THREE.RingGeometry(2.5, 4.2, 128)
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: ringTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const rings = new THREE.Mesh(ringGeometry, ringMaterial)
    rings.rotation.x = Math.PI / 2
    rings.rotation.z = Math.PI / 4

    const group = new THREE.Group()
    group.add(saturn)
    group.add(rings)
    scene.add(group)

    const animate = () => {
      requestAnimationFrame(animate)
      group.rotation.y += 0.0005
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      containerRef.current.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 z-12 pointer-events-none" />
}