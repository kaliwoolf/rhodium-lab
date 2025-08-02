// components/GlassCourseCard.js
import styles from '../styles/GlassCourseCard.module.css'
import GlassVideoEffect from '../components/GlassVideoEffect' // ← вернуть импорт

export default function GlassCourseCard({ title, description, link, video, isFocused }) {
  return (
    <div className={`${styles.card} ${isFocused ? styles.focused : ''}`}>
      <GlassVideoEffect src={video} /> {/* ← сохраняем внешний компонент */}
      
      <div className={styles.overlay}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <a href={link} className={styles.button}>Перейти →</a>
      </div>
    </div>
  )
}
