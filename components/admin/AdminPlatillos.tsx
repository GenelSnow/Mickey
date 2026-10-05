"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type Category = { id: string; name: string }
type Item = {
  id: string
  name: string
  description: string | null
  price: number
  spicy_level: number
  is_popular: boolean
  is_available: boolean
  image_url: string | null
  category_id: string
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  spicy_level: 0,
  is_popular: false,
  is_available: true,
  image_url: "",
  category_id: "",
}

export function AdminPlatillos() {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    const [c, i] = await Promise.all([
      supabase.from("categories").select("id, name").order("sort_order"),
      supabase
        .from("menu_items")
        .select(
          "id, name, description, price, spicy_level, is_popular, is_available, image_url, category_id"
        )
        .order("sort_order"),
    ])
    setCategories(c.data || [])
    setItems(i.data || [])
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(item: Item) {
    setEditId(item.id)
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      spicy_level: item.spicy_level,
      is_popular: item.is_popular,
      is_available: item.is_available,
      image_url: item.image_url || "",
      category_id: item.category_id,
    })
  }

  function cancelEdit() {
    setEditId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.category_id || !form.price) {
      toast.error("Nombre, categoría y precio son obligatorios")
      return
    }
    setLoading(true)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      spicy_level: Number(form.spicy_level),
      is_popular: form.is_popular,
      is_available: form.is_available,
      image_url: form.image_url.trim() || null,
      category_id: form.category_id,
    }

    const { error } = editId
      ? await supabase.from("menu_items").update(payload).eq("id", editId)
      : await supabase.from("menu_items").insert(payload)

    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(editId ? "Platillo actualizado" : "Platillo creado")
    cancelEdit()
    load()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 space-y-3"
      >
        <h2 className="font-bold text-white text-lg">
          {editId ? "Editar platillo" : "Crear platillo"}
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
          type="number"
          placeholder="Precio *"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm"
          required
        />
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm"
          required
        >
          <option value="">Categoría *</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          placeholder="URL imagen (Storage)"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm"
        />
        <div className="flex gap-4 text-sm text-zinc-300">
          <label className="flex items-center gap-2">
            Picante
            <select
              value={form.spicy_level}
              onChange={(e) =>
                setForm({ ...form, spicy_level: Number(e.target.value) })
              }
              className="h-9 px-2 rounded-lg bg-zinc-900 border border-zinc-700"
            >
              {[0, 1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_popular}
              onChange={(e) =>
                setForm({ ...form, is_popular: e.target.checked })
              }
            />
            Popular
          </label>
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
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-10 rounded-full bg-red-500 text-black font-bold text-sm disabled:opacity-50"
          >
            {loading ? "Guardando..." : editId ? "Actualizar" : "Crear"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="h-10 px-4 rounded-full border border-zinc-700 text-zinc-300 text-sm"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      <div className="space-y-2 max-h-[70vh] overflow-y-auto">
        <h2 className="font-bold text-white text-lg mb-2">Platillos</h2>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => startEdit(item)}
            className="w-full text-left border border-zinc-800 rounded-xl p-3 bg-zinc-950/60 hover:border-red-500/50 transition-colors"
          >
            <div className="flex justify-between gap-2">
              <span className="font-medium text-white">{item.name}</span>
              <span className="text-red-400 text-sm font-semibold">
                ${Number(item.price).toLocaleString("es-CO")}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {item.is_available ? "Disponible" : "Oculto"}
              {item.is_popular ? " · Popular" : ""}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}