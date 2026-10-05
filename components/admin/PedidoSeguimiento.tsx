"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { armarMensajePedido, type EstadoPedido, type FormaPago } from "@/lib/pedido-mensajes"
import { toast } from "sonner"
import { MessageCircle } from "lucide-react"
import { useEffect } from "react"

const ESTADOS: { value: EstadoPedido; label: string }[] = [
    { value: "reservado", label: "Reservado" },
    { value: "ordenado", label: "Ordenado" },
    { value: "procesando", label: "Procesando" },
    { value: "en_envio", label: "En envío" },
    { value: "completado", label: "Completado" },
    { value: "cancelado", label: "Cancelado" },
]

const DEMORAS_COCINA = ["5-10 minutos", "10-15 minutos", "15-20 minutos", "20-30 minutos", "30-40 minutos"]
const DEMORAS_ENVIO = ["5-10 minutos", "10-15 minutos", "15-25 minutos", "25-35 minutos"]


type Pedido = {
    id: string
    total: number
    subtotal?: number
    costo_domicilio?: number
    forma_pago: string | null
    estado: string
    nombre_entrega: string | null
    telefono: string | null
    direccion: string | null
    referencia_vivienda: string | null
    nota_adicional: string | null
    items: { id?: string; name: string; price: number; quantity: number }[] | null
    created_at: string
    codigo_referido_usado?: string | null
    referidor_id?: string | null
    referidor?:
    | { nombre: string; apellido: string | null; codigo_referido: string | null; whatsapp: string | null }
    | { nombre: string; apellido: string | null; codigo_referido: string | null; whatsapp: string | null }[]
    | null
}

function formatPrice(n: number) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(n)
}


