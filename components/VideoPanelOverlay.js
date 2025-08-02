import { useEffect, useState } from 'react'
import styles from '../styles/VideoPanelOverlay.module.css'
import CourseSlider from '../components/CourseSlider'


export default function VideoPanelOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('projects')
      if (!section) return
      const rect = section.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.3
      setVisible(isVisible)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div className={`${styles.panel} ${visible ? styles.show : ''}`}>
      <div className={styles.inner}>
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
          <h2 className="text-xl font-bold mb-4">🧪 Актуальные курсы</h2>
          <CourseSlider />
        </div>

      </div>
    </div>
  )
}
