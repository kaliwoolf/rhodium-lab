import Image from 'next/image'

export default function ContactBlock() {
  return (
    <section className="relative text-white py-24 px-6 flex flex-col items-center gap-10">
      {/* 🌈 Фон-ореол должен быть ВНУТРИ этой секции, но до всего остального */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-fuchsia-800/10 rounded-[64px] blur-3xl pointer-events-none z-[-1]" />

      {/* Остальной контент */}
      <div className="uppercase tracking-widest text-sm text-white/60 flex items-center gap-2">
        <span className="text-white/40">✦</span>
        СВЯЗАТЬСЯ
        <span className="text-white/40">✦</span>
      </div>

      <a
        href="mailto:hi@rhodium.vision"
        className="text-3xl md:text-4xl font-mono font-light tracking-[0.3em] hover:text-fuchsia-400 transition"
      >
        HI@RHODIUM.VISION
      </a>

      <div className="relative w-[180px] h-[220px] rounded-xl overflow-hidden border border-white/20 shadow-xl">
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
    </section>
  )
}
