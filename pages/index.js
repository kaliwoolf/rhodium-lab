import Head from 'next/head'
import ThreeBackground from '../components/ThreeBackground'
import HeroSection from '../components/HeroSection'
// и т.д.

export default function Home() {
  return (
    <>
      <Head>
        <title>RHODIUM LAB</title>
      </Head>

      <ThreeBackground />

      <main className="relative z-10">
        <HeroSection />
        {/* ContactSection и т.д. */}
      </main>
    </>
  )
}
