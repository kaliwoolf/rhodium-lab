import '../styles/globals.css'
import BackgroundEffect from '../components/BackgroundEffect'

export default function App({ Component, pageProps }) {
  return (
    <>
      <BackgroundEffect />
      <Component {...pageProps} />
    </>
  )
}
