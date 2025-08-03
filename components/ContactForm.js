import { useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export default function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaToken) return

    await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, message, captcha: captchaToken }),
    })

    setEmail('')
    setMessage('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ваш e-mail"
        className="..."
        required
      />
      <textarea
        rows="4"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Сообщение"
        className="..."
        required
      />
      <ReCAPTCHA
        sitekey="6LdSKZkrAAAAAA3CXCNOilKpolBCyRrpVOmYO3Tr"
        size="invisible"
        badge="inline"
        onChange={(token) => setCaptchaToken(token)}
      />
      <button type="submit" className="...">
        Отправить
      </button>
    </form>
  )
}
