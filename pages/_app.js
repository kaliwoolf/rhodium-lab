import '../styles/globals.css'
// import BackgroundEffect from '../components/BackgroundEffect'
import ShaderBackground from '../components/ShaderBackground'
import dynamic from 'next/dynamic'

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* <BackgroundEffect /> */}
      <ShaderBackground />
      <Component {...pageProps} />
    </>
  )
}
