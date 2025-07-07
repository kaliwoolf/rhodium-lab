import { useEffect } from 'react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <canvas
        id="test-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      ></canvas>

      <h1 className="text-4xl font-bold text-white z-10">RHODIUM LAB</h1>
    </main>
  )
}

useEffect(() => {
  const canvas = document.getElementById('test-canvas')
  const gl = canvas.getContext('webgl')
  if (!gl) {
    console.error('No WebGL!')
    return
  }

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clearColor(1.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  console.log('RED OK')
}, [])
