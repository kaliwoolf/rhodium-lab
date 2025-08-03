import ScrambleLink from '../components/ScrambleLink'

export default function ScrambleLinkMenu() {
  return (
    <div className="absolute top-8 right-12 z-50 flex gap-10 text-white text-lg font-semibold tracking-wide">
      <ScrambleLink
        text="Кабинет"
        onClick={() => {
          window.open('https://mysteriumlab.pro/teach/control', '_blank')
        }}
      />
    </div>
  )
}
