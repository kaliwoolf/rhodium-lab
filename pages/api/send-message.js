export default async function handler(req, res) {
  const { email, message, captcha } = req.body

  // Проверка капчи
  const recaptchaRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`,
  })

  const recaptchaJson = await recaptchaRes.json()
  if (!recaptchaJson.success) /* || recaptchaJson.score < 0.5) */ {
    return res.status(403).json({ error: 'Failed CAPTCHA verification' })
  }

  // Отправка в Telegram
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  const text = `📩 Новое сообщение:\n\n✉️ Email: ${email}\n📝 Сообщение:\n${message}`

  await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  return res.status(200).json({ success: true })
}
