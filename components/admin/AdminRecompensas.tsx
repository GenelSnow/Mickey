"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type Rew = {
  id: string
  titulo: string
  descripcion: string | null
  puntos_requeridos: number
  activa: boolean
}

export function AdminRecompensas() {
  const supabase = createClient()
  const [list, setList] = useState<Rew[]>([])
  const [editId, setEditId] = useState<string | null>(null)
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [puntos, setPuntos] = useState("")
  const [activa, setActiva] = useState(true)
  const [loading, setLoading] = useState(false)

  async function load() {
    const { data, error } = await supabase
      .from("recompensas")
      .select("id, titulo, descripcion, puntos_requeridos, activa")
      .order("puntos_requeridos")

    if (error) {
      toast.error(error.message)
      return
    }
    setList(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(r: Rew) {
    setEditId(r.id)
    setTitulo(r.titulo ?? "")
    setDescripcion(r.descripcion ?? "")
    setPuntos(String(r.puntos_requeridos ?? ""))
    setActiva(r.activa ?? true)
  }

  function reset() {
    setEditId(null)
    setTitulo("")
    setDescripcion("")
    setPuntos("")
    setActiva(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !puntos) {
      toast.error("Título y puntos son obligatorios")
      return
    }

    setLoading(true)
    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      puntos_requeridos: Number(puntos),
      activa,
    }

    const { error } = editId
      ? await supabase.from("recompensas").update(payload).eq("id", editId)
      : await supabase.from("recompensas").insert(payload)

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(editId ? "Recompensa actualizada" : "Recompensa creada")
    reset()
    load()
  }

  const inputClass =
    "w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500"

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 space-y-4"
      >
        <h2 className="font-bold text-white text-lg">
          {editId ? "Editar recompensa" : "Crear recompensa"}
        </h2>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Título *</label>
          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={inputClass}
            placeholder="Ej: Descuento 10%"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500 resize-none"
            placeholder="Detalle opcional"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">
            Puntos requeridos *
          </label>
          <input
            required
            type="number"
            min={1}
            value={puntos}
            onChange={(e) => setPuntos(e.target.value)}
            className={inputClass}
            placeholder="Ej: 12"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={activa}
            onChange={(e) => setActiva(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-600"
          />
          Activa
        </label>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-10 rounded-full bg-red-500 hover:bg-red-400 text-black font-bold text-sm disabled:opacity-50"
          >
            {loading ? "Guardando..." : editId ? "Actualizar" : "Crear"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={reset}
              className="h-10 px-4 rounded-full border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        <h2 className="font-bold text-white text-lg mb-2">Listado</h2>
        {list.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => startEdit(r)}
            className="w-full text-left border border-zinc-800 rounded-xl p-3 bg-zinc-950/60 hover:border-red-500/50 transition-colors"
          >
            <div className="flex justify-between gap-2">
              <span className="font-medium text-white">{r.titulo}</span>
              <span className="text-red-400 text-sm font-semibold shrink-0">
                {r.puntos_requeridos} pts
              </span>
            </div>
            {r.descripcion && (
              <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                {r.descripcion}
              </p>
            )}
            {!r.activa && (
              <span className="text-xs text-zinc-500 mt-1 inline-block">
                Inactiva
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}