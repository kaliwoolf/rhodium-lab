export class Renderer {
  #vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main() {
  gl_Position = position;
}`
  #vertices = [-1, 1, -1, -1, 1, 1, 1, -1]

  constructor(canvas, scale) {
    this.canvas = canvas
    this.scale = scale
    this.gl = canvas.getContext('webgl2')
    this.shaderSource = ''
    this.mouseMove = [0, 0]
    this.mouseCoords = [0, 0]
    this.pointerCoords = [0, 0]
    this.nbrOfPointers = 0
  }

  updateShader(source) {
    this.shaderSource = source
    this.reset()
    this.setup()
    this.init()
  }

  updateScale(scale) {
    this.scale = scale
    this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale)
  }

  updateMove(delta) {
    this.mouseMove = delta
  }

  updateMouse(coords) {
    this.mouseCoords = coords
  }

  updatePointerCoords(coords) {
    this.pointerCoords = coords
  }

  updatePointerCount(count) {
    this.nbrOfPointers = count
  }

  reset() {
    const gl = this.gl
    if (this.program) gl.deleteProgram(this.program)
  }

  setup() {
    const gl = this.gl
    this.vs = gl.createShader(gl.VERTEX_SHADER)
    this.fs = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(this.vs, this.#vertexSrc)
    gl.shaderSource(this.fs, this.shaderSource)
    gl.compileShader(this.vs)
    gl.compileShader(this.fs)

    this.program = gl.createProgram()
    gl.attachShader(this.program, this.vs)
    gl.attachShader(this.program, this.fs)
    gl.linkProgram(this.program)

    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#vertices), gl.STATIC_DRAW)
  }

  init() {
    const gl = this.gl
    const program = this.program
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    program.resolution = gl.getUniformLocation(program, 'resolution')
    program.time = gl.getUniformLocation(program, 'time')
    program.move = gl.getUniformLocation(program, 'move')
    program.touch = gl.getUniformLocation(program, 'touch')
    program.pointerCount = gl.getUniformLocation(program, 'pointerCount')
    program.pointers = gl.getUniformLocation(program, 'pointers')
  }

  render(now = 0) {
    const gl = this.gl
    const program = this.program

    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.uniform2f(program.resolution, this.canvas.width, this.canvas.height)
    gl.uniform1f(program.time, now * 0.001)
    gl.uniform2f(program.move, ...this.mouseMove)
    gl.uniform2f(program.touch, ...this.mouseCoords)
    gl.uniform1i(program.pointerCount, this.nbrOfPointers)
    gl.uniform2fv(program.pointers, this.pointerCoords)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}
