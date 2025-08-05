// components/LightningEffect.js
import { useEffect, useRef } from 'react'

export default function LightningEffect() {
  const ref = useRef()

  useEffect(() => {
    // Простая SVG-анимация: дёргаем фильтр blur/цвет/толщину
    let frame = 0
    let raf
    function animate() {
      if (ref.current) {
        // Имитация дрожания/электричества — шум по толщине и цвету
        const t = Math.sin(frame / 3) * 0.7 + Math.random() * 0.6
        ref.current.setAttribute('stroke-width', 3.5 + t)
        ref.current.setAttribute('stroke', t > 0 ? '#ff5cff' : '#6ae3ff')
        ref.current.setAttribute('filter', `blur(${Math.abs(t * 1.4)}px)`)
      }
      frame++
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => raf && cancelAnimationFrame(raf)
  }, [])

  return (
    <svg viewBox="0 0 88 40" width="100%" height="100%" className="w-full h-full">
      <path
        ref={ref}
        d="M10 30 Q30 5 44 30 T78 30"
        stroke="#fff"
        strokeWidth="3.5"
        fill="none"
        filter="blur(2px)"
      />
    </svg>
  )
}
