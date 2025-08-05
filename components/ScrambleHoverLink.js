'use client'

import { useEffect, useRef, useState } from 'react'

export default function ScrambleHoverLink({
  text,
  href,
  onClick,
  className = '',
}) {
  const spanRef = useRef(null)
  const intervalRef = useRef(null)
  const originalText = useRef(text)
  const chars = 'АБВГДЕЁЗИКЛМНОПРСТУФХЦЧЪЬЭЮЯ0234568789'.split('')
  const [isClient, setIsClient] = useState(false)

  // чтобы не ругался при SSR
  useEffect(() => {
    setIsClient(true)
    return () => clearInterval(intervalRef.current)
  }, [])

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
    if (!spanRef.current) return
    clearInterval(intervalRef.current)  
    intervalRef.current = setInterval(() => {
      spanRef.current.textContent = scrambleText(originalText.current)
    }, 100)
  }

  const stopScramble = () => {
    clearInterval(intervalRef.current)
    if (spanRef.current) {
      spanRef.current.textContent = originalText.current
    }
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
      onMouseEnter={startScramble}
      onMouseLeave={stopScramble}
      onClick={handleClick}
      onTouchStart={startScramble}
      onTouchEnd={stopScramble}
      onTouchCancel={stopScramble}
      className={`inline-block cursor-pointer select-none text-xl text-center ${className}`}
      style={{
        minWidth: `${text.length + 2}ch`, // запас в 2 символа
        maxWidth: `${text.length + 2}ch`,
        display: 'inline-block',
      }}
    >
      {isClient ? (
        <span
          ref={spanRef}
          className="inline-block whitespace-pre"
          style={{
            fontFeatureSettings: "'liga' 0, 'calt' 0",
            letterSpacing: '0.05em',
            width: '100%', // занимает всю ширину родителя
          }}
        >
          {text}
        </span>
      ) : (
        <span
          className="inline-block whitespace-pre"
          style={{ width: '100%' }}
        >
          {text}
        </span>
      )}
    </a>
  )
}
