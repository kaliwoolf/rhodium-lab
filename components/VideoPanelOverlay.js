import { useEffect, useState } from 'react'
import styles from '../styles/VideoPanelOverlay.module.css'
import CourseSlider from '../components/CourseSlider'


export default function VideoPanelOverlay() {
  const [visible, setVisible] = useState(false)
  const [hasAppeared, setHasAppeared] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('projects')
      const rect = section?.getBoundingClientRect()
      if (!rect) return

      const topVisible = rect.top < window.innerHeight * 0.4
      const bottomAbove = rect.bottom > window.innerHeight * 0.5

      const shouldShow = topVisible && bottomAbove
      setVisible(topVisible && bottomAbove)

      if (shouldShow && !hasAppeared) {
        setHasAppeared(true)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [hasAppeared])

  if (!visible && !hasAppeared) return null

  return (
    <div className={styles.panel}>
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
          <CourseSlider autoFocusOnMount={hasAppeared} />
        </div>
      </div>
    </div>
  )
}
