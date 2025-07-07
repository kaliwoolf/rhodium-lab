import { useEffect } from 'react'

export default function BackgroundEffect() {
  useEffect(() => {
    const canvas = document.createElement('canvas')
    Object.assign(canvas.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: '0',
      pointerEvents: 'none',
    })
    const container = document.getElementById('__next')
    container.style.position = 'relative'
    container.prepend(canvas)

    const gl = canvas.getContext('webgl')
    if (!gl) {
      console.error('WebGL not supported')
      return
    }

    const vsSource = `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `

    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;

      float circle(vec2 uv, vec2 pos, float r) {
        return smoothstep(r, r - 0.01, length(uv - pos));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv -= 0.5;
        uv.x *= u_resolution.x / u_resolution.y;

        float d = sin(u_time + length(uv) * 10.0) * 0.5 + 0.5;
        float glow = 0.02 / length(uv + 0.05*sin(u_time*0.7));
        float crystal = step(0.98, fract(sin(dot(uv * 40.0, vec2(12.9898,78.233))) * 43758.5453));
        vec3 color = mix(vec3(0.2, 0.4, 0.6), vec3(1.0, 0.9, 0.8), d);
        color += glow * 0.2;
        color += crystal * 0.1;
        gl_FragColor = vec4(color, 1.0);
      }
    `

    const compile = (type, source) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        return null
      }
      return shader
    }

    const vs = compile(gl.VERTEX_SHADER, vsSource)
    const fs = compile(gl.FRAGMENT_SHADER, fsSource)

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const positionLoc = gl.getAttribLocation(program, 'a_position')
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'u_time')
    const uResolution = gl.getUniformLocation(program, 'u_resolution')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    window.addEventListener('resize', resize)
    resize()

    let start = performance.now()
    const render = () => {
      const now = (performance.now() - start) / 1000
      gl.uniform1f(uTime, now)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      container.removeChild(canvas)
    }
  }, [])

  return null
}
