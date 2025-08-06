// pages/video-panel-test.js
import dynamic from "next/dynamic"

// SSR Off для Three.js
const VideoGlassPanel = dynamic(() => import('../components/VideoGlassPanel'), { ssr: false })
const VideoPanelOverlay3DTest = dynamic(() => import('../components/VideoPanelOverlay3DTest'), { ssr: false })

export default function VideoPanelTest() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#171923" }}>
      <VideoGlassPanel videoUrl="/video/00002.mp4" />
      <VideoPanelOverlay3DTest videoUrl="/video/00002.mp4" />
    </div>
  )
}
