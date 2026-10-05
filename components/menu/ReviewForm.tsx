"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Star } from "lucide-react"
import { toast } from "sonner"

type Props = {
  menuItemId: string
}

export function ReviewForm({ menuItemId }: Props) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [nombreCuenta, setNombreCuenta] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [puedeResenar, setPuedeResenar] = useState(false)
  const [motivoBloqueo, setMotivoBloqueo] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function verificar() {
      setChecking(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMotivoBloqueo("login")
        setChecking(false)
        return
      }

      setUserId(user.id)

      // Cargar perfil y pedidos del usuario para determinar si puede reseñar el producto

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("nombre, apellido")
        .eq("id", user.id)
        .maybeSingle()

      const nombre = [perfil?.nombre, perfil?.apellido].filter(Boolean).join(" ")
      setNombreCuenta(nombre || "Cliente")

      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("id, items, estado, completado_at")
        .eq("cliente_id", user.id)
        .eq("estado", "completado")
        .order("completado_at", { ascending: false })

      const pedidosConEsteItem = (pedidos || []).filter(
        (p) =>
          Array.isArray(p.items) &&
          p.items.some(
            (it: { id?: string }) => String(it.id) === String(menuItemId)
          )
      )

      if (!pedidosConEsteItem.length) {
        setMotivoBloqueo("no_probo")
        setChecking(false)
        return
      }

      // ===== UNA RESEÑA POR PEDIDO COMPLETADO (va aquí) =====
      const ultimoPedidoConItem = pedidosConEsteItem[0]

      const { data: ultimaResena } = await supabase
        .from("reviews")
        .select("created_at")
        .eq("menu_item_id", menuItemId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (ultimaResena?.created_at && ultimoPedidoConItem.completado_at) {
        const tResena = new Date(ultimaResena.created_at).getTime()
        const tPedido = new Date(ultimoPedidoConItem.completado_at).getTime()

        // Si la última reseña es posterior o igual al último pedido → debe esperar otro pedido
        if (tPedido <= tResena) {
          setMotivoBloqueo("espera_pedido")
          setChecking(false)
          return
        }
      }
      // ===== fin del bloque =====

      setPuedeResenar(true)
      setMotivoBloqueo(null)
      setChecking(false)
    }

    verificar()
  }, [menuItemId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!userId) {
      toast.error("Debes iniciar sesión para reseñar")
      return
    }

    const autor = (nombreCuenta || "Cliente").trim()
    if (!autor) {
      toast.error("No se pudo obtener el nombre de tu cuenta")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("reviews").insert({
      menu_item_id: menuItemId,
      author_name: autor,
      rating,
      comment: comment.trim() || null,
      user_id: userId,
    })

    setLoading(false)

    if (error) {
      toast.error("No se pudo publicar", { description: error.message })
      return
    }

    toast.success("Reseña publicada", {
      description: "Gracias por contar cómo te fue esta vez.",
    })
    setComment("")
    setRating(5)
    setPuedeResenar(false)
    setMotivoBloqueo("espera_pedido")
    router.refresh()
  }

  if (checking) {
    return (
      <p className="text-sm text-zinc-500">Comprobando si puedes reseñar...</p>
    )
  }

  if (motivoBloqueo === "login") {
    return (
      <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 text-sm text-zinc-400">
        <p>
          Inicia sesión para dejar una reseña.{" "}
          <Link href="/auth/login" className="text-red-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    )
  }

  if (motivoBloqueo === "sin_pedido" || motivoBloqueo === "no_probo") {
    return (
      <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 text-sm text-zinc-400">
        <p>
          Solo puedes reseñar este producto si ya lo pediste y el local marcó tu
          pedido como <span className="text-white font-medium">completado</span>.
        </p>
      </div>
    )
  }

  if (motivoBloqueo === "espera_pedido") {
    return (
      <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 text-sm text-zinc-400">
        Ya reseñaste este producto tras tu último pedido. Cuando vuelvas a
        pedirlo y lo marquen como completado, podrás contar cómo te fue esta vez.
      </div>
    )
  }

  if (!puedeResenar) return null

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 space-y-4"
    >
      <h3 className="font-bold text-white">Escribe tu reseña</h3>

      <p className="text-sm text-zinc-400">
        Publicarás como{" "}
        <span className="text-white font-medium">{nombreCuenta}</span>
      </p>

      <div>
        <label className="text-xs text-zinc-400 mb-1 block">Calificación</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}>
              <Star
                className={`h-6 w-6 ${n <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-zinc-600"
                  }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400">Comentario</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500 resize-none"
          placeholder="¿Qué te pareció?"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 rounded-full bg-red-500 hover:bg-red-400 text-black font-bold text-sm disabled:opacity-50"
      >
        {loading ? "Publicando..." : "Publicar reseña"}
      </button>
    </form>
  )
}