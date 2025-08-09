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

  // это твоя "секция", только без тега <section>, т.к. он уже есть в index.js
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* 3D-слайдер как фон */}
      <div className="absolute inset-0">
        <DesktopPanelCarousel3D />
      </div>

      {/* Контент поверх */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-6xl md:text-7xl font-extrabold tracking-tight">
            Актуальные проекты
          </h2>
          <p className="mt-4 text-lg opacity-80">
            Короткий сабтайтл, если нужен
          </p>
        </div>
      </div>
    </div>
  )
}
