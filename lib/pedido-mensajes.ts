export type EstadoPedido =
    | "reservado"
    | "pendiente"
    | "ordenado"
    | "procesando"
    | "en_envio"
    | "completado"
    | "cancelado"

export type FormaPago = "efectivo" | "nequi" | "llave"

type Opts = {
    nombre: string
    estado: EstadoPedido
    formaPago: FormaPago
    demoraCocina?: string
    demoraRepartidor?: string
    nequiNumero?: string
    llaveNumero?: string
}

export function armarMensajePedido(o: Opts): string {
    const saludo = `Hola ${o.nombre}, te escribimos de *Mickey*.`

    if (o.estado === "reservado") {
        return [
            `Hola ${o.nombre}, te escribimos de *Mickey*.`,
            "",
            "¡Ya estamos *abiertos*!",
            "Tienes una *reserva* con nosotros.",
            "",
            "¿Confirmas que quieres que preparemos tu pedido y le demos seguimiento?",
            "Responde *SÍ* para confirmar o *NO* si deseas cancelar.",
            "",
            "¡Gracias!",
        ].join("\n")
    }

    if (o.estado === "ordenado") {
        const lineas = [saludo, "", "Recibimos tu pedido correctamente."]

        if (o.formaPago === "efectivo") {
            lineas.push(
                "",
                "Pagos en *efectivo*: tu orden ya puede prepararse.",
                "El cobro se hace al entregar."
            )
            // Sin tiempo estimado aquí
        } else {
            const medio = o.formaPago === "nequi" ? "Nequi" : "Llave"
            const numero =
                o.formaPago === "nequi" ? o.nequiNumero || "—" : o.llaveNumero || "—"

            lineas.push(
                "",
                `Pagos por *${medio}*: envía el pago al número *${numero}* y respóndenos con el *comprobante* (anticipo).`,
                "Tu orden *comenzará a prepararse* cuando el pago se confirme con éxito."
            )

            // Tiempo de espera del comprobante (reutilizamos demoraCocina como selector de espera)
            if (o.demoraCocina) {
                lineas.push(
                    "",
                    `Tiempo estimado para validar tu comprobante: *${o.demoraCocina}*.`
                )
            }
        }

        lineas.push("", "¡Gracias por preferirnos!")
        return lineas.join("\n")
    }

    if (o.estado === "procesando") {
        return [
            saludo,
            "",
            "Tu pedido está *en preparación*.",
            o.demoraCocina
                ? `Tiempo estimado: *${o.demoraCocina}*.`
                : "Te avisamos cuando salga a domicilio.",
            "",
            "¡Gracias por tu paciencia!",
        ].join("\n")
    }

    if (o.estado === "en_envio") {
        return [
            saludo,
            "",
            "Tu pedido ya va *en camino*.",
            o.demoraRepartidor
                ? `El repartidor puede demorar aprox. *${o.demoraRepartidor}* en llegar a tu domicilio.`
                : "El repartidor se dirige a tu dirección.",
            "",
            "¡Que lo disfrutes!",
        ].join("\n")
    }

    if (o.estado === "completado") {
        return [
            saludo,
            "",
            "Tu pedido fue *entregado*. ¡Gracias por comprar en Mickey!",
            "Si te gustó, puedes dejar una reseña en la web del producto.",
            "",
            "Esperamos verte pronto.",
        ].join("\n")
    }

    return [saludo, "", "Hubo un cambio en tu pedido. Contáctanos si necesitas ayuda."].join("\n")
}

export function estiloEstado(estado: string) {
    switch (estado) {
        case "ordenado":
        case "pendiente":
            return {
                emoji: "📋",
                label: estado === "pendiente" ? "Pendiente" : "Ordenado",
                className: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
            }
        case "procesando":
            return {
                emoji: "🔥",
                label: "Procesando",
                className: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
            }
        case "en_envio":
            return {
                emoji: "🛵",
                label: "En envío",
                className: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
            }
        case "completado":
            return {
                emoji: "✅",
                label: "Completado",
                className: "bg-green-500/15 text-green-400 border border-green-500/30",
            }
        case "cancelado":
            return {
                emoji: "❌",
                label: "Cancelado",
                className: "bg-red-500/15 text-red-400 border border-red-500/30",
            }
        default:
            return {
                emoji: "•",
                label: estado,
                className: "bg-zinc-700 text-zinc-300 border border-zinc-600",
            }
    }
}