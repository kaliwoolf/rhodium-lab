import { useMemo } from 'react'
import { Bloom } from '@react-three/postprocessing'

export default function DynamicBloom({ explosionFactor }) {
  // Safari-детект (без Chrome/Brave/Edge на WebKit)
  const isSafari = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    const ua = navigator.userAgent
    return /safari/i.test(ua) && !/chrome|crios|fxios|edg/i.test(ua)
  }, [])

  const boosted = explosionFactor > 0.95

  // 🔹 ТОЛЬКО для Safari — лёгкий, «дешёвый» блум
  if (isSafari) {
    return (
      <Bloom
        intensity={Math.min(1.2, 0.25 + explosionFactor * 0.8)}
        luminanceThreshold={0.35}
        mipmapBlur
      />
    )
  }

  // 🔹 Все остальные браузеры — как в исходнике (ничего не меняем)
  return (
    <Bloom
      intensity={boosted ? 3.5 : 0.4 + explosionFactor * 2.5}
      luminanceThreshold={boosted ? 0 : 0.25 - explosionFactor * 0.2}
    />
  )
}
