"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type Combo = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  items_label: string | null
  is_available: boolean
  is_featured: boolean
  sort_order: number
}

const empty = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  items_label: "",
  is_available: true,
  is_featured: false,
  sort_order: "0",
}

export function AdminCombos() {
  const supabase = createClient()
  const [list, setList] = useState<Combo[]>([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    const { data, error } = await supabase
      .from("combos")
      .select("*")
      .order("sort_order")
    if (error) {
      toast.error(error.message)
      return
    }
    setList(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(c: Combo) {
    setEditId(c.id)
    setForm({
      name: c.name,
      description: c.description || "",
      price: String(c.price),
      image_url: c.image_url || "",
      items_label: c.items_label || "",
      is_available: c.is_available,
      is_featured: c.is_featured,
      sort_order: String(c.sort_order),
    })
  }

  function cancel() {
    setEditId(null)
    setForm(empty)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.price) {
      toast.error("Nombre y precio obligatorios")
      return
    }
    setLoading(true)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      image_url: form.image_url.trim() || null,
      items_label: form.items_label.trim() || null,
      is_available: form.is_available,
      is_featured: form.is_featured,
      sort_order: Number(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    }

    const { error } = editId
      ? await supabase.from("combos").update(payload).eq("id", editId)
      : await supabase.from("combos").insert(payload)

    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(editId ? "Combo actualizado" : "Combo creado")
    cancel()
    load()
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este combo?")) return
    const { error } = await supabase.from("combos").delete().eq("id", id)
    if (error) toast.error(error.message)
    else {
      toast.success("Eliminado")
      if (editId === id) cancel()
      load()
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 space-y-3"
      >
        <h2 className="font-bold text-white text-lg">
          {editId ? "Editar combo" : "Nuevo combo / promo"}
        </h2>

        <input
          placeholder="Nombre *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm"
          required
        />
        <textarea
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm resize-none"
        />
        <input
          placeholder="Qué incluye (ej. Burger + papas + gaseosa)"
          value={form.items_label}
          onChange={(e) => setForm({ ...form, items_label: e.target.value })}
          className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm"
        />
        <input
          type="number"
          placeholder="Precio *"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm"
          required
        />
        <input
          placeholder="Imagen (comida/combo.webp)"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm"
        />
        <input
          type="number"
          placeholder="Orden"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
          className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm"
        />

        <div className="flex gap-4 text-sm text-zinc-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) =>
                setForm({ ...form, is_available: e.target.checked })
              }
            />
            Disponible
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) =>
                setForm({ ...form, is_featured: e.target.checked })
              }
            />
            Destacado
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-10 rounded-full bg-red-600 text-white font-bold text-sm disabled:opacity-50"
          >
            {loading ? "Guardando..." : editId ? "Actualizar" : "Crear"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={cancel}
              className="h-10 px-4 rounded-full border border-zinc-700 text-zinc-300 text-sm"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2 max-h-[70vh] overflow-y-auto">
        <h2 className="font-bold text-white text-lg mb-2">Combos</h2>
        {list.length === 0 && (
          <p className="text-zinc-500 text-sm">Aún no hay combos.</p>
        )}
        {list.map((c) => (
          <div
            key={c.id}
            className="border border-zinc-800 rounded-xl p-3 bg-zinc-950/60 flex justify-between gap-2"
          >
            <button
              type="button"
              onClick={() => startEdit(c)}
              className="text-left min-w-0 flex-1"
            >
              <div className="flex justify-between gap-2">
                <span className="font-medium text-white truncate">{c.name}</span>
                <span className="text-red-400 text-sm font-semibold shrink-0">
                  ${Number(c.price).toLocaleString("es-CO")}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {c.is_available ? "Disponible" : "Oculto"}
                {c.is_featured ? " · Destacado" : ""}
                {c.items_label ? ` · ${c.items_label}` : ""}
              </p>
            </button>
            <button
              type="button"
              onClick={() => remove(c.id)}
              className="text-xs text-red-400 hover:text-red-300 shrink-0 px-2"
            >
              Borrar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}