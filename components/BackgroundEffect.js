import { useRef, useEffect } from 'react'

export default function BackgroundEffect() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl')

    if (!gl) return

    const vertexShaderSource = \`
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    \`

    const fragmentShaderSource = \`
      precision highp float;
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

          return mix(a, b, u.x) +
                 (c - a)* u.y * (1.0 - u.x) +
                 (d - b) * u.x * u.y;
      }

      float fbm(vec2 st) {
          float value = 0.0;
          float amplitude = .5;
          for (int i = 0; i < 5; i++) {
              value += amplitude * noise(st);
              st *= 2.;
              amplitude *= 0.5;
          }
          return value;
      }

      void main() {
          vec2 st = gl_FragCoord.xy / u_resolution.xy * 3.0;
          float t = u_time * 0.03;
          float v = fbm(st + t);

          vec3 color = vec3(v * 0.3, v * 0.2, v * 0.4); // фиолетовый туман
          gl_FragColor = vec4(color, 0.25);
      }
    \`

    function compileShader(type, source) {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource)

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]), gl.STATIC_DRAW)

    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    const timeUniformLocation = gl.getUniformLocation(program, 'u_time')
    const resUniformLocation = gl.getUniformLocation(program, 'u_resolution')

    let start = Date.now()
    const render = () => {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(timeUniformLocation, (Date.now() - start) / 1000)
      gl.uniform2f(resUniformLocation, gl.canvas.width, gl.canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      requestAnimationFrame(render)
    }
    render()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )
}