"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Flame, Eye, EyeOff } from "lucide-react"

export default function SignUpPage() {
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)

  function limpiarNumero(value: string) {
    return value.replace(/\D/g, "")
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const numero = limpiarNumero(whatsapp)
    if (numero.length < 10) {
      setError("Ingresa un WhatsApp válido (mínimo 10 dígitos)")
      setLoading(false)
      return
    }

    const whatsappFinal = numero.startsWith("57") ? numero : `57${numero}`
    const emailInterno = `${whatsappFinal}@mickey.com`

    const { data, error } = await supabase.auth.signUp({
      email: emailInterno,
      password,
      options: {
        data: {
          nombre: nombre.trim(),
          apellido: apellido.trim() || null,
          whatsapp: whatsappFinal,
        },
        // Evita flujo de confirmación por email (el correo no existe de verdad)
        emailRedirectTo: undefined,
      },
    })

    console.log("SIGNUP RESULT:", { data, error })
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    // No loguees la key completa en producción; solo para depurar:
    console.log("KEY presente:", !!(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ))

    setLoading(false)

    if (error) {
      if (error.message.includes("already registered")) {
        setError("Este WhatsApp ya tiene una cuenta")
      } else {
        setError(error.message)
      }
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Flame className="h-7 w-7 text-orange-500 fill-orange-500" />
            <span className="text-2xl font-black tracking-tighter text-white uppercase">
              Mic<span className="text-orange-500">key</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Regístrate para obtener descuentos y promociones
          </p>
        </div>

        <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950/80">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Nombre *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">WhatsApp *</label>
              <div className="flex gap-2">
                <span className="inline-flex items-center h-11 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 text-sm">
                  +57
                </span>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(limpiarNumero(e.target.value))}
                  className="flex-1 h-11 px-4 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                  placeholder="310 123 4567"
                  maxLength={12}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Contraseña *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-11 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold transition-colors disabled:opacity-50"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-orange-400 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}