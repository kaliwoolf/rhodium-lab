import { useRef } from 'react'

export default function ScrambleExternalLink({
  text,
  href,
  className = '',
  delay = 30,
  duration = 1000
}) {
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
        window.location.href = href // ← теперь работает и на мобилках
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
