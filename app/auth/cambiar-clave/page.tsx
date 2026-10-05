"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Flame, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { INPUT_CLASS, AUTOFILL_FIX } from "@/lib/paises-telefono"

export default function CambiarClavePage() {
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/auth/login")
        return
      }
      setReady(true)
    })
  }, [router, supabase.auth])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error("Mínimo 6 caracteres")
      return
    }
    if (password !== password2) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Contraseña actualizada")
    setPassword("")
    setPassword2("")
    router.push("/")
    router.refresh()
  }

  if (!ready) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-zinc-500 text-sm">
        Cargando...
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Flame className="h-7 w-7 text-orange-500 fill-orange-500" />
            <span className="text-2xl font-black tracking-tighter text-white uppercase">
              Mic<span className="text-orange-500">key</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Cambiar contraseña</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Elige una contraseña nueva para tu cuenta
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-zinc-800 rounded-2xl p-5 sm:p-6 bg-zinc-950/80 space-y-4"
        >
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${INPUT_CLASS} pr-11 ${AUTOFILL_FIX}`}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Confirmar contraseña</label>
            <input
              type={show ? "text" : "password"}
              required
              minLength={6}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className={`${INPUT_CLASS} ${AUTOFILL_FIX}`}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm mt-6">
          <Link href="/" className="text-orange-400 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}