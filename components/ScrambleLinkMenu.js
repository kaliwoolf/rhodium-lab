import ScrambleLink from '../components/ScrambleLink'

export default function ScrambleLinkMenu() {
  return (
    <div className="absolute top-8 right-12 z-50 flex gap-10 text-white text-lg font-semibold tracking-wide">
      <a
        href="https://mysteriumlab.pro/teach/control"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:scale-105 transition-transform"
      >
        <ScrambleLink text="Кабинет" />
      </a>
    </div>
  )
}
