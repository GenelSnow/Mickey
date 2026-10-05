"use client"

import { useState } from "react"
import Link from "next/link"
import { formatFechaHora } from "@/lib/fechas"
import { estiloEstado } from "@/lib/pedido-estados"

type PerfilJoin = {
  nombre: string
  apellido: string | null
  whatsapp: string
}

export type PedidoRow = {
  id: string
  total: number
  estado: string
  notas: string | null
  created_at: string
  nombre_entrega: string | null
  telefono: string | null
  codigo_referido_usado?: string | null
  es_reserva?: boolean | null
  perfiles?: PerfilJoin | PerfilJoin[] | null
}

function nombreCliente(p: PedidoRow) {
  const raw = p.perfiles
  const cliente = Array.isArray(raw) ? raw[0] ?? null : raw
  return p.nombre_entrega || cliente?.nombre || "Cliente"
}

function whatsappCliente(p: PedidoRow) {
  const raw = p.perfiles
  const cliente = Array.isArray(raw) ? raw[0] ?? null : raw
  return p.telefono || cliente?.whatsapp || "—"
}

function PedidoCard({ p, esReservaTab }: { p: PedidoRow; esReservaTab: boolean }) {
  const e = estiloEstado(p.estado)

  return (
    <li className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="font-bold text-white">{nombreCliente(p)}</p>
        <p className="text-sm text-zinc-400">WhatsApp: {whatsappCliente(p)}</p>

        {p.codigo_referido_usado && (
          <span className="text-xs text-yellow-400">
            Ref: {p.codigo_referido_usado}
          </span>
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

        <span
          className={`inline-flex items-center gap-1.5 mt-2 text-xs font-bold px-2.5 py-1 rounded-full ${e.className}`}
        >
          <span aria-hidden>{e.emoji}</span>
          {e.label}
        </span>
      </div>

      <Link
        href={`/admin/pedidos/${p.id}`}
        className="text-sm text-red-400 hover:underline shrink-0"
      >
        {esReservaTab ? "Gestionar reserva" : "Ver pedido"}
      </Link>
    </li>
  )
}

export function AdminPedidosTabs({
  activos,
  reservas,
}: {
  activos: PedidoRow[]
  reservas: PedidoRow[]
}) {
  const [tab, setTab] = useState<"activos" | "reservas">("activos")
  const list = tab === "activos" ? activos : reservas
  const esReservaTab = tab === "reservas"

  return (
    <div>
      <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mb-6">
        <button
          type="button"
          onClick={() => setTab("activos")}
          className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors ${
            tab === "activos"
              ? "bg-red-500 text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Pedidos ({activos.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("reservas")}
          className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors ${
            tab === "reservas"
              ? "bg-red-500 text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Reservas ({reservas.length})
        </button>
      </div>

      {!list.length ? (
        <p className="text-zinc-500 border border-zinc-800 rounded-xl p-8 text-center">
          {esReservaTab
            ? "No hay reservas pendientes."
            : "No hay pedidos activos."}
        </p>
      ) : (
        <ul className="space-y-4">
          {list.map((p) => (
            <PedidoCard key={p.id} p={p} esReservaTab={esReservaTab} />
          ))}
        </ul>
      )}
    </div>
  )
}