import Head from 'next/head'
import dynamic from 'next/dynamic'
import HeroSection from '../components/HeroSection'
import styles from '../styles/ContactBlock.module.css'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import VideoPanelOverlay from '../components/VideoPanelOverlay'

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

        <section id="projects" className="h-screen flex items-center justify-center text-white">
        </section>

        <VideoPanelOverlay />

        <section id="contact" className="relative h-screen flex items-center justify-center px-4">
          <div className={`${styles.glassContact} w-full max-w-xl p-8 rounded-2xl`}>
            <h2 className={styles.contactHeading}>Связаться</h2>
            <form className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Ваш e-mail"
                className={styles.glassInput}
              />
              <textarea
                rows="4"
                placeholder="Сообщение"
                className={styles.glassInput}
              />
              <button
                type="submit"
                className={styles.glassButton}
              >
                Отправить
              </button>
            </form>
          </div>
        </section>

      </main>
    </>
  )
}
