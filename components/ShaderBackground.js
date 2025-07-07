import { useEffect } from 'react'

export default function ShaderBackground() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.id = 'shader-bg'
    Object.assign(canvas.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -20,
      pointerEvents: 'none'
    })
    document.body.appendChild(canvas)

    const gl = canvas.getContext('webgl2')
    if (!gl) return console.error('WebGL2 not supported')

    const vertexSrc = `#version 300 es
    precision highp float;
    in vec4 position;
    void main() {
      gl_Position = position;
    }`

    const fragmentSrc = `#version 300 es
    precision highp float;
    out vec4 O;
    uniform float time;
    uniform vec2 resolution;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      vec2 pos = uv * 2.0 - 1.0;

      float len = length(pos);
      float glow = 0.1 / len;

      vec3 color = vec3(
        0.05 + 0.1 * sin(time + len * 10.0),
        0.2 + 0.2 * cos(time + len * 5.0),
        0.4 + 0.1 * sin(time + len * 2.0)
      );

      O = vec4(color * glow, 1.0);
    }`

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

    const vs = compile(gl.VERTEX_SHADER, vertexSrc)
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSrc)

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(program, 'time')
    const resolutionLoc = gl.getUniformLocation(program, 'resolution')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    }
    resize()
    window.addEventListener('resize', resize)

    let start = performance.now()
    const render = () => {
      const now = (performance.now() - start) / 1000
      gl.uniform1f(timeLoc, now)
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      document.body.removeChild(canvas)
    }
  }, [])

  return null
}
