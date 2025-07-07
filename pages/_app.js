import '../styles/globals.css'
// import BackgroundEffect from '../components/BackgroundEffect'
// import ShaderBackground from '../components/ShaderBackground'
import Anomaly from '../components/Anomaly'

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* <BackgroundEffect /> */}
      {/* <ShaderBackground /> */}
      <Anomaly />
      <Component {...pageProps} />
    </>
  )
}
