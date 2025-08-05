import { useEffect, useState } from 'react'

export default function ResponsiveVideoBackground() {
  const [isMobile, setIsMobile] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    // На сервере window не существует
    if (typeof window === 'undefined') return
    // Запускаем только на клиенте
    setIsMobile(window.innerWidth < 640)

    // Ленивая загрузка видео после первого взаимодействия или таймаута
    const handler = () => setShowVideo(true)
    window.addEventListener('scroll', handler, { once: true })
    window.addEventListener('touchstart', handler, { once: true })
    setTimeout(() => setShowVideo(true), 1200)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('touchstart', handler)
    }
  }, [])

  const videoSrc = isMobile ? '/video/un-mobile.mp4' : '/video/un.mp4'

  return (
    <>
      {showVideo && (
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
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
      )}
    </>
  )
}
