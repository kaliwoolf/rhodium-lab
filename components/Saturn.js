import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Saturn() {
  const containerRef = useRef(null)

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 8

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    const light = new THREE.PointLight(0xffffff, 1.2)
    light.position.set(5, 5, 5)
    scene.add(light)

    const textureLoader = new THREE.TextureLoader()
    const saturnTexture = textureLoader.load('/textures/2k_saturn.jpg')
    const ringTexture = textureLoader.load('/textures/2k_saturn_ring_alpha.png')

    const saturnGeometry = new THREE.SphereGeometry(2, 64, 64)
    const saturnMaterial = new THREE.MeshStandardMaterial({ map: saturnTexture })
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial)

    const ringGeometry = new THREE.RingGeometry(2.5, 4.2, 128)
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: ringTexture,
      transparent: true,
      side: THREE.DoubleSide,
    })
    const rings = new THREE.Mesh(ringGeometry, ringMaterial)
    rings.rotation.x = Math.PI / 2

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

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      containerRef.current.removeChild(renderer.domElement)
      renderer.dispose()
      saturnGeometry.dispose()
      saturnMaterial.dispose()
      ringGeometry.dispose()
      ringMaterial.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  )
}
