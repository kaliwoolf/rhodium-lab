import '../styles/globals.css'
import dynamic from 'next/dynamic'
import ResponsiveVideoBackground from '../components/ResponsiveVideoBackground'

// Отключаем SSR
const ThreeBackground = dynamic(() => import('../components/ThreeBackground'), { ssr: false })
const VideoGlassPanel = dynamic(() => import('../components/VideoGlassPanel'), { ssr: false })

export default function App({ Component, pageProps }) {
  return (
    <>
      <ResponsiveVideoBackground />
      <ThreeBackground />
      <Component {...pageProps} />
      <VideoGlassPanel videoUrl="/video/00002.mp4" />
    </>
  )
}
