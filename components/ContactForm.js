import { useState, useRef, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import styles from '../styles/ContactBlock.module.css'

export default function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null)
  const captchaRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = await captchaRef.current.executeAsync()
    captchaRef.current.reset()

    const res = await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, message, captcha: token }),
    })

    if (res.ok) {
      setStatus('success')
      setEmail('')
      setMessage('')
    } else {
      setStatus('error')
    }
  }

    useEffect(() => {
      const badge = document.querySelector('.grecaptcha-badge')
      if (badge) {
        badge.style.opacity = '0.01'
        badge.style.pointerEvents = 'none'
      }
    }, [])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ваш e-mail"
        className={styles.glassInput}
        required
      />
      <textarea
        rows="4"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Сообщение"
        className={styles.glassInput}
        required
      />

      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        size="invisible"
        ref={captchaRef}
      />

      <button type="submit" className={styles.glassButton}>
        Отправить
      </button>

      {status === 'success' && (
        <p className="text-green-400 text-sm mt-2">Сообщение отправлено!</p>
      )}
      {status === 'error' && (
        <p className="text-red-400 text-sm mt-2">Ошибка при отправке.</p>
      )}
    </form>
  )
}
