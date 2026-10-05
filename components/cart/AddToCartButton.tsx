"use client"

import { useCart } from "@/components/cart/CartProvider"
import { ShoppingBag } from "lucide-react"
import { toast } from "sonner"

type Props = {
  id: string
  name: string
  price: number
  image_url?: string | null
  className?: string
  label?: string
}

export function AddToCartButton({
  id,
  name,
  price,
  image_url,
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
        addItem({ id, name, price, image_url })
        toast.success("Agregado al carrito", {
          description: name,
        })
      }}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-400 text-black text-sm font-bold px-4 py-2 transition-colors"
      }
    >
      <ShoppingBag className="h-4 w-4" />
      {label}
    </button>
  )
}