import { useRef, useState } from 'react'
import classNames from 'classnames'
import styles from '../styles/GlassCourseCard.module.css'
import GlassVideoEffect from '../components/GlassVideoEffect'

export default function GlassCourseCard({ title, description, link, video, texture, sliderRef, isFocused }) {
  const videoRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    videoRef.current?.play()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    videoRef.current?.pause()
    videoRef.current.currentTime = 0
  }

  const handleWheel = (e) => {
    if (!sliderRef?.current) return
    e.preventDefault()
    sliderRef.current.scrollLeft += e.deltaY
  }

  return (
    <div className={styles.card} onWheel={handleWheel}>
      <div
        className={classNames(styles.inner, { [styles.focused]: isFocused })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <GlassVideoEffect
          src={video}
          texture={texture}
          videoRef={videoRef}
          className={classNames(styles.videoWrapper, { [styles.visible]: isHovered })}
        />

        <div className={styles.overlay}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
          <a href={link} className={styles.button}>Перейти →</a>
        </div>
      </div>
    </div>
  )
}
