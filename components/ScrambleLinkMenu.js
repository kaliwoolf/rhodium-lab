import ScrambleLink from '../components/ScrambleLink'

export default function ScrambleLinkMenu() {
  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="absolute top-8 right-12 z-50 flex gap-10 text-white text-lg font-semibold tracking-wide">
      <ScrambleLink
          text="Кабинет"
          onClick={() => {
            setTimeout(() => {
                window.open('https://mysteriumlab.pro/teach/control', '_blank')
              }, 1000)
            }}
        />
    </div>
  )
}
