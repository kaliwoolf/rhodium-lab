import Head from 'next/head'
import ThreeBackground from '../components/ThreeBackground'
import HeroSection from '../components/HeroSection'
import { motion } from 'framer-motion'
import GlassVideoPanel from '../components/GlassVideoPanel'
import { useRef } from 'react'
import { useInView } from 'react-intersection-observer'


export default function Home() {
  const { ref: projectsRef, inView: isProjectsInView } = useInView({
    threshold: 0.2, // показывать, когда 20% блока видно
    triggerOnce: false,
  })


  return (
    <>
      <Head>
        <title>RHODIUM LAB</title>
      </Head>

      <ThreeBackground>
        {/* Только если пользователь прокрутил до projects */}
        {isProjectsInView && <GlassVideoPanel />}
      </ThreeBackground>

      <main className="relative z-10">
          <HeroSection />

      {/* Projects */}
        <motion.section
          id="projects"
          ref={projectsRef}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="h-screen bg-transparent text-white flex items-center justify-center"
        >
          <p className="text-4xl">Проекты будут здесь ✨</p>
        </motion.section>

        {/* Contact */}
        <motion.section
          id="contact"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="h-screen bg-transparent text-white flex items-center justify-center"
        >
          <p className="text-4xl">Контакты</p>
        </motion.section>

      <motion.section
          id="contact"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="h-screen bg-transparent text-white flex items-center justify-center"
      >
          <p className="text-4xl">Контакты</p>
        </motion.section>
    </main>
    </>
  )
}
