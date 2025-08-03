// components/ContactForm.js
import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import styles from '../styles/ContactBlock.module.css'

export default function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaToken) return

    setLoading(true)
    setStatus(null)

    try {
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
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
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
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        size="invisible"
        badge="inline"
        onChange={(token) => setCaptchaToken(token)}
      />

      <button
        type="submit"
        className={`${styles.glassButton} flex items-center justify-center gap-2`}
        disabled={loading}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {loading ? 'Отправка...' : 'Отправить'}
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
