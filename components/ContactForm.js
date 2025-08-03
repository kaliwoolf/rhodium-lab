// components/ContactForm.js
import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import styles from '../styles/ContactBlock.module.css'

export default function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState(null)
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaToken) return

    const res = await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, message, captcha: captchaToken }),
    })

    if (res.ok) {
      setStatus('success')
      setEmail('')
      setMessage('')
    } else {
      setStatus('error')
    }
  }

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
        sitekey="6LdSKZkrAAAAAA3CXCNOilKpolBCyRrpVOmYO3Tr"
        size="invisible"
        badge="inline"
        onChange={(token) => setCaptchaToken(token)}
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

