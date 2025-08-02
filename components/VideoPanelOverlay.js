// components/VideoPanelOverlay.jsx
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import styles from '../styles/VideoPanelOverlay.module.css'

export default function VideoPanelOverlay() {
  const { ref, inView } = useInView({ threshold: 0.4 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(inView)
  }, [inView])

  return (
    <>
      {/* Триггерная точка для панели */}
      <div ref={ref} id="video-trigger" style={{ height: '1px' }} />

      {/* Плавающая панель */}
      <div className={`${styles.panel} ${visible ? styles.show : ''}`}>
        <video
          src="/videos/00002.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    </>
  )
}