export function PedidoSeguimiento({
    pedido,
    validadorId,
}: {
    pedido: Pedido
    validadorId: string
}) {
    const [estado, setEstado] = useState(pedido.estado as EstadoPedido)
    const [demoraCocina, setDemoraCocina] = useState(DEMORAS_COCINA[1])
    const [demoraRepartidor, setDemoraRepartidor] = useState(DEMORAS_ENVIO[1])
    const [nequiNumero, setNequiNumero] = useState("3027966229")
    const [llaveNumero, setLlaveNumero] = useState("3027966229")
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const estadoGuardado = pedido.estado as EstadoPedido

    function estadosPermitidos(actual: EstadoPedido): EstadoPedido[] {
        switch (actual) {
            case "reservado":
                return ["reservado", "ordenado", "cancelado"]
            case "ordenado":
            case "pendiente":
                return ["ordenado", "procesando", "cancelado"]
            case "procesando":
                return ["procesando", "en_envio", "cancelado"]
            case "en_envio":
                return ["en_envio", "completado", "cancelado"]
            case "completado":
                return ["completado"]
            case "cancelado":
                return ["cancelado"]
            default:
                return ["ordenado", "procesando", "en_envio", "completado", "cancelado"]
        }
    }

    const bloqueado =
        estadoGuardado === "completado" || estadoGuardado === "cancelado"

    const opciones = ESTADOS.filter((e) =>
        estadosPermitidos(estadoGuardado).includes(e.value)
    )

    const formaPago = (pedido.forma_pago || "efectivo") as FormaPago
    const telefono = (pedido.telefono || "").replace(/\D/g, "")
    const waDigits = telefono.startsWith("57") ? telefono : `57${telefono}`
    const wa = waDigits.trim()

    useEffect(() => {
        async function loadConfig() {
            const { data } = await supabase
                .from("config_app")
                .select("clave, valor")
                .in("clave", ["nequi_numero", "llave_numero"])

            data?.forEach((row) => {
                if (row.clave === "nequi_numero") setNequiNumero(row.valor)
                if (row.clave === "llave_numero") setLlaveNumero(row.valor)
            })
        }
        loadConfig()
    }, [])

    const mensaje = armarMensajePedido({
        nombre: pedido.nombre_entrega || "cliente",
        estado,
        formaPago,
        demoraCocina:
            estado === "procesando" ||
                (estado === "ordenado" && formaPago !== "efectivo")
                ? demoraCocina
                : undefined,
        demoraRepartidor: estado === "en_envio" ? demoraRepartidor : undefined,
        nequiNumero,
        llaveNumero,
    })

    async function guardarEstado() {
        setLoading(true)


        if (estado === "completado") {
            const { error } = await supabase.rpc("completar_pedido", {
                p_pedido_id: pedido.id,
                p_validador_id: validadorId,
            })
            if (error) {
                // fallback update simple si el RPC falla por estado legacy
                await supabase
                    .from("pedidos")
                    .update({ estado: "completado", completado_at: new Date().toISOString() })
                    .eq("id", pedido.id)
                toast.error(error.message)
            } else {
                toast.success("Pedido completado", {
                    description: "Se registró y se aplicó punto de referido si correspondía.",
                })
            }
        } else {
            const payload: { estado: string; es_reserva?: boolean } = { estado }

            // Si sale de reservado hacia pedido real
            if (estado !== "reservado") {
                payload.es_reserva = false
            }

            const { data, error } = await supabase
                .from("pedidos")
                .update(payload)
                .eq("id", pedido.id)
                .select("id, estado, es_reserva")
                .maybeSingle()

            if (error) {
                toast.error(error.message)
                setLoading(false)
                return
            }
            if (!data) {
                toast.error("Sin permiso o fila no actualizada")
                setLoading(false)
                return
            }
            toast.success("Estado actualizado: " + data.estado)
        }

        setLoading(false)
        router.refresh()
    }

    function enviarWhatsApp() {
        const numero = wa.replace(/\D/g, "")

        if (!numero || numero.length < 12) {
            toast.error("El pedido no tiene WhatsApp válido")
            return
        }

        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
        window.open(url, "_blank")

        toast.success("WhatsApp abierto", {
            description: "Revisa el mensaje y envíalo al cliente.",
        })
    }

    return (
        <div className="space-y-6">
            {/* Detalle */}
            <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 space-y-3">
                <h2 className="font-bold text-white">Detalle</h2>
                <p className="text-sm text-zinc-300">
                    <span className="text-zinc-500">Cliente:</span> {pedido.nombre_entrega}
                </p>
                <p className="text-sm text-zinc-300">
                    <span className="text-zinc-500">WhatsApp:</span> {pedido.telefono}
                </p>
                <p className="text-sm text-zinc-300">
                    <span className="text-zinc-500">Dirección:</span> {pedido.direccion}
                </p>
                {pedido.referencia_vivienda && (
                    <p className="text-sm text-zinc-300">
                        <span className="text-zinc-500">Ref:</span> {pedido.referencia_vivienda}
                    </p>
                )}
                <p className="text-sm text-zinc-300">
                    <span className="text-zinc-500">Pago:</span>{" "}
                    {formaPago === "efectivo" ? "Efectivo" : formaPago === "nequi" ? "Nequi" : "Llave"}
                </p>

                {/* Código de referido */}
                {pedido.codigo_referido_usado && (
                    <p className="text-sm text-zinc-300">
                        <span className="text-zinc-500">Código de referido:</span>{" "}
                        <span className="text-yellow-400 font-mono font-semibold">
                            {pedido.codigo_referido_usado}
                        </span>
                        {(() => {
                            const raw = pedido.referidor
                            const ref = Array.isArray(raw) ? raw[0] : raw
                            if (!ref) return null
                            const nombreRef = [ref.nombre, ref.apellido].filter(Boolean).join(" ")
                            return (
                                <span className="text-zinc-400">
                                    {" "}
                                    → corresponde a <span className="text-white font-medium">{nombreRef}</span>
                                    {ref.whatsapp ? ` (${ref.whatsapp})` : ""}
                                </span>
                            )
                        })()}
                    </p>
                )}

                {!pedido.codigo_referido_usado && (
                    <p className="text-sm text-zinc-500">Sin código de referido</p>
                )}

                <p className="text-sm text-red-400 font-bold">
                    Total: {formatPrice(Number(pedido.total))}
                </p>

                <ul className="text-sm text-zinc-400 border-t border-zinc-800 pt-3 space-y-1">
                    {(pedido.items || []).map((it, i) => (
                        <li key={i}>
                            • {it.name} x{it.quantity}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Estado + demoras */}
            <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 space-y-4">
                <h2 className="font-bold text-white">Estado y tiempos</h2>

                <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Estado</label>
                    <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value as EstadoPedido)}
                        disabled={bloqueado}
                        className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm disabled:opacity-50"
                    >
                        {opciones.map((e) => (
                            <option key={e.value} value={e.value}>
                                {e.label}
                            </option>
                        ))}
                    </select>
                </div>

                {estado === "ordenado" && formaPago !== "efectivo" && (
                    <div>
                        <label className="text-xs text-zinc-400 mb-1 block">
                            Tiempo de espera del comprobante
                        </label>
                        <select
                            value={demoraCocina}
                            onChange={(e) => setDemoraCocina(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm"
                        >
                            {DEMORAS_COCINA.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                )}

                {estado === "procesando" && (
                    <div>
                        <label className="text-xs text-zinc-400 mb-1 block">
                            Demora preparación
                        </label>
                        <select
                            value={demoraCocina}
                            onChange={(e) => setDemoraCocina(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm"
                        >
                            {DEMORAS_COCINA.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                )}

                {estado === "en_envio" && (
                    <div>
                        <label className="text-xs text-zinc-400 mb-1 block">
                            Demora del repartidor
                        </label>
                        <select
                            value={demoraRepartidor}
                            onChange={(e) => setDemoraRepartidor(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm"
                        >
                            {DEMORAS_ENVIO.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <button
                    type="button"
                    onClick={guardarEstado}
                    disabled={loading || bloqueado || estado === estadoGuardado}
                    className="w-full h-10 rounded-full bg-red-500 hover:bg-red-400 text-black font-bold text-sm disabled:opacity-50"
                >
                    {loading ? "Guardando..." : "Guardar estado"}
                </button>
            </div>

            {/* Preview mensaje */}
            <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 space-y-4">
                <h2 className="font-bold text-white">Mensaje al cliente</h2>
                <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-sans bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
                    {mensaje}
                </pre>
                <button
                    type="button"
                    onClick={enviarWhatsApp}
                    className="w-full h-11 rounded-full bg-green-600 hover:bg-green-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2"
                >
                    <MessageCircle className="h-4 w-4" />
                    Enviar por WhatsApp
                </button>
            </div>
        </div>
    )
}