// components/GlassCourseCard.js
import styles from '../styles/GlassCourseCard.module.css'

export default function GlassCourseCard({ title, description, link, video }) {
  return (
    <div className={styles.card}>
      <div className={styles.videoWrapper}>
        <video
          src={video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
      <div className={styles.overlay}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <a href={link} className={styles.button}>Перейти →</a>
      </div>
    </div>
  )
}
