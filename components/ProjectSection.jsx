// components/ProjectsSection.jsx
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// грузим по требованию:
const DesktopPanelCarousel3D = dynamic(() => import("./DesktopPanelCarousel3D"), { ssr: false })
const MobileOverlay          = dynamic(() => import("./VideoPanelOverlay"),      { ssr: false })

export default function ProjectsSection() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.matchMedia("(min-width: 1024px)").matches)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return isDesktop ? <DesktopPanelCarousel3D /> : <MobileOverlay />
}
