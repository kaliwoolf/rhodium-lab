import { useEffect } from 'react';

export default function BackgroundEffect() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.08';
    document.body.appendChild(canvas);

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = \`
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    \`;

    const fragmentShaderSource = \`
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;

      // Simplex noise implementation (2D)
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                            -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        vec3 p0 = vec3(x0.x, x0.y, 0.0);
        vec3 p1 = vec3(x12.x, x12.y, 0.0);
        vec3 p2 = vec3(x12.z, x12.w, 0.0);
        vec3 i_ = mod289(vec3(i.x, i.y, 0.0));
        vec3 p = permute(permute(i_.y + vec3(0.0, i1.y, 1.0))
                       + i_.x + vec3(0.0, i1.x, 1.0));
        vec3 gx = fract(p * (1.0 / 41.0)) * 2.0 - 1.0;
        vec3 gy = abs(gx) - 0.5;
        vec3 tx = floor(gx + 0.5);
        gx -= tx;
        vec3 t = max(0.5 - vec3(dot(p0, p0), dot(p1, p1), dot(p2, p2)), 0.0);
        t = t * t;
        return 70.0 * dot(t * t, vec3(dot(gx, p0.xy), dot(gx.yz, p1.xy), dot(gx.zw, p2.xy)));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv * 4.0;
        float t = u_time * 0.1;
        float n = snoise(p + vec2(t, t * 0.7));
        float alpha = smoothstep(0.4, 0.7, n);
        gl_FragColor = vec4(vec3(n * 0.8 + 0.2), alpha);
      }
    \`;

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };
    window.addEventListener('resize', resize);
    resize();

    let start = performance.now();
    const loop = () => {
      const now = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, now);
      gl.uniform2f(uRes, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      document.body.removeChild(canvas);
    };
  }, []);

  return null;
}