import Head from 'next/head'
import { motion } from 'framer-motion'
import Saturn from '../components/Saturn'

export default function Home() {
  return (
    <>
      <Head>
        <title>RHODIUM LAB</title>
      </Head>
      <Saturn />
      <main className="bg-transparent min-h-screen flex flex-col items-center justify-center text-white font-sans">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-widest"
        >
          RHODIUM LAB
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="px-6 py-2 rounded-full border border-crimson text-sm md:text-base tracking-wider flex items-center gap-4 shadow-neon"
        >
          <span>WORK</span>
          <div className="w-6 h-px bg-crimson" />
          <span>CONTACT</span>
        </motion.div>
      </main>
    </>
  )
}
