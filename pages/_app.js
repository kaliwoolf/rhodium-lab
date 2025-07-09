import '../styles/globals.css'
import dynamic from 'next/dynamic'

// Отключаем SSR
const ThreeBackground = dynamic(() => import('../components/ThreeBackground'), { ssr: false })
const HeroButtons = dynamic(() => import('../components/HeroButtons'), { ssr: false })

export default function App({ Component, pageProps }) {
  return (
    <>
      <ThreeBackground />
      <HeroButtons />
      <Component {...pageProps} />
    </>
  )
}
