import '../styles/globals.css'
import ShaderBackground from '../components/ShaderBackground'

export default function App({ Component, pageProps }) {
  return (
    <>
      <ShaderBackground />
      <Component {...pageProps} />
    </>
  )
}
