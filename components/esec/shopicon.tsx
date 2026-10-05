"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart/CartProvider"

export function CartButton() {
  const { count } = useCart()

  return (
    <Link
      href="/carrito"
      className="relative p-2 text-zinc-300 hover:text-red-400 transition-colors"
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-black text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  )
}