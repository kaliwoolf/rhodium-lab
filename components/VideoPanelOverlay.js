import { useEffect, useState, useRef } from 'react'
import styles from '../styles/VideoPanelOverlay.module.css'
import CourseSlider from '../components/CourseSlider'


export default function VideoPanelOverlay() {
  const [visible, setVisible] = useState(false)
  const innerRef = useRef(null) // Добавили ref

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('projects')
      const rect = section?.getBoundingClientRect()
      if (!rect) return

      const topVisible = rect.top < window.innerHeight * 0.4
      const bottomAbove = rect.bottom > window.innerHeight * 0.5

      setVisible(topVisible && bottomAbove)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // ---- 3D tilt handlers ----
  const handlePointerMove = (e) => {
    if (!innerRef.current) return
    const panel = innerRef.current
    const rect = panel.getBoundingClientRect()

    // Универсально для тача и мыши
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const x = (clientX - rect.left) / rect.width
    const y = (clientY - rect.top) / rect.height

    const rotY = (x - 0.5) * 22
    const rotX = -(y - 0.5) * 16

    panel.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`
  }
  const handlePointerOut = () => {
    if (innerRef.current)
      innerRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
  }

  // ---- только если видно панель ----

  if (!visible) return null

  return (
    <div className={`${styles.panel} ${visible ? styles.show : ''}`}>
      <div 
        className={styles.inner}
        ref={innerRef}
        // Только на десктопе!
        onMouseMove={window.innerWidth > 767 ? handlePointerMove : undefined}
        onMouseLeave={window.innerWidth > 767 ? handlePointerOut : undefined}
        onTouchMove={window.innerWidth > 767 ? handlePointerMove : undefined}
        onTouchEnd={window.innerWidth > 767 ? handlePointerOut : undefined}
      >  
        <div className={styles.videoWrapper}>
          <video
            src="/video/00002.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
        <div className={styles.content}>
          <h3 className="text-white text-xl font-semibold px-6 py-2 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-white/20 shadow-md mb-6 w-fit mx-auto">
            ✨ Актуальные проекты
          </h3>
          <CourseSlider />
        </div>

      </div>
    </div>
  )
}
