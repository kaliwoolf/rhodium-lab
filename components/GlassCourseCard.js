import styles from '../styles/GlassCourseCard.module.css'
import GlassVideoEffect from '../components/GlassVideoEffect'

export default function GlassCourseCard({ title, description, link, video, isFocused }) {
  return (
    <div className={`${styles.card} ${isFocused ? styles.focused : ''}`}>
      <div className={styles.videoContainer}>
        <video
          src={video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className={styles.video}
        />
        <div className={styles.textureOverlay} />
      </div>

      <div className={styles.overlay}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <a href={link} className={styles.button}>Перейти →</a>
      </div>
    </div>
  )
}
