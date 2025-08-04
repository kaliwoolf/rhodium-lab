import { useEffect, useRef } from 'react'

export default function ScrambleHoverLink({
  text,
  href,
  onClick,
  className = '',
}) {
  const elRef = useRef(null)
  const intervalRef = useRef(null)
  const originalText = useRef(text)

  const chars = '*?><[]&@#)(.%$-_:/;?!'.split('')

  const scrambleText = (str) =>
    str
      .split('')
      .map((char) =>
        Math.random() > 0.66
          ? chars[Math.floor(Math.random() * chars.length)]
          : char
      )
      .join('')

  const startScramble = () => {
    intervalRef.current = setInterval(() => {
      const el = elRef.current
      if (el) el.innerText = scrambleText(originalText.current)
    }, 150)
  }

  const stopScramble = () => {
    clearInterval(intervalRef.current)
    const el = elRef.current
    if (el) el.innerText = originalText.current
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
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
      onMouseEnter={startScramble}
      onMouseLeave={stopScramble}
      onClick={handleClick}
      className={`inline-block cursor-pointer select-none ${className}`}
    >
       <span
        ref={spanRef}
        className="inline-block whitespace-pre font-mono"
        style={{ minWidth: `${text.length}ch` }} // 👈 фиксирует ширину
      >
        {text}
      </span>
    </a>
  )
}
