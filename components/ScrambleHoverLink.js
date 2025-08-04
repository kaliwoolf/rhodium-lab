import { useRef, useEffect } from 'react'

export default function ScrambleHoverLink({
  text,
  href,
  onClick,
  className = '',
  duration = 1000,
  delay = 20,
  chars = '!<>-_\\/[]{}—=+*^?#________',
}) {
  const spanRef = useRef(null)
  const frameRef = useRef()
  const timeoutRef = useRef()
  const original = useRef(text)

  const scramble = () => {
    const el = spanRef.current
    if (!el) return

    const length = original.current.length
    const output = []
    const queue = []

    for (let i = 0; i < length; i++) {
      const from = original.current[i]
      const to = original.current[i]
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      queue.push({ from, to, start, end, char: '' })
    }

    let frame = 0

    const update = () => {
      let complete = 0
      for (let i = 0; i < queue.length; i++) {
        const { from, to, start, end } = queue[i]
        if (frame >= end) {
          complete++
          output[i] = to
        } else if (frame >= start) {
          const randomChar = chars[Math.floor(Math.random() * chars.length)]
          output[i] = `<span style="opacity:0.5">${randomChar}</span>`
        } else {
          output[i] = from
        }
      }

      el.innerHTML = output.join('')

      if (complete === queue.length) {
        cancelAnimationFrame(frameRef.current)
        return
      }

      frame++
      frameRef.current = requestAnimationFrame(update)
    }

    cancelAnimationFrame(frameRef.current)
    clearTimeout(timeoutRef.current)
    update()
  }

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current)
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <a
      href={href || '#'}
      onMouseEnter={scramble}
      onClick={handleClick}
      className={`group cursor-pointer inline-block select-none transition-all duration-300 ${className}`}
      ref={spanRef}
    >
      {text}
    </a>
  )
}
