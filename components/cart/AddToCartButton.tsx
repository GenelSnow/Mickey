"use client"

import { useCart } from "@/components/cart/CartProvider"
import { ShoppingBag } from "lucide-react"
import { toast } from "sonner"

type Props = {
  id: string
  name: string
  price: number
  image_url?: string | null
  category?: string | null
  className?: string
  label?: string
}

export function AddToCartButton({
  id,
  name,
  price,
  image_url,
  category,
  className,
  label = "Agregar",
}: Props) {
  const { addItem } = useCart()

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
          id,
          name,
          price,
          image_url: image_url ?? null,
          category: category ?? null,
        })
        toast.success("Agregado al carrito", { description: name })
      }}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-4 py-2 transition-colors"
      }
    >
      <ShoppingBag className="h-4 w-4" />
      {label}
    </button>
  )
}