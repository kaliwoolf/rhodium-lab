import Image from 'next/image'

export default function ContactBlock() {
  return (
    <section className="relative text-white min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-24 gap-10 overflow-hidden">

      {/* 🎥 Видеофон для всей секции */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-80 z-[-2]"
        src="/video/ice.mp4"
      />

      {/* 🌫️ Мягкий стеклянный ореол поверх видео */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-fuchsia-800/10 blur-3xl z-[-1]" />

      {/* ✉️ Заголовок */}
      <div className="uppercase tracking-widest text-sm text-white/60 flex items-center gap-2">
        <span className="text-white/40">✦</span>
        СВЯЗАТЬСЯ
        <span className="text-white/40">✦</span>
      </div>

      {/* 📧 Email */}
      <a
        href="mailto:hi@rhodium.vision"
        className="text-2xl md:text-4xl font-mono font-light tracking-[0.15em] md:tracking-[0.3em] text-center"
      >
        HI@RHODIUM.VISION
      </a>

      {/* 📱 QR-код в стеклянной карточке */}
      <div className="relative w-[160px] sm:w-[180px] h-[200px] sm:h-[220px] rounded-xl overflow-hidden border border-white/20 shadow-xl backdrop-blur-xl backdrop-brightness-90">
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
          <Image src="/qr-code.png" width={120} height={120} alt="QR" />
          <p className="text-xs text-white/60 text-center mt-3 tracking-widest">[ MOBILE SYNC ]</p>
        </div>
      </div>
    </section>
  )
}
