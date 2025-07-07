export class PointerHandler {
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
