import { Html } from '@react-three/drei'

export default function HtmlContent() {
  return (
    <>
      <Html fullscreen>
        <section className="h-screen flex items-center justify-center">
          <h1 className="text-white text-5xl">RHODIUM LAB</h1>
        </section>
        <section className="h-screen flex items-center justify-center bg-black/30 backdrop-blur">
          <video autoPlay muted loop className="w-[80vw] rounded-xl shadow-xl">
            <source src="/video.mp4" type="video/mp4" />
          </video>
        </section>
        <section className="h-screen flex items-center justify-center">
          <p className="text-white text-2xl">Контакты</p>
        </section>
      </Html>
    </>
  )
}
