import { useRef } from 'react'
import styles from '../styles/GlassCourseCard.module.css'
import GlassVideoEffect from '../components/GlassVideoEffect'

export default function GlassCourseCard({ title, description, link, video }) {
  const videoRef = useRef(null)

  const handleMouseEnter = () => {
    videoRef.current?.play()
  }

  const handleMouseLeave = () => {
    videoRef.current?.pause()
    videoRef.current.currentTime = 0
  }

  return (
    <div
      className={styles.card}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <GlassVideoEffect src={video} className={styles.videoWrapper} videoRef={videoRef} />

      <div className={styles.overlay}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <a href={link} className={styles.button}>Перейти →</a>
      </div>
    </div>
  )
}
