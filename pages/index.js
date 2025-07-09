import Head from 'next/head';
import HeroSection from '../components/HeroSection';
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <>
      <Head>
        <title>RHODIUM LAB</title>
      </Head>
      <HeroSection />
    </>
  );
}
