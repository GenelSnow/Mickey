import { createClient } from "@/lib/supabase/server"
import {
  HORARIO_DEFAULT,
  estaAbierto,
  formatHora12,
  type HorarioSemana,
} from "@/lib/horario"

export async function EstadoLocal({ compact = false }: { compact?: boolean }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("config_app")
    .select("valor")
    .eq("clave", "horario_semana")
    .maybeSingle()
    

  let horario: HorarioSemana = HORARIO_DEFAULT
  if (data?.valor) {
    try {
      horario = { ...HORARIO_DEFAULT, ...JSON.parse(data.valor) }
    } catch {
      /* default */
    }
  }

  const { abierto, hasta } = estaAbierto(horario, "America/Bogota")
  const hasta12 = hasta ? formatHora12(hasta) : null

  const label = abierto
    ? compact
      ? `Abierto${hasta12 ? ` · ${hasta12}` : ""}`
      : `Abierto${hasta12 ? ` hasta ${hasta12}` : ""}`
    : "Cerrado"

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
        abierto
          ? "bg-green-500/15 text-green-400 border-green-500/30"
          : "bg-red-500/15 text-red-400 border-red-500/30"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
          abierto ? "bg-green-400 animate-pulse" : "bg-red-400"
        }`}
      />
      {label}
    </span>
  )
}