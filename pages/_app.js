import '../styles/globals.css'
// import ShaderBackground from '../components/ShaderBackground'
import ThreeBackground from '../components/ThreeBackground'

export default function App({ Component, pageProps }) {
  return (
    <>
      <ThreeBackground />
      <Component {...pageProps} />
    </>
  )
}
