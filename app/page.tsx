import Link from "next/link"
import { Flame, Percent, Gift, Star, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let nombreSaludo: string | null = null
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("nombre")
      .eq("id", user.id)
      .maybeSingle()

    nombreSaludo =
      perfil?.nombre ??
      (typeof user.user_metadata?.nombre === "string"
        ? user.user_metadata.nombre
        : null)
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col">
      <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/15 border border-red-500/40 text-red-400 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <Flame className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            Bienvenido a Mickey
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
            La mejor comida
            <span className="block text-red-500 mt-2">
              rápida de{" "}
              <span className="text-yellow-400">Valledupar</span>
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Hamburguesas, perros, salchipapas, pizza y más. Preparado al momento,
            con el sabor que te hace volver.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-base px-8 h-12 rounded-full transition-colors"
            >
              Ver menú
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/573165542426"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-green-500 text-white font-medium text-base px-8 h-12 rounded-full transition-colors hover:text-green-400"
            >
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900 bg-zinc-950/80">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {user ? "Tus beneficios de miembro" : "¿Tienes cuenta?"}
            </h2>
            <p className="text-zinc-400 mt-2 max-w-xl mx-auto">
              {user
                ? `Hola ${nombreSaludo ?? "amigo"}, ya tienes acceso a descuentos y promociones exclusivas.`
                : "Si inicias sesión o creas una cuenta obtienes beneficios exclusivos en cada pedido."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/50 hover:border-red-500/40 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-red-600/15 flex items-center justify-center mb-4">
                <Percent className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="font-bold text-white text-lg">Descuentos</h3>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                Precios especiales y descuentos solo para miembros registrados.
              </p>
            </div>

            <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/50 hover:border-yellow-500/40 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="font-bold text-white text-lg">Promociones</h3>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                Combos, ofertas de temporada y promociones anticipadas.
              </p>
            </div>

            <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/50 hover:border-red-500/40 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-red-600/15 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="font-bold text-white text-lg">Puntos y recompensas</h3>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                Acumula puntos con cada compra y canjéalos por premios en Mickey.
              </p>
            </div>
          </div>

          {!user && (
            <div className="mt-10 text-center">
              <p className="text-zinc-500 text-sm mb-4">
                ¿Aún no tienes cuenta? Crea una en segundos.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center justify-center bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 h-10 rounded-full transition-colors"
                >
                  Crear cuenta
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium text-sm px-6 h-10 rounded-full transition-colors"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}