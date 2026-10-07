
import { GoogleReviewsBadge } from "@/components/esec/GoogleReviewsBadge"

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter text-white uppercase">
                Mic<span className="text-red-500">key</span><span className="text-yellow-500"> House</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm">
              La mejor comida rápida de Valledupar
            </p>
          </div>
          <div>
            <span className="text-zinc-500 text-sm">
              Te gustó nuestro servicio? Déjanos tu reseña en Google y ayúdanos a mejorar.
            </span>
          </div>
            <GoogleReviewsBadge />
        </div>
        <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} Mickey. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}