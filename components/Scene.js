import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll } from '@react-three/drei'
import HeroSection from '../components/HeroSection'
import Particles from '../components/Particles'

export default function Scene() {
  return (
    <Canvas>
      <Particles />

      <ScrollControls pages={3}>
        <Scroll html>
          <div className="h-screen">
            <HeroSection />
          </div>

          <section className="h-screen flex items-center justify-center">
            <video autoPlay muted loop className="w-[80vw] rounded-xl shadow-xl">
              <source src="/video.mp4" type="video/mp4" />
            </video>
          </section>

          <section className="h-screen flex items-center justify-center">
            <p className="text-white text-2xl">Контакты</p>
          </section>
        </Scroll>
      </ScrollControls>
    </Canvas>
  )
}
