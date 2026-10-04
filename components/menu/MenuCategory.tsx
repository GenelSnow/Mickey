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
}

export function MenuCategory({ category }: Props) {
  const isMielMostaza = category.name.toLowerCase().includes("miel")
  const accentColor = isMielMostaza ? "text-yellow-400" : "text-orange-500"
  const borderColor = isMielMostaza ? "border-yellow-500/30" : "border-orange-500/30"

  return (
    <section className="mb-16">
      {/* Título de categoría */}
      <div className={`mb-8 pb-4 border-b ${borderColor}`}>
        <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tight ${accentColor}`}>
          {category.name}
        </h2>
        {category.description && (
          <p className="text-zinc-400 mt-2 text-sm md:text-base max-w-xl">
            {category.description}
          </p>
        )}
      </div>

      {/* Grid de items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.menu_items
          ?.sort((a, b) => a.sort_order - b.sort_order)
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
                accent={isMielMostaza ? "yellow" : "orange"}
                priority={index === 0}
              />
            )
          })}
      </div>
    </section>
  )
}