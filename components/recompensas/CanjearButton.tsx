"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Props = {
  recompensaId: string
  disabled?: boolean
}

export function CanjearButton({ recompensaId, disabled }: Props) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleClick() {
    if (disabled || loading) return
    setLoading(true)

    const { data, error } = await supabase.rpc("canjear_recompensa", {
      p_recompensa_id: recompensaId,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    const res = data as { ok?: boolean; error?: string; codigo?: string }
    if (!res?.ok) {
      toast.error(res?.error || "No se pudo canjear")
      return
    }

    toast.success("¡Canje listo!", {
      description: `Tu código: ${res.codigo}`,
    })
    router.refresh()
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={handleClick}
      className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${
        disabled || loading
          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-500 text-white"
      }`}
    >
      {loading ? "..." : disabled ? "Insuficiente" : "Canjear"}
    </button>
  )
}