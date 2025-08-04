import ScrambleLink from '../components/ScrambleLink'
import ScrambleExternalLink from '../components/ScrambleExternalLink'

export default function ScrambleLinkMenu() {
  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
  <div className="absolute top-8 right-12 z-50">
    <a
      href="https://mysteriumlab.pro/teach/control"
      target="_blank"
      rel="noopener noreferrer"
      className="
        px-6 py-2 
        rounded-full 
        text-white 
        text-lg 
        font-semibold 
        tracking-wider 
        bg-white/5 
        backdrop-blur-md 
        border border-white/20 
        ring-1 ring-white/10 
        shadow-[0_0_20px_rgba(255,255,255,0.05)] 
        hover:shadow-[0_0_30px_rgba(255,0,255,0.3)] 
        hover:ring-fuchsia-400 
        transition-all 
        duration-300 
        ease-out
      "
    >
      Кабинет
    </a>
  </div>
)
}
