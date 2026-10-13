"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Flame, Eye, EyeOff } from "lucide-react"
import {
    PAISES_TEL,
    limpiarDigitos,
    armarWhatsapp,
    INPUT_CLASS,
    AUTOFILL_FIX,
} from "@/lib/paises-telefono"

export default function LoginPage() {
    const [countryCode, setCountryCode] = useState("57")
    const [whatsapp, setWhatsapp] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const pais = PAISES_TEL.find((p) => p.code === countryCode) ?? PAISES_TEL[0]

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const local = limpiarDigitos(whatsapp)
        if (local.length < pais.minLen) {
            setError(`Ingresa un número válido (${pais.minLen}–${pais.maxLen} dígitos)`)
            setLoading(false)
            return
        }

        const whatsappFinal = armarWhatsapp(countryCode, local)
        const emailInterno = `${whatsappFinal}@mickey.com`

        const { error } = await supabase.auth.signInWithPassword({
            email: emailInterno,
            password,
        })

        setLoading(false)

        if (error) {
            setError("WhatsApp o contraseña incorrectos")
            return
        }

        router.push("/")
        router.refresh()
    }

    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-10 sm:py-14">
            <div className="w-full max-w-[400px]">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Flame className="h-7 w-7 text-red-500 fill-red-500" />
                        <span className="text-2xl font-black tracking-tighter text-white uppercase">
                            Mic<span className="text-red-500">key</span>
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Iniciar sesión</h1>
                    <p className="text-zinc-400 mt-2 text-sm">Usa tu WhatsApp y contraseña</p>
                </div>

                <div className="border border-zinc-800 rounded-2xl p-5 sm:p-6 bg-zinc-950/80">
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* WhatsApp — país arriba en móvil, en fila en sm+ */}
                        <div className="space-y-1.5">
                            <label className="block text-sm text-zinc-400">WhatsApp</label>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                                {/* Selector país: ancho completo en móvil */}
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className={`w-full sm:w-[11.5rem] h-12 shrink-0 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm px-3 focus:outline-none focus:border-red-500 ${AUTOFILL_FIX}`}
                                    aria-label="Código de país"
                                >
                                    {PAISES_TEL.map((p) => (
                                        <option key={p.code} value={p.code}>
                                            {p.flag} {p.label} (+{p.code})
                                        </option>
                                    ))}
                                </select>

                                {/* Número */}
                                <div className="relative min-w-0 flex-1">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium">
                                        +{countryCode}
                                    </span>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        required
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(limpiarDigitos(e.target.value))}
                                        className={`w-full h-12 pl-[3.25rem] pr-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40 ${AUTOFILL_FIX}`}
                                        placeholder="3001234567"
                                        maxLength={pais.maxLen + 2}
                                        autoComplete="tel-national"
                                    />
                                </div>
                            </div>

                            <p className="text-[11px] text-zinc-600">
                                Solo el número local · se guardará como +{countryCode}
                                {whatsapp || "…"}
                            </p>
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1.5">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full h-11 px-3.5 pr-11 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40 ${AUTOFILL_FIX}`}
                                    placeholder="Tu contraseña"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                    aria-label={showPassword ? "Ocultar" : "Mostrar"}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl bg-red-500 hover:bg-red-400 text-black font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? "Entrando..." : "Iniciar sesión"}
                        </button>

                        <p className="text-center text-sm">
                            <Link
                                href="/auth/cambiar-clave"
                                className="text-zinc-500 hover:text-red-400 transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </p>
                    </form>
                </div>

                <p className="text-center text-zinc-500 text-sm mt-6">
                    ¿No tienes cuenta?{" "}
                    <Link href="/auth/sign-up" className="text-red-400 hover:underline">
                        Crear cuenta
                    </Link>
                </p>
            </div>
        </div>
    )
}