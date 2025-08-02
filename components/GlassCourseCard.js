// components/GlassCourseCard.js
import styles from '../styles/GlassCourseCard.module.css'
import GlassVideoEffect from './GlassVideoEffect'

export default function GlassCourseCard({ title, description, link, video }) {
  return (
    <div className={styles.card}>
      <GlassVideoEffect src={video} className={styles.videoWrapper} />

      <div className={styles.overlay}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <a href={link} className={styles.button}>Перейти →</a>
      </div>
    </div>
  )
}
