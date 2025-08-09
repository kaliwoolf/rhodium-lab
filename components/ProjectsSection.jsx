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

    if (!isDesktop) return <MobileOverlay />;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* 3D-слайдер как фон секции, НО выше глобального бэкграунда */}
      <div className="absolute inset-0 z-[10]">
        <DesktopPanelCarousel3D />
      </div>

      {/* Контент поверх (текст), пусть будет ещё выше, но без кликов */}
      <div className="relative z-[20] pointer-events-none flex h-full items-center justify-center">
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
  );
}
