'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export default function ScrambleHoverLink({
  text,
  href,
  onClick,
  className = '',
  disabled = false,
  preventDefaultOnClick = false, // можно не передавать — AdaptiveScrambleLink сам подставит
  style = {},
  role,
}) {
  const isSafari = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent
    return /safari/i.test(ua) && !/chrome|crios|fxios|edg/i.test(ua)
  }, [])

  const spanRef = useRef(null)
  const intervalRef = useRef(null)
  const originalText = useRef(text)
  const chars = 'АБВГДЕЁЗИКЛНОПРСТУХЦЧЬЮЯ2345679'.split('')

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const scrambleText = (str) =>
    str
      .split('')
      .map((char) => (Math.random() > 0.66 ? chars[(Math.random() * chars.length) | 0] : char))
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
    // Cmd/Ctrl-click и средняя кнопка — даём стандартное поведение
    if (e.metaKey || e.ctrlKey || e.button === 1) return

    // Если работаем как «кнопка» (onClick без нормального href) — блокируем переход
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
      onMouseDown={(e) => e.currentTarget.focus()} // Safari иногда «прозревает» после фокуса
      className={`inline-block cursor-pointer select-none text-xl text-center ${className}`}
      style={{
        minWidth: `${text.length + 2}ch`,
        maxWidth: `${text.length + 2}ch`,
        display: 'inline-block',
        ...(isSafari
          ? {
              position: 'relative',
              zIndex: 2,                  // поверх блюра/слоёв
              transform: 'translateZ(0)', // новый композитный слой для WebKit
              WebkitTapHighlightColor: 'transparent',
            }
          : {}),
        ...style,                         // ← теперь style из AdaptiveScrambleLink реально применяется
        pointerEvents: 'auto',            // жёстко фиксируем таргетируемость
      }}
      role={role}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      <span
        ref={spanRef}
        className="inline-block whitespace-pre"
        style={{ width: '100%' }}
      >
        {text}
      </span>
    </a>
  )
}
