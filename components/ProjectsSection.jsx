'use client'

// components/ProjectsSection.jsx
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const DesktopPanelCarousel3D = dynamic(() => import("../components/DesktopPanelCarousel3D"), { ssr: false })
const MobileOverlay = dynamic(() => import("../components/VideoPanelOverlay"), { ssr: false })

export default function ProjectsSection() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const check = () => setIsDesktop(window.matchMedia("(min-width: 1024px)").matches)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (!isDesktop) return <MobileOverlay />

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* 3D-слайдер как фон секции, НО выше глобального бэкграунда */}
      <div className="absolute inset-0 z-[10]">
        <DesktopPanelCarousel3D />
      </div>
    </div>
  );
}
