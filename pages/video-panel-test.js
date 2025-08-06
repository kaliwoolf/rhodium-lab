// pages/video-panel-test.js
import dynamic from "next/dynamic"
import ResponsiveVideoBackground from '../components/ResponsiveVideoBackground'

// SSR Off для Three.js
const VideoPanelOverlay3DTest = dynamic(() => import('../components/VideoPanelOverlay3DTest'), { ssr: false })

export default function VideoPanelTest() {
  return (
    <>
    <ResponsiveVideoBackground />
    <VideoPanelOverlay3DTest videoUrl="/video/00004.mp4" />
    </>
  )
}
