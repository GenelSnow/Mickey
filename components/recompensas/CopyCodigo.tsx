"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CopyCodigo({ codigo }: { codigo: string }) {
  const [ok, setOk] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(codigo)
    setOk(true)
    setTimeout(() => setOk(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl font-black tracking-wider text-white">{codigo}</span>
      <button
        type="button"
        onClick={copiar}
        className="text-zinc-400 hover:text-red-400 transition-colors"
        aria-label="Copiar código"
      >
        {ok ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
      </button>
    </div>
  )
}