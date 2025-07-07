import { useEffect } from 'react'

export default function BackgroundEffect() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    Object.assign(canvas.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: '-1',
      pointerEvents: 'none',
    })
    document.body.appendChild(canvas)

    const gl = canvas.getContext('webgl')
    if (!gl) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

    const vertexShaderSource = `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `

    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float ripple(vec2 uv, float t) {
        uv = uv * 2.0 - 1.0;
        float len = length(uv);
        return 0.5 + 0.5 * cos(10.0 * len - t * 5.0) / (1.0 + 10.0 * len);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float color = ripple(uv, u_time);
        gl_FragColor = vec4(vec3(color * 0.8, color * 0.5, color), 1.0);
      }
    `

    const compile = (type, source) => {
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const resLoc = gl.getUniformLocation(program, 'u_resolution')

    let start = performance.now()

    const render = () => {
      const now = (performance.now() - start) / 1000
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

  return null
}
