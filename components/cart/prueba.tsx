import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getPerfil, esStaff } from "@/lib/perfil"
import Link from "next/link";
import { estiloEstado } from "@/lib/pedido-mensajes"
import { formatFechaHora } from "@/lib/fechas"



export default async function AdminPedidosPage() {
  const perfil = await getPerfil()
  if (!perfil) redirect("/auth/login")
  if (!esStaff(perfil.rol)) redirect("/")

  const supabase = await createClient()

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(`
      id, total, estado, notas, created_at,
      nombre_entrega, telefono, codigo_referido_usado, es_reserva,
      perfiles:cliente_id ( nombre, apellido, whatsapp )
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  const lista = pedidos || []
  const reservas = lista.filter(
    (p) => p.estado === "reservado" || p.es_reserva === true
  )
  const activos = lista.filter(
    (p) => p.estado !== "reservado" && p.estado !== "cancelado"
  )

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-black text-white mb-2">Pedidos</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Marca como completado solo cuando el cliente ya recibió / pagó el pedido.
        Eso activa el punto de referido si aplica.
      </p>

      {!pedidos?.length ? (
        <p className="text-zinc-500 border border-zinc-800 rounded-xl p-8 text-center">
          No hay pedidos aún. Cuando exista el carrito, aparecerán aquí.
        </p>
      ) : (
        <ul className="space-y-4">
          {pedidos.map((p) => {
            const raw = p.perfiles as
              | { nombre: string; apellido: string | null; whatsapp: string }
              | { nombre: string; apellido: string | null; whatsapp: string }[]
              | null

            const cliente = Array.isArray(raw) ? raw[0] ?? null : raw

            return (
              <li
                key={p.id}
                className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-white">
                    {p.nombre_entrega || cliente?.nombre || "Cliente"}
                  </p>
                  <p className="text-sm text-zinc-400">
                    WhatsApp: {p.telefono || cliente?.whatsapp || "—"}
                  </p>
                  {p.codigo_referido_usado && (
                    <span className="text-xs text-yellow-400">Ref: {p.codigo_referido_usado}</span>
                  )}
                  <p className="text-sm text-zinc-500 mt-1">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(Number(p.total))}
                    {" · "}
                    {formatFechaHora(p.created_at)}
                  </p>
                  {p.notas && (
                    <p className="text-xs text-zinc-500 mt-1">Nota: {p.notas}</p>
                  )}
                  {(() => {
                    const e = estiloEstado(p.estado)
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 mt-2 text-xs font-bold px-2.5 py-1 rounded-full ${e.className}`}
                      >
                        <span aria-hidden>{e.emoji}</span>
                        {e.label}
                      </span>
                    )
                  })()}
                </div>

                <Link
                  href={`/admin/pedidos/${p.id}`}
                  className="text-sm text-red-400 hover:underline"
                >
                  Ver pedido
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}