// components/ScrambleLink.js
import { useEffect, useRef } from 'react'

export default function ScrambleLink({ text, onClick, className = '', delay = 30, duration = 1000 }) {
  const spanRef = useRef(null)

  const scramble = () => {
    const el = spanRef.current
    const chars = '!<>-_\/[]{}~=+*^?#________'
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
    scramble()
    if (onClick) {
      setTimeout(() => onClick(e), duration + 50)
    }
  }

  return (
    <span
      ref={spanRef}
      className={`cursor-pointer inline-block transition-all ${className}`}
      onClick={handleClick}
    >
      {text}
    </span>
  )
}