// pages/video-panel-test.js
import dynamic from "next/dynamic"

// SSR Off для Three.js
const VideoGlassPanel = dynamic(() => import('../components/VideoGlassPanel'), { ssr: false })
const VideoPanelOverlay3DTest = dynamic(() => import('../components/VideoPanelOverlay3DTest'), { ssr: false })

export default function VideoPanelTest() {
  return (
    <div>
    <VideoPanelOverlay3DTest videoUrl="/video/00004.mp4" />
    </div>
  )
}
