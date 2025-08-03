export default async function handler(req, res) {
  const { email, message, captcha } = req.body

  const recaptchaRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`,
  })

  const recaptchaJson = await recaptchaRes.json()
  console.log('reCAPTCHA response:', recaptchaJson)

  if (!recaptchaJson.success || recaptchaJson.score < 0.3) {
    return res.status(403).json({ error: 'Failed CAPTCHA verification', score: recaptchaJson.score })
  }

  const telegramToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  const text = `📩 Новое сообщение:\n\n✉️ Email: ${email}\n📝 Сообщение:\n${message}`

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })

    if (!tgRes.ok) {
      const errText = await tgRes.text()
      console.error('Telegram error:', errText)
      return res.status(500).json({ error: 'Telegram API failed' })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({ error: 'Unexpected error' })
  }
}
