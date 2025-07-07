import '../styles/globals.css'
// import BackgroundEffect from '../components/BackgroundEffect'
import ShaderBackground from '../components/ShaderBackground'
import Saturn from '../components/Saturn'


export default function App({ Component, pageProps }) {
  return (
    <>
      {/* <BackgroundEffect /> */}
      <ShaderBackground />
      <Saturn />
      <Component {...pageProps} />
    </>
  )
}
