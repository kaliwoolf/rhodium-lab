import Image from 'next/image'

export default function ContactBlock() {
  return (
    <section className="relative text-white min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden">
      {/* Видео-подложка-панель */}
      <div className="absolute left-1/2 top-1/2 w-full max-w-3xl h-[400px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl z-[-1] shadow-[0_0_120px_rgba(255,255,255,0.08)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-80"
          src="/video/ice.mp4"
        />
      </div>

      {/* Контент */}
      <div className="flex flex-col items-center gap-10 z-10">
        <div className="uppercase tracking-widest text-sm text-white/60 flex items-center gap-2">
          <span className="text-white/40">✦</span>
          СВЯЗАТЬСЯ
          <span className="text-white/40">✦</span>
        </div>

        <a
          href="mailto:hi@rhodium.vision"
          className="text-2xl md:text-4xl font-mono font-light tracking-[0.15em] md:tracking-[0.3em] text-center"
        >
          HI@RHODIUM.VISION
        </a>

        <div className="relative w-[160px] sm:w-[180px] h-[200px] sm:h-[220px] rounded-xl overflow-hidden border border-white/20 shadow-xl">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            src="/video/ice.mp4"
          />
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
            <Image src="/qr-code.png" width={120} height={120} alt="QR" />
            <p className="text-xs text-white/60 text-center mt-3 tracking-widest">[ MOBILE SYNC ]</p>
          </div>
        </div>
      </div>
    </section>
  )
}
