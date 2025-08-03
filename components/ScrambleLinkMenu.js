import ScrambleLink from '../components/ScrambleLink'
import ScrambleExternalLink from '../components/ScrambleExternalLink'

export default function ScrambleLinkMenu() {
  return (
    <div className="absolute top-8 right-12 z-50 flex gap-10 text-white text-lg font-semibold tracking-wide">
<<<<<<< HEAD
      <ScrambleLink text="Проекты" onClick={() => scrollToId('projects')} />
      <ScrambleLink text="Связаться" onClick={() => scrollToId('contact')} />
      <ScrambleExternalLink text="Кабинет" href="https://mysteriumlab.pro/teach/control" />
=======
      <ScrambleLink
        text="Кабинет"
        href="https://mysteriumlab.pro/teach/control"
      />
>>>>>>> 5bcca47f72b890c3c7dfb16d00ed6b4e8b510ef5
    </div>
  )
}
