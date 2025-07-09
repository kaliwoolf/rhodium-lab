import Head from 'next/head'
import dynamic from 'next/dynamic'

// Отключаем SSR для WebGL-сцены
const Scene = dynamic(() => import('../components/Scene'), { ssr: false })

export default function Home() {
  return (
    <>
      <Head>
        <title>RHODIUM LAB</title>
      </Head>
      <main className="h-screen w-screen">
        <Scene />
      </main>
    </>
  )
}
