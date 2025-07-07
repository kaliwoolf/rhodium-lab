'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.id = 'bg-effect'
    Object.assign(canvas.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      pointerEvents: 'none',
    })
    document.body.appendChild(canvas)

    const gl = canvas.getContext('webgl')
    if (!gl) {
      console.error('WebGL not supported')
      return
    }

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 pos = uv * 5.0;
        float n = noise(pos + vec2(u_time * 0.05, u_time * 0.03));
        vec3 color = vec3(0.05, 0.2, 0.4) + n * 0.25;
        gl_FragColor = vec4(color, 1.0);
      }
    `

    function compile(type, source) {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader))
        return null
      }
      return shader
    }

    const vs = compile(gl.VERTEX_SHADER, vertexShaderSource)
    const fs = compile(gl.FRAGMENT_SHADER, fragmentShaderSource)

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const positionLoc = gl.getAttribLocation(program, 'a_position')
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const resLoc = gl.getUniformLocation(program, 'u_resolution')

    let start = performance.now()

    const render = () => {
      const now = (performance.now() - start) * 0.001
      gl.uniform1f(timeLoc, now)
      gl.uniform2f(resLoc, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      requestAnimationFrame(render)
    }

    render()

    return () => {
      document.body.removeChild(canvas)
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-white font-sans">
      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-widest">
        RHODIUM LAB
      </h1>
      <div className="px-6 py-2 rounded-full border border-crimson text-sm md:text-base tracking-wider flex items-center gap-4 shadow-neon">
        <span>WORK</span>
        <div className="w-6 h-px bg-crimson"></div>
        <span>CONTACT</span>
      </div>
    </main>
  )
}
