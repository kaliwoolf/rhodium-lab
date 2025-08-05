import '../styles/globals.css'
import dynamic from 'next/dynamic'
import ResponsiveVideoBackground from '../components/ResponsiveVideoBackground'

// Отключаем SSR
const ThreeBackground = dynamic(() => import('../components/ThreeBackground'), { ssr: false })

export default function App({ Component, pageProps }) {
  return (
    <>
      <ResponsiveVideoBackground />
      <ThreeBackground />
      <Component {...pageProps} />
    </>
  )
}
