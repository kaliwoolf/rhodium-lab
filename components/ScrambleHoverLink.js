import { useEffect, useRef } from 'react'

export default function ScrambleHoverLink({
  text,
  href,
  onClick,
  className = '',
  chars = '!<>-_\\/[]{}—=+*^?#________',
  speed = 8,
}) {
  const elRef = useRef()
  const frameRef = useRef()
  const queueRef = useRef([])

  const scramble = () => {
    const el = elRef.current
    const original = text
    const queue = []

    let frame = 0

    for (let i = 0; i < original.length; i++) {
      const from = original[i]
      const to = original[i]
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      queue.push({ from, to, start, end, char: '' })
    }

    queueRef.current = queue

    const update = () => {
      let output = ''
      let complete = 0

      for (let i = 0; i < queue.length; i++) {
        const { from, to, start, end } = queue[i]

        if (frame >= end) {
          output += to
          complete++
        } else if (frame >= start) {
          const randomChar = chars[Math.floor(Math.random() * chars.length)]
          output += `<span style="opacity:0.5">${randomChar}</span>`
        } else {
          output += from
        }
      }

      el.innerHTML = output

      if (complete < queue.length) {
        frame++
        frameRef.current = requestAnimationFrame(update)
      } else {
        cancelAnimationFrame(frameRef.current)
      }
    }

    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(update)
  }

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <a
      href={href || '#'}
      ref={elRef}
      onClick={handleClick}
      onMouseEnter={scramble}
      className={`cursor-pointer inline-block select-none ${className}`}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  )
}
