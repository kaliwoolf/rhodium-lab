import { useRef } from 'react'

export default function ScrambleLink({ text, onClick, href, className = '', delay = 30, duration = 1000 }) {
  const spanRef = useRef(null)

  const scramble = () => {
    const el = spanRef.current
    const chars = '!<>-_\\/[]{}—=+*^?#________'
    const original = text
    let frame = 0
    const totalFrames = Math.floor(duration / delay)

    const interval = setInterval(() => {
      let output = ''
      for (let i = 0; i < original.length; i++) {
        if (i < (frame / totalFrames) * original.length) {
          output += original[i]
        } else {
          output += chars[Math.floor(Math.random() * chars.length)]
        }
      }
      el.textContent = output
      frame++
      if (frame >= totalFrames) {
        clearInterval(interval)
        el.textContent = original
        if (href) {
          window.open(href, '_blank')
        } else if (onClick) {
          onClick()
        }
      }
    }, delay)
  }

  return (
    <span
      ref={spanRef}
      onClick={scramble}
      className={`cursor-pointer inline-block transition-all ${className}`}
    >
      {text}
    </span>
  )
}
