'use client'

import { useEffect, useMemo, useState } from 'react'
import ScrambleHoverLink from './ScrambleHoverLink'
import ScrambleLink from './ScrambleLink'

// touch-детект
function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  )
}

// Safari-детект (не срабатывает в Chrome/Brave/Edge на WebKit)
const useIsSafari = () =>
  useMemo(() => {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent
    return /safari/i.test(ua) && !/chrome|crios|fxios|edg/i.test(ua)
  }, [])

export default function AdaptiveScrambleLink(props) {
  const [isTouch, setIsTouch] = useState(false)
  const isSafari = useIsSafari()

  useEffect(() => {
    setIsTouch(isTouchDevice())
  }, [])

  // Если разработчик передал onClick и НЕТ нормального href — сами ставим preventDefaultOnClick,
  // чтобы клик не уходил в "#" и работал кастомный скролл.
  const needsPrevent =
    !!props.onClick && (!props.href || props.href === '#')

  const commonProps = {
    ...props,
    preventDefaultOnClick: props.preventDefaultOnClick ?? needsPrevent,
    // важная «булавка» для Safari под backdrop-blur/transform:
    style: {
      pointerEvents: 'auto',
      ...(props.style || {}),
    },
  }

  if (isTouch) {
    // Мобилки: ScrambleLink (тап-скрэмбл)
    return <ScrambleLink {...commonProps} />
  }

  // Десктопы: ScrambleHoverLink (ховер-скрэмбл)
  // В Safari дополнительно подкинем role="button" при onClick без href —
  // это не меняет визуально ничего, но иногда помогает хиту-тестингу.
  if (isSafari && needsPrevent) {
    return <ScrambleHoverLink {...commonProps} role="button" />
  }

  return <ScrambleHoverLink {...commonProps} />
}
