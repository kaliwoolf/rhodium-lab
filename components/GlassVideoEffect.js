// components/GlassVideoEffect.js
import { useRef } from 'react'
import styles from '../styles/GlassVideoEffect.module.css'

export default function GlassVideoEffect({ src, className = '', videoRef, texture }) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
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
        <div 
          className={styles.overlay}
          style={{
            backgroundImage: `url(${texture || '/textures/glass-noise.png'})` 
          }}
        />
      </div>
    </div>
  )
}

