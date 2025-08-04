import { useRef, useEffect } from 'react'

export default function ScrambleHoverLink({
  text,
  href,
  onClick,
  className = '',
  duration = 800,
  chars = '!<>-_\/[]{}—=+*^?#________',
}) {
  const spanRef = useRef(null)
  const frameRef = useRef()
  const queueRef = useRef([])
  const frame = useRef(0)

  const scramble = () => {
    const el = spanRef.current
    if (!el) return

    const output = []
    const queue = []

    for (let i = 0; i < text.length; i++) {
      const start = Math.floor(i * 2 + Math.random() * 5)
      const end = start + 10 + Math.floor(Math.random() * 10)
      queue.push({
        from: text[i],
        to: text[i],
        start,
        end,
        char: '',
      })
    }

    queueRef.current = queue
    frame.current = 0

    const update = () => {
      let complete = 0
      for (let i = 0; i < queue.length; i++) {
        const { from, to, start, end } = queue[i]
        if (frame.current >= end) {
          complete++
          output[i] = to
        } else if (frame.current >= start) {
          const randomChar = chars[Math.floor(Math.random() * chars.length)]
          output[i] = `<span style="opacity:0.5">${randomChar}</span>`
        } else {
          output[i] = from
        }
      }

      if (el) el.innerHTML = output.join('')

      if (complete === queue.length) return
      frame.current++
      frameRef.current = requestAnimationFrame(update)
    }

    cancelAnimationFrame(frameRef.current)
    update()
  }

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <a
      href={href || '#'}
      onMouseEnter={scramble}
      onClick={handleClick}
      className={`group cursor-pointer inline-block select-none transition-all duration-300 ${className}`}
    >
      <span ref={spanRef}>{text}</span>
    </a>
  )
}