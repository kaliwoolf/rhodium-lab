import Head from 'next/head'
import dynamic from 'next/dynamic'
import HeroSection from '../components/HeroSection'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useInView } from 'react-intersection-observer'

// ⬇ отключаем SSR для GlassVideoPanel (обязательно!)
const GlassVideoPanel = dynamic(() => import('../components/GlassVideoPanel'), { ssr: false })

// ⬇ пробрасываем showPanel в ThreeBackground
const ThreeBackground = dynamic(() => import('../components/ThreeBackground'), { ssr: false })

export default function Home() {
  const { ref: projectsRef, inView: isProjectsInView } = useInView({
    threshold: 0.2,
    triggerOnce: false,
  })

  return (
    <>
      <Head>
        <title>RHODIUM</title>
      </Head>

      {/* ⬇ передаём showPanel как флаг */}
      <ThreeBackground showPanel={isProjectsInView} />

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
      </main>
    </>
  )
}
