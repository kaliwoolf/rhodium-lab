// components/GlassVideoEffect.js
import styles from '../styles/GlassVideoEffect.module.css'

export default function GlassVideoEffect({ src, className = '' }) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`video`} 
      />
      <div className={styles.overlay} />
    </div>
  )
}

