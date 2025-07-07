'use client'

import { useEffect, useRef } from 'react'
import { Renderer } from '../lib/renderer'
import { PointerHandler } from '../lib/pointerHandler'

export default function Anomaly() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const canvas = canvasRef.current
    if (!canvas) return

    let frameId
    let resolution = 0.5
    let dpr = Math.max(1, resolution * window.devicePixelRatio)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      renderer?.updateScale(dpr)
    }

    const loop = (now) => {
      renderer.updateMouse(pointers.first)
      renderer.updatePointerCount(pointers.count)
      renderer.updatePointerCoords(pointers.coords)
      renderer.updateMove(pointers.move)
      renderer.render(now)
      frameId = requestAnimationFrame(loop)
    }

    let renderer, pointers

    fetch('/shaders/anomaly.glsl')
      .then(res => res.text())
      .then(shader => {
        renderer = new Renderer(canvas, dpr)
        pointers = new PointerHandler(canvas, dpr)
        renderer.updateShader(shader)

        resize()
        loop(0)
        window.addEventListener('resize', resize)
      })

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-[-50]" />
}
