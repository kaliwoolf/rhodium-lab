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

    const handleScroll = () => {
      const section = document.getElementById('projects')
      const rect = section?.getBoundingClientRect()
      if (!rect) return

      const topVisible = rect.top < window.innerHeight * 0.4
      const bottomAbove = rect.bottom > window.innerHeight * 0.5

      setVisible(topVisible && bottomAbove)
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
          <h3 className="text-white text-xl font-semibold px-6 py-2 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-white/20 shadow-md mb-6 w-fit mx-auto">
            ✨ Актуальные проекты
          </h3>
          <CourseSlider />
        </div>

      </div>
    </div>
  )
}
