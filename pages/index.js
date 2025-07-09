import Head from 'next/head'
import ThreeBackground from '../components/ThreeBackground'
import HeroSection from '../components/HeroSection'
import { motion } from 'framer-motion'


export default function Home() {
  return (
    <>
      <Head>
        <title>RHODIUM LAB</title>
      </Head>

      <ThreeBackground />

      <main className="relative z-10">
        <HeroSection />

      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="h-screen bg-black text-white flex items-center justify-center"
      >
        <p className="text-4xl">А вот и второй экран!</p>
      </motion.section>
    </main>
    </>
  )
}
