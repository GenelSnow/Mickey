import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Flame, Crown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AddToCartButton } from "@/components/cart/AddToCartButton"

interface Props {
  item: MenuItemData
  accent?: "red" | "yellow"
}

type MenuItemData = {
  id: string
  name: string
  description: string
  price: number
  spicyLevel?: number
  popular?: boolean
  image?: string
  image_url?: string | null  // añadir esto
}

export function MenuItem({ item, accent = "red" }: Props) {
  const isYellow = accent === "yellow"

  const priceColor = isYellow ? "text-yellow-400" : "text-red-500"
  const badgeColor = isYellow
    ? "bg-yellow-500 hover:bg-yellow-600 text-black"
    : "bg-red-500 hover:bg-red-600 text-white"
  const flameColor = isYellow ? "fill-yellow-400 text-yellow-400" : "fill-red-500 text-red-500"

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(item.price)

  return (
    <Link href={`/comida/${item.id}`}>
      <Card className="overflow-hidden border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/20 group cursor-pointer h-full">
        {item.image ? (
          <div className="relative h-52 w-full overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="eager"   // o priority
              quality={75}
            />
            {item.popular && (
              <Badge className={`absolute top-3 left-3 ${badgeColor} font-bold`}>
                <Crown className="h-3.5 w-3.5 mr-1" />
                Popular
              </Badge>
            )}
          </div>
        ) : (
          <div className="h-52 w-full bg-zinc-900 flex items-center justify-center">
            <span className="text-zinc-600 text-sm">Sin imagen</span>
          </div>
        )}

        <CardContent className="p-5 flex flex-col gap-3">
          <div>
            <h3 className="font-bold text-lg tracking-tight text-white group-hover:text-red-400 transition-colors">
              {item.name}
            </h3>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>

          {item.spicyLevel !== undefined && item.spicyLevel > 0 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: item.spicyLevel }).map((_, i) => (
                <Flame key={i} className={`h-4 w-4 ${flameColor}`} />
              ))}
              <span className="text-xs text-zinc-500 ml-1">
                {item.spicyLevel === 1 && "Suave"}
                {item.spicyLevel === 2 && "Medio"}
                {item.spicyLevel === 3 && "Extremo"}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mt-auto pt-2">
            <span className={`font-black text-xl ${priceColor}`}>
              {formattedPrice}
            </span>
            <AddToCartButton
              id={item.id}
              name={item.name}
              price={item.price}
              image_url={item.image_url ?? item.image ?? null}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-red-500 hover:bg-red-400 text-black text-sm font-bold px-4 h-9 transition-colors"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}