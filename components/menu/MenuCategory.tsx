"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { MenuItem } from "./MenuItem"

type MenuItemType = {
  id: string
  name: string
  description: string | null
  price: number
  spicy_level: number
  is_popular: boolean
  image_url: string | null
  sort_order: number
}

type CategoryType = {
  id: string
  name: string
  description: string | null
  menu_items: MenuItemType[]
}

interface Props {
  category: CategoryType
  /** Primera categoría abierta por defecto en móvil */
  defaultOpen?: boolean
}

export function MenuCategory({ category, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const isMielMostaza = category.name.toLowerCase().includes("miel")
  const accentColor = isMielMostaza ? "text-yellow-400" : "text-red-500"
  const borderColor = isMielMostaza ? "border-yellow-500/30" : "border-red-500/30"
  const count = category.menu_items?.length ?? 0

  return (
    <section className="mb-4 md:mb-16">
      {/* —— Móvil: botón desplegable —— */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`md:hidden w-full flex items-center justify-between gap-3 py-3.5 px-1 border-b ${borderColor} text-left`}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h2 className={`text-xl font-black uppercase tracking-tight ${accentColor}`}>
            {category.name}
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            {count} producto{count !== 1 ? "s" : ""}
          </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* —— Desktop: título siempre visible —— */}
      <div className={`hidden md:block mb-8 pb-4 border-b ${borderColor}`}>
        <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tight ${accentColor}`}>
          {category.name}
        </h2>
        {category.description && (
          <p className="text-zinc-400 mt-2 text-sm md:text-base max-w-xl">
            {category.description}
          </p>
        )}
      </div>

      {/* —— Grid: 2 cols móvil, 2 md, 3 lg —— */}
      <div
        className={`${
          open ? "block" : "hidden"
        } md:block mt-3 md:mt-0`}
      >
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
          {category.menu_items
            ?.slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((item, index) => {
              const imageUrl = item.image_url
                ? item.image_url.startsWith("http")
                  ? item.image_url
                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${item.image_url}`
                : undefined

              return (
                <MenuItem
                  key={item.id}
                  item={{
                    id: item.id,
                    name: item.name,
                    description: item.description || "",
                    price: Number(item.price),
                    spicyLevel: item.spicy_level,
                    popular: item.is_popular,
                    image: imageUrl,
                    image_url: item.image_url,
                  }}
                  accent={isMielMostaza ? "yellow" : "red"}
                  priority={index === 0 && open}
                  compact
                />
              )
            })}
        </div>
      </div>
    </section>
  )
}