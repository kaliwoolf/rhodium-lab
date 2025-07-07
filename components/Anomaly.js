'use client'

import { useEffect, useRef } from 'react'

// 👇 Копируем сюда все классы: Renderer, PointerHandler, Store, Editor
// (оставим Editor заглушкой, если UI не нужен)

export default function Anomaly() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const canvas = canvasRef.current
    if (!canvas) return

    let resolution = 0.5
    let renderDelay = 1000
    let dpr = Math.max(1, resolution * window.devicePixelRatio)
    let frm, source, renderer, pointers
    const shaderId = 'oggKrGW'

    class Renderer  {
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

    class PointerHandler {
    constructor(canvas, scale) {
      this.scale = scale
      this.pointers = new Map()
      this.moves = [0, 0]
      this.lastCoords = [0, 0]

      const map = (e) => [e.clientX * scale, canvas.height - e.clientY * scale]

      canvas.addEventListener('pointerdown', (e) => {
        this.pointers.set(e.pointerId, map(e))
      })

      canvas.addEventListener('pointerup', (e) => {
        if (this.count === 1) this.lastCoords = this.first
        this.pointers.delete(e.pointerId)
      })

      canvas.addEventListener('pointermove', (e) => {
        if (this.pointers.size === 0) return
        this.lastCoords = [e.clientX, e.clientY]
        this.pointers.set(e.pointerId, map(e))
        this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY]
      })

      canvas.addEventListener('pointerleave', (e) => {
        this.pointers.delete(e.pointerId)
      })
    }

    get count() {
      return this.pointers.size
    }

    get move() {
      return this.moves
    }

    get coords() {
      return this.count > 0 ? Array.from(this.pointers.values()).flat() : [0, 0]
    }

    get first() {
      return this.pointers.values().next().value || this.lastCoords
    }

    updateScale(scale) {
      this.scale = scale
    }
  }
    class Store { /* ← и Store */ }

    // 👇 Заглушка Editor, если не используешь визуальный редактор
    class Editor {
      text = ''
      clearError = () => {}
      setError = () => {}
    }

    function resize() {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      renderer?.updateScale(dpr)
    }

    function loop(now) {
      renderer.updateMouse(pointers.first)
      renderer.updatePointerCount(pointers.count)
      renderer.updatePointerCoords(pointers.coords)
      renderer.updateMove(pointers.move)
      renderer.render(now)
      frm = requestAnimationFrame(loop)
    }

    function renderThis() {
      editor.clearError()
      store.putShaderSource(shaderId, editor.text)

      const result = renderer.test(editor.text)
      if (result) {
        editor.setError(result)
      } else {
        renderer.updateShader(editor.text)
      }

      cancelAnimationFrame(frm)
      loop(0)
    }

    const debounce = (fn, delay) => {
      let timerId
      return (...args) => {
        clearTimeout(timerId)
        timerId = setTimeout(() => fn.apply(this, args), delay)
      }
    }
    const render = debounce(renderThis, renderDelay)

    const store = new Store(window.location)
    const editor = new Editor()
    source = { textContent: localStorage.getItem('shader-code') || '' }

    fetch('/shaders/anomaly.glsl')
      .then(res => res.text())
      .then(shader => {
        editor.text = shader
        store.putShaderSource(shaderId, shader)

        renderer = new Renderer(canvas, dpr)
        pointers = new PointerHandler(canvas, dpr)

        renderer.setup()
        renderer.init()

        if (renderer.test(shader) === null) {
          renderer.updateShader(shader)
        }

        resize()
        loop(0)

        window.addEventListener('resize', resize)
      })

    return () => {
      cancelAnimationFrame(frm)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: -50 }}
    />
  )
}
