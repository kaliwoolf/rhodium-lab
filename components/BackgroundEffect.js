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
      background: 'transparent',
    })
    document.body.appendChild(canvas)

    const gl = canvas.getContext('webgl')
    if (!gl) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

    const vertexShaderSource = \`
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    \`

    const fragmentShaderSource = \`
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float r = 0.0;
        for (float i = 1.0; i < 10.0; i++) {
          r += (0.5 / i) * random(st * i + u_time);
        }
        gl_FragColor = vec4(vec3(r), 1.0);
      }
    \`

    const compileShader = (type, source) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        return null
      }
      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1
      ]),
      gl.STATIC_DRAW
    )
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'u_time')
    const uResolution = gl.getUniformLocation(program, 'u_resolution')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    }
    window.addEventListener('resize', resize)
    resize()

    let start = performance.now()
    const loop = () => {
      const time = (performance.now() - start) / 1000
      gl.uniform1f(uTime, time)
      gl.uniform2f(uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      requestAnimationFrame(loop)
    }
    loop()

    return () => {
      window.removeEventListener('resize', resize)
      document.body.removeChild(canvas)
    }
  }, [])

  return null
}
