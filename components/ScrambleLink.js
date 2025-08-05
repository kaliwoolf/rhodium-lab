import { useRef } from 'react'

export default function ScrambleLink({ text, onClick, className = '', delay = 30, duration = 1000, disabled = false}) {
  const spanRef = useRef(null)

  const scramble = () => {
    const el = spanRef.current
    const chars = 'АБВГДЕЁЗИКЛНОПРСТУХЦЧЬЮЯ2345679'
    const original = text
    let output = ''
    let frame = 0
    const totalFrames = Math.floor(duration / delay)

    const interval = setInterval(() => {
      output = ''
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
      }
    }, delay)
  }

  const handleClick = (e) => {
    if (disabled) {
    e.preventDefault()
    return
  }
    if (onClick) {
      e.preventDefault()
      scramble()
      setTimeout(() => {
        onClick()
      }, duration)
    }
  }

  return (
    <span
      ref={spanRef}
      className={`inline-block transition-all ${className} ${disabled ? 'opacity-60 pointer-events-none cursor-default' : 'cursor-pointer'}`}
      onClick={handleClick}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      {text}
    </span>
  )
}
