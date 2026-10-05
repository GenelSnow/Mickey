"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart/CartProvider"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    ArrowLeft,
    MessageCircle,
} from "lucide-react"
import { useEffect } from "react"
import { HORARIO_DEFAULT, estaAbierto, type HorarioSemana } from "@/lib/horario"

const WHATSAPP_NUMBER = "573165542426"

function buildImageUrl(path: string | null | undefined): string | null {
    if (!path) return null
    if (path.startsWith("http")) return path
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!base) return null
    return `${base}/storage/v1/object/public/${path}`
}

function formatPrice(n: number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(n)
}
type Props = { modoReserva?: boolean }

export default function CarritoClient({ modoReserva = false }: Props) {
    const { items, updateQty, removeItem, clearCart, total, count } = useCart()
    const router = useRouter()
    const supabase = createClient()

    const [nombre, setNombre] = useState("")
    const [telefono, setTelefono] = useState("")
    const [direccion, setDireccion] = useState("")
    const [referencia, setReferencia] = useState("")
    const [nota, setNota] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [codigoReferido, setCodigoReferido] = useState("")
    const [formaPago, setFormaPago] = useState<"efectivo" | "nequi" | "llave">("efectivo")
    const [precioDomicilio, setPrecioDomicilio] = useState(2500)


    const [desdeCuenta, setDesdeCuenta] = useState(false) // true si se usaron datos del perfil
    const [tieneCuenta, setTieneCuenta] = useState(false)

    useEffect(() => {
        async function cargarPerfil() {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) return

            const { data: perfil } = await supabase
                .from("perfiles")
                .select("nombre, apellido, whatsapp")
                .eq("id", user.id)
                .maybeSingle()

            if (!perfil) return

            setTieneCuenta(true)

            const nombreCompleto = [perfil.nombre, perfil.apellido]
                .filter(Boolean)
                .join(" ")

            // WhatsApp sin el 57 para el input (+57 ya se asume o se muestra completo)
            let wa = perfil.whatsapp || ""
            if (wa.startsWith("57") && wa.length > 10) {
                wa = wa.slice(2)
            }

            setNombre(nombreCompleto)
            setTelefono(wa)
            setDesdeCuenta(true)
        }

        cargarPerfil()
    }, [])

    function aplicarDatosCuenta() {
        // Reutiliza la misma lógica si el usuario desmarca y vuelve a marcar
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return
            const { data: perfil } = await supabase
                .from("perfiles")
                .select("nombre, apellido, whatsapp")
                .eq("id", user.id)
                .maybeSingle()

            if (!perfil) return

            const nombreCompleto = [perfil.nombre, perfil.apellido]
                .filter(Boolean)
                .join(" ")

            let wa = perfil.whatsapp || ""
            if (wa.startsWith("57") && wa.length > 10) wa = wa.slice(2)

            setNombre(nombreCompleto)
            setTelefono(wa)
            setDesdeCuenta(true)
        })
    }

    // Al montar, leer de Supabase los domicilios
    useEffect(() => {
        async function loadDomicilio() {
            const { data } = await supabase
                .from("config_app")
                .select("valor")
                .eq("clave", "precio_domicilio")
                .maybeSingle()

            if (data?.valor) {
                const n = Number(data.valor)
                if (!Number.isNaN(n)) setPrecioDomicilio(n)
            }
        }
        loadDomicilio()
    }, [])

    const totalConDomicilio = total + precioDomicilio

    function buildWhatsAppMessage(
        codigoUsado?: string | null,
        comoReserva?: boolean
    ) {
        const esReservaMsg = comoReserva ?? modoReserva
        const lineasItems = items
            .map(
                (i) =>
                    `• *${i.name}* x${i.quantity} — ${formatPrice(i.price * i.quantity)}`
            )
            .join("\n")

        const pagoLabel =
            formaPago === "efectivo"
                ? "Efectivo"
                : formaPago === "nequi"
                    ? "Nequi"
                    : "Llave"

        // ---------- RESERVA (local cerrado) ----------
        if (esReservaMsg) {
            const partes: string[] = [
                "*RESERVA AlitasNOA*",
                "------------------------------",
                "",
                "*Productos*",
                lineasItems,
                "",
                "------------------------------",
                `Subtotal: ${formatPrice(total)}`,
                `Domicilio: ${formatPrice(precioDomicilio)}`,
                `*Total estimado: ${formatPrice(totalConDomicilio)}*`,
                "",
                `*Forma de pago:* ${pagoLabel}`,
                "",
                "------------------------------",
                "*Datos de entrega*",
                `Nombre: ${nombre.trim()}`,
                `WhatsApp: ${telefono.trim()}`,
                `Direccion: ${direccion.trim()}`,
            ]

            if (referencia.trim()) {
                partes.push(`Referencia: ${referencia.trim()}`)
            }

            if (nota.trim()) {
                partes.push(`Nota: ${nota.trim()}`)
            }

            if (codigoUsado) {
                partes.push(
                    "",
                    "------------------------------",
                    "*Estoy usando codigo de referido, certifica mi punto de referido.*"
                )
            }

            partes.push(
                "",
                "------------------------------",
                "*Estado: RESERVADO*",
                "El local estaba cerrado. Confirmar cuando abran.",
                "",
                "_Enviado desde la web de AlitasNOA_"
            )

            return partes.join("\n")
        }

        // ---------- PEDIDO NORMAL (local abierto) ----------
        const partes: string[] = [
            "*Pedido AlitasNOA*",
            "------------------------------",
            "",
            "*Productos*",
            lineasItems,
            "",
            "------------------------------",
            `Subtotal: ${formatPrice(total)}`,
            `Domicilio: ${formatPrice(precioDomicilio)}`,
            `*Total a pagar: ${formatPrice(totalConDomicilio)}*`,
            "",
            `*Forma de pago:* ${pagoLabel}`,
            "",
            "------------------------------",
            "*Datos de entrega*",
            `Nombre: ${nombre.trim()}`,
            `WhatsApp: ${telefono.trim()}`,
            `Direccion: ${direccion.trim()}`,
        ]

        if (referencia.trim()) {
            partes.push(`Referencia: ${referencia.trim()}`)
        }

        if (nota.trim()) {
            partes.push(`Nota: ${nota.trim()}`)
        }

        if (codigoUsado) {
            partes.push(
                "",
                "------------------------------",
                "*Estoy usando codigo de referido, certifica mi punto de referido.*"
            )
        }

        partes.push("", "_Enviado desde la web de AlitasNOA_")

        return partes.join("\n")
    }

    async function handleEnviar(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (items.length === 0) {
            setError("El carrito está vacío")
            return
        }
        if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
            setError("Completa nombre, WhatsApp y dirección")
            return
        }

        setLoading(true)

        const waWindow = window.open("about:blank", "_blank")

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            const { data: cfg } = await supabase
                .from("config_app")
                .select("valor")
                .eq("clave", "horario_semana")
                .maybeSingle()

            let horario: HorarioSemana = HORARIO_DEFAULT
            if (cfg?.valor) {
                try {
                    horario = { ...HORARIO_DEFAULT, ...JSON.parse(cfg.valor) }
                } catch { }
            }

            const cerradoAhora = !estaAbierto(horario, "America/Bogota").abierto
            const esReserva = modoReserva || cerradoAhora

            // Referido solo si hay código + sesión (opcional)
            let codigoUsado: string | null = null
            let referidorId: string | null = null

            if (codigoReferido.trim()) {
                if (!user) {
                    setError("Inicia sesión para usar un código de referido")
                    setLoading(false)
                    if (waWindow && !waWindow.closed) waWindow.close()
                    return
                }

                const codigo = codigoReferido.trim().toUpperCase()
                const { data: rows, error: refError } = await supabase.rpc("buscar_referidor", {
                    p_codigo: codigo,
                })
                const referidor = rows?.[0]

                if (refError || !referidor) {
                    setError("Ese código de referido no existe")
                    setLoading(false)
                    if (waWindow && !waWindow.closed) waWindow.close()
                    return
                }
                if (referidor.id === user.id) {
                    setError("No puedes usar tu propio código de referido")
                    setLoading(false)
                    if (waWindow && !waWindow.closed) waWindow.close()
                    return
                }

                codigoUsado = codigo
                referidorId = referidor.id
            }

            // ===== SIEMPRE guardar en admin (logueado o no) =====
            const { error: insertError } = await supabase.from("pedidos").insert({
                cliente_id: user?.id ?? null,
                subtotal: total,
                costo_domicilio: precioDomicilio,
                total: totalConDomicilio,
                forma_pago: formaPago,
                estado: esReserva ? "reservado" : "ordenado",
                es_reserva: esReserva,
                nombre_entrega: nombre.trim(),
                telefono: telefono.replace(/\D/g, ""),
                direccion: direccion.trim(),
                referencia_vivienda: referencia.trim() || null,
                nota_adicional: nota.trim() || null,
                items: items.map((i) => ({
                    id: i.id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                })),
                notas: nota.trim() || null,
                codigo_referido_usado: codigoUsado,
                referidor_id: referidorId,
            })

            if (insertError) {
                console.warn("Insert pedidos:", insertError.message)
                setError("No se pudo guardar el pedido: " + insertError.message)
                setLoading(false)
                if (waWindow && !waWindow.closed) waWindow.close()
                return
            }



            // --- WhatsApp ---
            const text = encodeURIComponent(buildWhatsAppMessage(codigoUsado))
            const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`

            if (waWindow && !waWindow.closed) {
                waWindow.location.href = url
            } else {
                // Fallback si el navegador bloqueó la pestaña
                window.location.href = url
            }

            toast.success(esReserva ? "Reserva registrada" : "Pedido listo", {
                description: esReserva
                    ? "Se abrió WhatsApp con tu reserva. Envíalo para avisar al local."
                    : "Se abrió WhatsApp con tu mensaje. Envíalo para confirmar.",
            })

            clearCart()
            router.push("/menu")
        } catch (err) {
            if (waWindow && !waWindow.closed) waWindow.close()
            setError(err instanceof Error ? err.message : "Error al enviar el pedido")
        } finally {
            setLoading(false)
        }
    }

    // Carrito vacío
    if (count === 0) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-lg text-center">
                <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-8 w-8 text-zinc-600" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Carrito vacío</h1>
                <p className="text-zinc-400 text-sm mb-6">
                    Agrega alitas desde el menú para empezar tu pedido.
                </p>
                <Link
                    href="/menu"
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm px-6 h-11 rounded-full transition-colors"
                >
                    Ver menú
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-3xl">
            <Link
                href="/menu"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-orange-400 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Seguir comprando
            </Link>

            <div>

                {modoReserva && (
                    <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                        Estamos cerrados. Tu pedido se guardará como <strong>reserva</strong>.
                        Te avisaremos por WhatsApp cuando abramos para confirmarlo.
                    </div>
                )}

            </div>

            <h1 className="text-3xl font-black text-white mb-8">Tu pedido</h1>

            <div className="grid gap-8 lg:grid-cols-5">
                {/* Lista de ítems */}
                <div className="lg:col-span-3 space-y-3">
                    {items.map((item) => {
                        const imgSrc = buildImageUrl(item.image_url)
                        return (
                            <div key={item.id} className="flex gap-4 border border-zinc-800 rounded-2xl p-4 bg-zinc-950/80">
                                <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-zinc-900">
                                    {imgSrc ? (
                                        <Image
                                            src={imgSrc}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-zinc-600 text-xs">
                                            —
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between gap-2">
                                        <h3 className="font-semibold text-white truncate">{item.name}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="text-zinc-500 hover:text-red-400 transition-colors shrink-0"
                                            aria-label="Quitar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-orange-400 font-medium">
                                        {formatPrice(item.price)}
                                    </p>

                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1 border border-zinc-700 rounded-full">
                                            <button
                                                type="button"
                                                onClick={() => updateQty(item.id, item.quantity - 1)}
                                                className="h-8 w-8 flex items-center justify-center text-zinc-400 hover:text-white"
                                            >
                                                <Minus className="h-3.5 w-3.5" />
                                            </button>
                                            <span className="w-6 text-center text-sm text-white font-medium">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQty(item.id, item.quantity + 1)}
                                                className="h-8 w-8 flex items-center justify-center text-zinc-400 hover:text-white"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <span className="text-sm text-zinc-400">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Checkout */}
                <div className="lg:col-span-2">
                    <form
                        onSubmit={handleEnviar}
                        className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 space-y-4 sticky top-24"
                    >
                        <h2 className="font-bold text-white text-lg">Datos de entrega</h2>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Nombre *</label>
                            <input
                                required
                                value={nombre}
                                onChange={(e) => {
                                    setNombre(e.target.value)
                                    setDesdeCuenta(false)
                                }}
                                className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-orange-500"
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">WhatsApp *</label>
                            <input
                                required
                                type="tel"
                                value={telefono}
                                onChange={(e) => {
                                    setTelefono(e.target.value.replace(/\D/g, ""))
                                    setDesdeCuenta(false)
                                }}
                                className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-orange-500"
                                placeholder="3101234567"
                            />
                        </div>

                        {tieneCuenta && (
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={desdeCuenta}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            aplicarDatosCuenta()
                                        } else {
                                            setDesdeCuenta(false)
                                            // opcional: no borrar los campos, solo desmarcar
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-xs text-zinc-400">
                                    Usar nombre y WhatsApp de mi cuenta
                                    {desdeCuenta && (
                                        <span className="text-green-400 ml-1">✓ aplicados</span>
                                    )}
                                </span>
                            </label>
                        )}

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Dirección *</label>
                            <input
                                required
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-orange-500"
                                placeholder="Calle, número, barrio"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">
                                Referencia de la vivienda
                            </label>
                            <input
                                value={referencia}
                                onChange={(e) => setReferencia(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-orange-500"
                                placeholder="Casa blanca, portón negro..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Nota adicional</label>
                            <textarea
                                value={nota}
                                onChange={(e) => setNota(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-orange-500 resize-none"
                                placeholder="Sin cebolla, timbre roto..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">
                                Código de referido (opcional)
                            </label>
                            <input
                                value={codigoReferido}
                                onChange={(e) => setCodigoReferido(e.target.value.toUpperCase().trim())}
                                className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-orange-500 uppercase tracking-wider"
                                placeholder="ALI-XXXXXX"
                                maxLength={20}
                            />
                            <p className="text-[11px] text-zinc-600 mt-1">
                                Si alguien te invitó, escribe su código. No puedes usar el tuyo.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs text-zinc-400 mb-2">Forma de pago *</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(
                                    [
                                        { id: "efectivo", label: "Efectivo" },
                                        { id: "nequi", label: "Nequi" },
                                        { id: "llave", label: "Llave" },
                                    ] as const
                                ).map((op) => (
                                    <button
                                        key={op.id}
                                        type="button"
                                        onClick={() => setFormaPago(op.id)}
                                        className={`h-10 rounded-lg text-sm font-medium border transition-colors ${formaPago === op.id
                                            ? "border-orange-500 bg-orange-500/15 text-orange-400"
                                            : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
                                            }`}
                                    >
                                        {op.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-4 space-y-2">
                            <div className="flex justify-between text-sm text-zinc-400">
                                <span>Subtotal</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-zinc-400">
                                <span>Domicilio</span>
                                <span>{formatPrice(precioDomicilio)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-zinc-300 font-medium">Total</span>
                                <span className="text-xl font-black text-orange-500">
                                    {formatPrice(totalConDomicilio)}
                                </span>
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-full bg-green-600 hover:bg-green-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <MessageCircle className="h-4 w-4" />
                            {loading ? "Preparando..." : "Enviar por WhatsApp"}
                        </button>

                        <p className="text-[11px] text-zinc-600 text-center">
                            Se abrirá WhatsApp con el pedido listo para enviar.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}