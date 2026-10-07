import { Flame } from "lucide-react"

const GOOGLE_REVIEWS_URL =
  "https://share.google/hJlhpdltxUJKKBrwB"

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="text-xl font-black tracking-tighter text-white uppercase">
                Mic<span className="text-red-500">key</span><span className="text-yellow-500"> House</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm">
              La mejor comida rápida de Valledupar
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-zinc-400 text-sm mb-1">¿Te gustó Mickey?</p>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-yellow-400 font-bold text-lg hover:text-yellow-300 hover:underline transition-colors"
            >
              <span aria-hidden>★</span>
              Déjanos tu reseña en Google
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} Mickey House. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}