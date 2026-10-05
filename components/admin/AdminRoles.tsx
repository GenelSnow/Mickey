"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type Usuario = {
  id: string
  nombre: string
  apellido: string | null
  whatsapp: string
  rol: string
  codigo_referido: string | null
  puntos: number
}

const ROLES = [
  { value: "usuario", label: "Usuario" },
  { value: "empleado", label: "Empleado" },
  { value: "dueño", label: "Dueño" },
  { value: "developer", label: "Developer" },
] as const

export function AdminRoles() {
  const supabase = createClient()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [drafts, setDrafts] = useState<
    Record<string, { rol: string; puntos: string; codigo_referido: string }>
  >({})
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function load() {
    const { data, error } = await supabase
      .from("perfiles")
      .select("id, nombre, apellido, whatsapp, rol, codigo_referido, puntos")
      .order("nombre")

    if (error) {
      toast.error(error.message)
      return
    }

    const list = data || []
    setUsuarios(list)

    const d: typeof drafts = {}
    list.forEach((u) => {
      d[u.id] = {
        rol: u.rol,
        puntos: String(u.puntos ?? 0),
        codigo_referido: u.codigo_referido ?? "",
      }
    })
    setDrafts(d)
  }

  useEffect(() => {
    load()
  }, [])

  function updateDraft(
    id: string,
    field: "rol" | "puntos" | "codigo_referido",
    value: string
  ) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  async function guardar(id: string) {
    const d = drafts[id]
    if (!d) return

    const codigo = d.codigo_referido.trim().toUpperCase() || null
    const puntosNum = Number(d.puntos)

    if (Number.isNaN(puntosNum) || puntosNum < 0) {
      toast.error("Puntos inválidos")
      return
    }

    setLoadingId(id)

    const { error } = await supabase
      .from("perfiles")
      .update({
        rol: d.rol,
        puntos: puntosNum,
        codigo_referido: codigo,
      })
      .eq("id", id)

    setLoadingId(null)

    if (error) {
      // unique violation en codigo_referido
      if (error.code === "23505") {
        toast.error("Ese código de referido ya está en uso")
      } else {
        toast.error(error.message)
      }
      return
    }

    toast.success("Usuario actualizado")
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              rol: d.rol,
              puntos: puntosNum,
              codigo_referido: codigo,
            }
          : u
      )
    )
  }

  const filtrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase().trim()
    if (!q) return true
    return (
      u.nombre?.toLowerCase().includes(q) ||
      u.apellido?.toLowerCase().includes(q) ||
      u.whatsapp?.includes(q) ||
      u.codigo_referido?.toLowerCase().includes(q)
    )
  })

  const inputClass =
    "h-9 px-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500 w-full"

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-white text-lg">Usuarios</h2>
          <p className="text-xs text-zinc-500">
            Cambia rol, puntos y código de referido. Luego pulsa Guardar.
          </p>
        </div>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar..."
          className="h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm w-full sm:w-72 focus:outline-none focus:border-red-500"
        />
      </div>

      <div className="border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-left">
                <th className="px-3 py-3 font-medium">Usuario</th>
                <th className="px-3 py-3 font-medium">WhatsApp</th>
                <th className="px-3 py-3 font-medium">Código</th>
                <th className="px-3 py-3 font-medium">Puntos</th>
                <th className="px-3 py-3 font-medium">Rol</th>
                <th className="px-3 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => {
                const d = drafts[u.id] || {
                  rol: u.rol,
                  puntos: String(u.puntos),
                  codigo_referido: u.codigo_referido || "",
                }
                return (
                  <tr
                    key={u.id}
                    className="border-b border-zinc-800/80 hover:bg-zinc-900/40"
                  >
                    <td className="px-3 py-2 text-white font-medium whitespace-nowrap">
                      {u.nombre} {u.apellido || ""}
                    </td>
                    <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">
                      {u.whatsapp}
                    </td>
                    <td className="px-3 py-2 min-w-[130px]">
                      <input
                        value={d.codigo_referido}
                        onChange={(e) =>
                          updateDraft(
                            u.id,
                            "codigo_referido",
                            e.target.value.toUpperCase()
                          )
                        }
                        className={inputClass + " font-mono"}
                        placeholder="MICXXXX"
                      />
                    </td>
                    <td className="px-3 py-2 w-24">
                      <input
                        type="number"
                        min={0}
                        value={d.puntos}
                        onChange={(e) =>
                          updateDraft(u.id, "puntos", e.target.value)
                        }
                        className={inputClass}
                      />
                    </td>
                    <td className="px-3 py-2 w-36">
                      <select
                        value={d.rol}
                        onChange={(e) =>
                          updateDraft(u.id, "rol", e.target.value)
                        }
                        className={inputClass}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        disabled={loadingId === u.id}
                        onClick={() => guardar(u.id)}
                        className="h-9 px-3 rounded-full bg-red-500 hover:bg-red-400 text-black text-xs font-bold disabled:opacity-50 whitespace-nowrap"
                      >
                        {loadingId === u.id ? "..." : "Guardar"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}