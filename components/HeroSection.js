export default function HeroSection() {
  return (
    <main className="bg-transparent min-h-screen flex flex-col items-center justify-center text-white font-sans relative z-10">
      <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-bold tracking-[0.15em] text-center leading-tight backdrop-blur-sm">
        RHODIUM LAB
      </h1>

      <p className="mt-4 text-sm md:text-base text-white opacity-60 tracking-wide backdrop-blur text-center px-4">
        Изымаем хаос. <br className="md:hidden" />
        Создаём структуры, в которых можно жить и думать.
      </p>
    </main>
  )
}
