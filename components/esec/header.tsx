import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { AuthButtons } from "./AuthButtons"
import { CartButton } from "./shopicon"
import { EstadoLocal } from "@/components/esec/EstadoLocal"

const WA = "https://wa.me/573165542426"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let nombre: string | null = null
  let rol: string | null = null

  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("nombre, rol")
      .eq("id", user.id)
      .single()

    nombre = perfil?.nombre ?? user.user_metadata?.nombre ?? "Usuario"
    rol = perfil?.rol ?? "usuario"
  }

  return (
    <header className="sticky top-0 z-50 border-b border-red-900/40 bg-black/90 backdrop-blur-md">
      <div className="container mx-auto px-3 sm:px-4 py-2.5 md:py-3">
        {/*
          Móvil: 2 filas
          Desktop (md+): 1 sola fila
        */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
          {/* —— Fila superior móvil / izquierda desktop —— */}
          <div className="flex items-center justify-between gap-2 md:contents">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0 order-1"
            >
              <div className="h-8 w-8 rounded-full border border-red-500/40 bg-red-500 flex items-center justify-center shrink-0">
                <span className="text-black font-black text-sm">M</span>
              </div>
              <span className="text-base sm:text-xl font-black tracking-tighter text-white uppercase truncate">
                Mickey House
              </span>
            </Link>

            {/* Estado — solo desktop aquí (en móvil va abajo) */}
            <div className="hidden md:flex order-2 shrink-0">
              <EstadoLocal />
            </div>

            {/* Nav — solo desktop en esta zona */}
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium order-3">
              <Link
                href="/menu"
                className="text-zinc-300 hover:text-red-400 transition-colors"
              >
                Menú
              </Link>
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-green-400 transition-colors"
              >
                Pedir
              </a>
              <Link
                href="/recompensas"
                className="text-zinc-300 hover:text-red-400 transition-colors"
              >
                Recompensas
              </Link>

              <Link
                href="/combos"
                className="text-zinc-300 hover:text-yellow-400 transition-colors"
              >
                Combos
              </Link>
            </nav>

            {/* Auth + carrito + WA */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 order-4">
              <AuthButtons nombre={nombre} rol={rol} />
              <CartButton />
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-3 py-1.5 rounded-full transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* —— Solo móvil: estado + nav —— */}
          <div className="flex flex-col items-center gap-2 md:hidden">
            <EstadoLocal compact />
            <nav className="flex items-center justify-center gap-4 text-xs font-medium">
              <Link
                href="/menu"
                className="text-zinc-300 hover:text-red-400 transition-colors"
              >
                Menú
              </Link>
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-green-400 transition-colors"
              >
                Pedir
              </a>
              <Link
                href="/recompensas"
                className="text-zinc-300 hover:text-red-400 transition-colors"
              >
                Recompensas
              </Link>

              <Link
                href="/combos"
                className="text-zinc-300 hover:text-yellow-400 transition-colors"
              >
                Combos
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}