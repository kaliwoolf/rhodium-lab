import Image from 'next/image'
import QR from '@/public/qr-code.png' // заранее сгенерируй QR и положи в /public

export default function ContactBlock() {
  return (
    <section className="relative text-white py-16 px-6 flex flex-col items-center gap-6">
      <div className="uppercase tracking-widest text-sm text-white/60 flex items-center gap-2">
        <span className="text-white/40">✦</span>
        CONTACT US
        <span className="text-white/40">✦</span>
      </div>

      <a
        href="mailto:hi@rhodium.vision"
        className="text-3xl md:text-4xl font-mono font-light tracking-[0.3em] hover:text-fuchsia-400 transition"
      >
        HI@RHODIUM.VISION
      </a>

      <div className="relative max-w-md rounded-xl p-6 border border-white/15 bg-white/5 backdrop-blur-[18px] backdrop-brightness-90 shadow-[inset_0_0_80px_rgba(255,255,255,0.05),_0_0_40px_rgba(0,0,0,0.2)]">
        <Image src={QR} alt="QR" width={120} height={120} />
        <p className="text-xs text-white/50 text-center mt-2">[ MOBILE SYNC ]</p>
      </div>


      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-fuchsia-800/10 rounded-xl blur-3xl pointer-events-none z-[-1]" />
    </section>
  )
}
