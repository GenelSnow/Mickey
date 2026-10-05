import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getPerfil } from "@/lib/perfil"
import { CopyCodigo } from "@/components/recompensas/CopyCodigo"
import { Gift, Users, Star } from "lucide-react"
import Link from "next/link"

export default async function RecompensasPage() {
  const perfil = await getPerfil()
  if (!perfil) redirect("/auth/login")

  const supabase = await createClient()

  const { data: referidos } = await supabase
    .from("referidos")
    .select(`
      id,
      estado,
      puntos_otorgados,
      created_at,
      completado_at,
      perfiles:referido_id ( nombre, apellido )
    `)
    .eq("referidor_id", perfil.id)
    .order("created_at", { ascending: false })

  const { data: recompensas } = await supabase
    .from("recompensas")
    .select("*")
    .eq("activa", true)
    .order("puntos_requeridos")

  const completados = referidos?.filter((r) => r.estado === "completado").length ?? 0
  const pendientes = referidos?.filter((r) => r.estado === "pendiente").length ?? 0

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-black text-white mb-2">Mis recompensas</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Hola {perfil.nombre}, aquí ves tus puntos y referidos.
      </p>

      {/* Puntos + código */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950/80">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            <Star className="h-4 w-4 text-red-500" />
            Tus puntos
          </div>
          <p className="text-4xl font-black text-red-500">{perfil.puntos}</p>
        </div>

        <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950/80">
          <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
            <Users className="h-4 w-4 text-yellow-400" />
            Tu código de referido
          </div>
          {perfil.codigo_referido ? (
            <CopyCodigo codigo={perfil.codigo_referido} />
          ) : (
            <p className="text-zinc-500 text-sm">Sin código aún</p>
          )}
          <p className="text-xs text-zinc-600 mt-2">
            Compártelo. Ganarás 1 punto cuando esa persona complete su primer pedido (validado por el local).
          </p>
        </div>
      </div>

      {/* Resumen referidos */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">Tus referidos</h2>
        <div className="flex gap-4 text-sm mb-4">
          <span className="text-green-400">{completados} completados</span>
          <span className="text-yellow-400">{pendientes} pendientes</span>
        </div>

        {!referidos?.length ? (
          <p className="text-zinc-500 text-sm border border-zinc-800 rounded-xl p-6">
            Aún nadie ha usado tu código. Cuando lo hagan y completen un pedido, verás el punto aquí.
          </p>
        ) : (
          <ul className="space-y-3">
            {referidos.map((r) => {
              const raw = r.perfiles as
                | { nombre: string; apellido: string | null }
                | { nombre: string; apellido: string | null }[]
                | null

              const ref = Array.isArray(raw) ? raw[0] ?? null : raw
              return (
                <li
                  key={r.id}
                  className="flex items-center justify-between border border-zinc-800 rounded-xl px-4 py-3 bg-zinc-950/60"
                >
                  <div>
                    <p className="text-white font-medium">
                      {ref?.nombre ?? "Usuario"} {ref?.apellido ?? ""}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(r.created_at).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.estado === "completado"
                        ? "bg-green-500/15 text-green-400"
                        : r.estado === "pendiente"
                          ? "bg-yellow-500/15 text-yellow-400"
                          : "bg-zinc-700 text-zinc-400"
                      }`}
                  >
                    {r.estado === "completado"
                      ? `+${r.puntos_otorgados} pt`
                      : r.estado}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Catálogo de recompensas */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-red-500" />
          Canjear puntos
        </h2>
        <div className="grid gap-3">
          {recompensas?.map((rec) => {
            const puede = perfil.puntos >= rec.puntos_requeridos
            return (
              <div
                key={rec.id}
                className="flex items-center justify-between border border-zinc-800 rounded-xl px-4 py-4 bg-zinc-950/60"
              >
                <div>
                  <p className="font-semibold text-white">{rec.titulo}</p>
                  {rec.descripcion && (
                    <p className="text-sm text-zinc-500">{rec.descripcion}</p>
                  )}
                  <p className="text-xs text-red-400 mt-1">
                    {rec.puntos_requeridos} puntos
                  </p>
                </div>
                <button
                  disabled={!puede}
                  className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${puede
                      ? "bg-red-500 hover:bg-red-400 text-black"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }`}
                >
                  {puede ? "Canjear" : "Insuficiente"}
                </button>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-zinc-600 mt-4">
          El canje se confirmará en el local. (La lógica de descontar puntos la conectamos con el carrito.)
        </p>
      </section>

      <div className="mt-10">
        <Link href="/menu" className="text-red-400 text-sm hover:underline">
          ← Volver al menú
        </Link>
      </div>
    </div>
  )
}