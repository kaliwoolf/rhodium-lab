// components/GlassVideoEffect.js
import { useRef } from 'react'
import styles from '../styles/GlassVideoEffect.module.css'

export default function GlassVideoEffect({ src, className = '' }) {
 
  const videoRef = useRef(null)

  const handleMouseEnter = () => {
    videoRef.current?.play()
  }

  const handleMouseLeave = () => {
    videoRef.current?.pause()
    videoRef.current.currentTime = 0
  }


  return (
    <div className={`${styles.wrapper} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
    >
      <div className={styles.videoContainer}>
        <video
          ref={videoRef} 
          src={src}
          muted
          loop
          playsInline
          preload="auto"
          className={styles.video}
        />
        <div className={styles.overlay} />
      </div>
    </div>
  )
}
