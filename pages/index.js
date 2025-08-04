import Head from 'next/head'
import dynamic from 'next/dynamic'
import HeroSection from '../components/HeroSection'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import VideoPanelOverlay from '../components/VideoPanelOverlay'
import ScrambleLinkMenu from '../components/ScrambleLinkMenu'
import ContactBlock from '../components/ContactBlock'

export default function Home() {
  const { ref: projectsRef, inView: isProjectsInView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  return (
    <>
      <Head>
        <title>RHODIUM</title>
      </Head>

      <main className="relative z-10">
        <HeroSection />
        <ScrambleLinkMenu />

        <section id="projects" className="h-screen flex items-center justify-center text-white">
        </section>

        <VideoPanelOverlay />

        <motion.section 
          id="contact"
          className="h-screen flex items-center justify-center"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <ContactBlock />
        </motion.section>

      </main>
    </>
  )
}
