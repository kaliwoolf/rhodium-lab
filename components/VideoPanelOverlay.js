import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import styles from '../styles/VideoPanelOverlay.module.css'

export default function VideoPanelOverlay() {
  const { ref, inView } = useInView({ threshold: 0.5 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(inView)
  }, [inView])

  useEffect(() => {
    const anchor = document.getElementById('projects-observe-anchor')
    if (anchor) ref(anchor)
  }, [ref])

  return (
    <div className={`${styles.panel} ${visible ? styles.show : ''}`}>
      <div className={styles.inner}>
        <p>Панель на секции Проекты</p>
      </div>
    </div>
  )
}
