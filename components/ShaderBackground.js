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

    float random(vec2 p) {
      return fract(sin(dot(p ,vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p){
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec2 p = uv * 10.0;

      float starField = pow(noise(p + time * 0.5), 20.0);
      float swirl = 0.5 + 0.5 * sin(length(uv - 0.5) * 20.0 - time);

      vec3 baseColor = vec3(
        0.15 + 0.1 * sin(time + uv.x * 3.0),
        0.2 + 0.1 * sin(time + uv.y * 4.0),
        0.25 + 0.1 * sin(time * 1.3)
      );

      vec3 finalColor = baseColor + vec3(starField) + swirl * 0.05;

      O = vec4(finalColor, 1.0);
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
