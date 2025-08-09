import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import VideoPanelOverlay from "./VideoPanelOverlay" // твой текущий мобильный блок

const DesktopPanelCarousel3D = dynamic(() => import("./DesktopPanelCarousel3D"), {
  ssr: false,
})

export default function ProjectsSection() {
  const [isMobile, setIsMobile] = useState(true)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024) // < lg — мобильный
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  if (isMobile) return <VideoPanelOverlay />        // мобильный остаётся как был
  return <DesktopPanelCarousel3D />                 // десктоп — 3D-слайдер
}
