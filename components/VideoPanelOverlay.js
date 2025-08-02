import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import styles from '../styles/VideoPanelOverlay.module.css'

export default function VideoPanelOverlay() {
  const { ref, inView } = useInView({ threshold: 0.6 }) // ← появляется, когда секция «проекты» примерно в центре
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(inView)
  }, [inView])

  return (
    <>
      {/* Привязка к секции "Проекты" */}
      <div ref={ref} id="video-trigger-anchor" style={{ height: 0 }} />

      {/* Панель, которую показываем/скрываем */}
      <div className={`${styles.panel} ${visible ? styles.show : ''}`}>
        <div className={styles.inner}>
          {/* Любой контент — хоть видео, хоть рамка */}
          <p>Панель на секции Проекты</p>
        </div>
      </div>
    </>
  )
}
