'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export default function ScrambleHoverLink({
  text,
  href,
  onClick,
  className = '',
  disabled = false,
  preventDefaultOnClick = false,
  style = {},
  role,
}) {
  const spanRef = useRef(null)
  const intervalRef = useRef(null)
  const originalText = useRef(text)
  const chars = 'АБВГДЕЁЗИКЛНОПРСТУХЦЧЬЮЯ2345679'.split('')
  const [isClient, setIsClient] = useState(false)

  const isSafari = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent
    return /safari/i.test(ua) && !/chrome|crios|fxios|edg/i.test(ua)
  }, [])

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
    if (disabled || !spanRef.current) return
    intervalRef.current = setInterval(() => {
      spanRef.current.textContent = scrambleText(originalText.current)
    }, 100)
  }

  const stopScramble = () => {
    clearInterval(intervalRef.current)
    if (spanRef.current) spanRef.current.textContent = originalText.current
  }

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault()
      return
    }

    // Разрешаем стандартное поведение для Cmd/Ctrl-click и средней кнопки
    if (e.metaKey || e.ctrlKey || e.button === 1) return

    // Если явно указано или если href не задан — предотвращаем переход
    if (preventDefaultOnClick || (!href && onClick)) {
      e.preventDefault()
    }

    onClick?.(e)
  }

  const computedHref = disabled ? '#' : href ?? '#'

  return (
    <a
      href={computedHref}
      onMouseEnter={startScramble}
      onMouseLeave={stopScramble}
      onClick={handleClick}
      onMouseDown={(e) => e.currentTarget.focus()} // Safari стабилизирует клик
      className={`inline-block cursor-pointer select-none text-xl text-center ${className}`}
      style={{
        minWidth: `${text.length + 2}ch`,
        maxWidth: `${text.length + 2}ch`,
        display: 'inline-block',
        pointerEvents: 'auto',
        outline: 'none',              // убираем обводку
        boxShadow: 'none',  
        ...(isSafari
          ? {
              position: 'relative',
              zIndex: 2,
              transform: 'translateZ(0)',
              WebkitTapHighlightColor: 'transparent',
            }
          : {}),
        ...style,
      }}
      role={role}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      <span
        ref={spanRef}
        className="inline-block whitespace-pre"
        style={{
          fontFeatureSettings: "'liga' 0, 'calt' 0",
          letterSpacing: '0.05em',
          width: '100%',
        }}
      >
        {text}
      </span>
    </a>
  )
}
