'use client'

import { useEffect, useRef } from 'react'

export default function Anomaly() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let resolution = 0.5
    let dpr = Math.max(1, resolution * window.devicePixelRatio)
    let renderer, pointers, frameId

    const canvas = canvasRef.current
    if (!canvas) return

    class Renderer { /* твой Renderer как есть */ }
    class PointerHandler { /* как есть */ }

    const loadShader = async () => {
      const res = await fetch('/shaders/anomaly.glsl')
      return await res.text()
    }

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      if (renderer) renderer.updateScale(dpr)
    }

    const loop = (now) => {
      renderer.updateMouse(pointers.first)
      renderer.updatePointerCount(pointers.count)
      renderer.updatePointerCoords(pointers.coords)
      renderer.updateMove(pointers.move)
      renderer.render(now)
      frameId = requestAnimationFrame(loop)
    }

    loadShader().then((shader) => {
      renderer = new Renderer(canvas, dpr)
      pointers = new PointerHandler(canvas, dpr)

      renderer.shaderSource = shader
      renderer.setup()
      renderer.init()
      renderer.updateShader(shader)

      resize()
      window.addEventListener('resize', resize)
      loop(0)
    })

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0"
    />
  )
}
