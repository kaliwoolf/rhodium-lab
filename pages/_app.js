import '../styles/globals.css'
import dynamic from 'next/dynamic'

// Отключаем SSR
const ThreeBackground = dynamic(() => import('../components/ThreeBackground'), { ssr: false })

export default function App({ Component, pageProps }) {
  return (
    <>
      <ThreeBackground />
      <Component {...pageProps} />
    </>
  )
}
