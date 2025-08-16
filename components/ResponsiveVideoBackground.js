import { useEffect, useState } from 'react'

export default function ResponsiveVideoBackground() {
  const [isMobile, setIsMobile] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [isSafari, setIsSafari] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsMobile(window.innerWidth < 640)

    const ua = navigator.userAgent
    const safari = /safari/i.test(ua) && !/chrome|crios|fxios|edg/i.test(ua)
    setIsSafari(safari)

    const handler = () => setShowVideo(true)
    window.addEventListener('scroll', handler, { once: true })
    window.addEventListener('touchstart', handler, { once: true })
    const t = setTimeout(() => setShowVideo(true), 1200)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('touchstart', handler)
      clearTimeout(t)
    }
  }, [])

  // На Safari вообще ничего не рендерим — остаются твои звёзды/React-фон
  if (isSafari) return null

  const videoSrc = isMobile ? '/video/un-mobile.mp4' : '/video/un.mp4'

  return showVideo ? (
    <video
      src={videoSrc}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      // eslint-disable-next-line react/no-unknown-property
      webkit-playsinline="true"
      disablePictureInPicture
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        zIndex: -3,
        pointerEvents: 'none'
      }}
    />
  ) : null
}
