import { useEffect, useState } from 'react'
import styles from '../styles/VideoPanelOverlay.module.css'

export default function VideoPanelOverlay({ inView }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(inView)
  }, [inView])

  return (
    <div className={`${styles.panel} ${visible ? styles.show : ''}`}>
      <div className={styles.inner}>
        <p>Панель на секции Проекты</p>
      </div>
    </div>
  )
}
