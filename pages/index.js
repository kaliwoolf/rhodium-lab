import Head from 'next/head'
import dynamic from 'next/dynamic'
import HeroSection from '../components/HeroSection'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import VideoPanelOverlay from '../components/VideoPanelOverlay'


export default function Home() {
  const { ref: projectsRef, inView: isProjectsInView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  export default function Home() {
  return (
    <>
      <main className="relative z-10">
        <HeroSection />

        <motion.section
          id="projects"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="h-screen bg-transparent text-white flex items-center justify-center"
        >
          <div id="projects-observe-anchor">
            <p className="text-4xl">Проекты будут здесь ✨</p>
          </div>
        </motion.section>

        <VideoPanelOverlay />

        <motion.section id="contact" ...>
          <p className="text-4xl">Контакты</p>
        </motion.section>
      </main>
    </>
  )
}