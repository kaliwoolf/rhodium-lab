import { useEffect } from 'react'
import '../styles/saturn.css' // Не забудь создать этот файл

export default function Saturn() {
  useEffect(() => {
    // Убираем scrollbars, если нужно
    document.body.style.overflow = 'hidden'
  }, [])

  return (
    <div className="saturn-wrapper">
      <div className="saturn">
        <div className="ring"></div>
      </div>
    </div>
  )
}
