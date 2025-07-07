import './globals.css'
import { Inter } from 'next/font/google'
import BackgroundEffect from '@/components/BackgroundEffect'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Rhodium Lab',
  description: 'Crystal resonance and design atmospheres.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BackgroundEffect />
        {children}
      </body>
    </html>
  )
}