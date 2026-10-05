import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Flame, Crown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AddToCartButton } from "@/components/cart/AddToCartButton"

type MenuItemData = {
  id: string
  name: string
  description: string
  price: number
  spicyLevel?: number
  popular?: boolean
  image?: string
  image_url?: string | null
}

interface Props {
  item: MenuItemData
  accent?: "red" | "yellow"
  priority?: boolean
  /** Cards más chicas (móvil 2 columnas) */
  compact?: boolean
}

export function MenuItem({
  item,
  accent = "red",
  priority = false,
  compact = false,
}: Props) {
  const isYellow = accent === "yellow"
  const priceColor = isYellow ? "text-yellow-400" : "text-red-500"
  const badgeColor = isYellow
    ? "bg-yellow-500 text-black"
    : "bg-red-600 text-white"
  const flameColor = isYellow
    ? "fill-yellow-400 text-yellow-400"
    : "fill-red-500 text-red-500"

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(item.price)

  return (
    <Link href={`/comida/${item.id}`} className="block h-full">
      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 transition-all duration-300 group cursor-pointer h-full flex flex-col">
        {/* Imagen: más baja en móvil */}
        {item.image ? (
          <div
            className={`relative w-full overflow-hidden ${
              compact ? "h-28 sm:h-36 md:h-52" : "h-52"
            }`}
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              quality={70}
            />
            {item.popular && (
              <Badge
                className={`absolute top-1.5 left-1.5 md:top-3 md:left-3 ${badgeColor} font-bold text-[10px] md:text-xs px-1.5 py-0.5`}
              >
                <Crown className="h-3 w-3 mr-0.5" />
                <span className="hidden xs:inline">Popular</span>
              </Badge>
            )}
          </div>
        ) : (
          <div
            className={`w-full bg-zinc-900 flex items-center justify-center ${
              compact ? "h-28 sm:h-36 md:h-52" : "h-52"
            }`}
          >
            <span className="text-zinc-600 text-xs">Sin imagen</span>
          </div>
        )}

        <CardContent
          className={`flex flex-col gap-1.5 md:gap-3 flex-1 ${
            compact ? "p-2.5 sm:p-3 md:p-5" : "p-5"
          }`}
        >
          <div className="min-w-0">
            <h3
              className={`font-bold tracking-tight text-white group-hover:text-red-400 transition-colors line-clamp-2 ${
                compact ? "text-sm md:text-lg" : "text-lg"
              }`}
            >
              {item.name}
            </h3>
            {/* Descripción solo desde sm (en 2 cols móvil no cabe bien) */}
            <p className="hidden sm:block text-sm text-zinc-400 mt-1 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>

          {item.spicyLevel !== undefined && item.spicyLevel > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: item.spicyLevel }).map((_, i) => (
                <Flame key={i} className={`h-3 w-3 md:h-4 md:w-4 ${flameColor}`} />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 mt-auto pt-1 md:flex-row md:items-center md:justify-between md:gap-3 md:pt-2">
            <span
              className={`font-black ${priceColor} ${
                compact ? "text-sm md:text-xl" : "text-xl"
              }`}
            >
              {formattedPrice}
            </span>
            <AddToCartButton
              id={item.id}
              name={item.name}
              price={item.price}
              image_url={item.image_url ?? item.image ?? null}
              label={compact ? "+" : undefined}
              className={`shrink-0 inline-flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 text-white font-bold transition-colors ${
                compact
                  ? "w-full md:w-auto text-xs px-2 h-8 md:text-sm md:px-4 md:h-9"
                  : "text-sm px-4 h-9"
              }`}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}