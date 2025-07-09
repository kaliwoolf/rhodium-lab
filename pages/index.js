import Head from 'next/head'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <>
      <Head>
        <title>RHODIUM LAB</title>
      </Head>
      <main className="bg-transparent min-h-screen flex flex-col items-center justify-center text-white font-sans relative z-10">
        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="text-[clamp(2.5rem,8vw,7rem)] font-bold tracking-[0.15em] text-center leading-tight backdrop-blur-sm"
        >
          RHODIUM LAB
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
          className="mt-8 px-8 py-3 rounded-full border border-crimson text-base md:text-lg tracking-widest flex items-center gap-6 shadow-neon backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
          <span className="hover:scale-105 transition-transform">ПРОЕКТЫ</span>
          <div className="w-6 h-px bg-crimson" />
          <span className="hover:scale-105 transition-transform">СВЯЗАТЬСЯ</span>
        </motion.div>
      </main>
    </>
  )
}
