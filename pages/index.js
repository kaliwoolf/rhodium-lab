
import Head from 'next/head'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="bg-dark min-h-screen flex flex-col items-center justify-center text-white font-sans">
      <Head>
        <title>RHODIUM LAB</title>
      </Head>

      <motion.h1
        className="text-5xl md:text-7xl font-bold mb-6 tracking-widest"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        RHODIUM LAB
      </motion.h1>

      <motion.div
        className="px-6 py-2 rounded-full border border-crimson text-sm md:text-base tracking-wider flex items-center gap-4 shadow-neon"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <span>WORK</span>
        <div className="w-6 h-px bg-crimson" />
        <span>CONTACT</span>
      </motion.div>
    </div>
  )
}
