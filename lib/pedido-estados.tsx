export function estiloEstado(estado: string) {
    switch (estado) {
        case "reservado":
            return {
                emoji: "📅",
                label: "Reservado",
                className: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
            }
        case "ordenado":
        case "pendiente":
            return {
                emoji: "📋",
                label: estado === "pendiente" ? "Pendiente" : "Ordenado",
                className:
                    "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
            }
        case "procesando":
            return {
                emoji: "🔥",
                label: "Procesando",
                className:
                    "bg-red-500/15 text-red-400 border border-red-500/30",
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
                className:
                    "bg-green-500/15 text-green-400 border border-green-500/30",
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