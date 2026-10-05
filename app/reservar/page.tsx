import Link from "next/link"

export default function ReservarPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <h1 className="text-3xl font-black text-white mb-3">
        Ahora estamos cerrados
      </h1>
      <p className="text-zinc-400 text-sm mb-8">
        Pronto podrás reservar para cuando abramos. Mientras tanto puedes ver
        el menú.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/menu"
          className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-red-500 text-black font-bold text-sm"
        >
          Ver menú
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-zinc-700 text-zinc-300 text-sm"
        >
          Inicio
        </Link>
      </div>
    </div>
  )
}