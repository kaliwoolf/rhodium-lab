'use client'

import { useEffect, useState } from 'react'
import ScrambleHoverLink from './ScrambleHoverLink'
import ScrambleLink from './ScrambleLink'

// Функция для определения, touch-устройство или нет
function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  )
}

export default function AdaptiveScrambleLink(props) {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(isTouchDevice())
  }, [])

  if (isTouch) {
    // Мобилки: используем ScrambleLink (тап-скрэмбл)
    return <ScrambleLink {...props} />
  } else {
    // Десктопы: ScrambleHoverLink (ховер-скрэмбл)
    return <ScrambleHoverLink {...props} />
  }
}
