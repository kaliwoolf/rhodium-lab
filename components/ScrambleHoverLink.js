import { useRef } from 'react'

export default function ScrambleHoverLink({
  text,
  href,         // если ссылка внешняя
  onClick,      // если обработчик клика
  className = '',
  delay = 40,
  duration = 1000,
}) {
  const spanRef = useRef(null)

  const scramble = () => {
    const el = spanRef.current
    if (!el) return
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
      }
    }, delay)
  }

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <a
      href={href || '#'}
      ref={spanRef}
      onMouseEnter={scramble}
      onClick={handleClick}
      className={`cursor-pointer inline-block select-none ${className}`}
    >
      {text}
    </a>
  )
}
