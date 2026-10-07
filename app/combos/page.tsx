import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import Link from "next/link"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { Sparkles } from "lucide-react"

export const revalidate = 60

function buildImageUrl(path: string | null) {
  if (!path) return null
  if (path.startsWith("http")) return path
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return base ? `${base}/storage/v1/object/public/${path}` : null
}

export default async function CombosPage() {
  const supabase = await createClient()
  const { data: combos, error } = await supabase
    .from("combos")
    .select("*")
    .eq("is_available", true)
    .order("sort_order")

  if (error) {
    return (
      <div className="container mx-auto py-20 text-center text-red-500">
        Error al cargar combos
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          Combos & <span className="text-yellow-400">promos</span>
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Ahorra pidiendo en combo. Agrega al carrito como cualquier producto.
        </p>
      </div>

      {!combos?.length ? (
        <p className="text-zinc-500">Pronto habrá promociones aquí.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {combos.map((c) => {
            const img = buildImageUrl(c.image_url)
            const price = new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
            }).format(Number(c.price))

            return (
              <div
                key={c.id}
                className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/80 flex flex-col"
              >
                <div className="relative h-28 md:h-44 bg-zinc-900">
                  {img ? (
                    <Image
                      src={img}
                      alt={c.name}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 50vw, 33vw"
                    />
                  ) : null}
                  {c.is_featured && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                      <Sparkles className="h-3 w-3" />
                      Promo
                    </span>
                  )}
                </div>
                <div className="p-3 md:p-5 flex flex-col gap-2 flex-1">
                  <h2 className="font-bold text-white text-sm md:text-lg line-clamp-2">
                    {c.name}
                  </h2>
                  {c.items_label && (
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {c.items_label}
                    </p>
                  )}
                  {c.description && (
                    <p className="hidden sm:block text-sm text-zinc-400 line-clamp-2">
                      {c.description}
                    </p>
                  )}
                  <div className="mt-auto pt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <span className="font-black text-red-500 text-sm md:text-xl">
                      {price}
                    </span>
                    <AddToCartButton
                      id={`combo-${c.id}`}
                      name={`Combo: ${c.name}`}
                      price={Number(c.price)}
                      image_url={c.image_url}
                      className="w-full md:w-auto inline-flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white text-xs md:text-sm font-bold px-3 h-9"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/menu" className="text-sm text-zinc-400 hover:text-red-400">
          ← Volver al menú
        </Link>
      </div>
    </div>
  )
}