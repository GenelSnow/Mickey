export type DiaClave =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo"

export type DiaHorario = {
  abierto: boolean
  desde: string // "HH:mm"
  hasta: string
}

export type HorarioSemana = Record<DiaClave, DiaHorario>

export const DIAS: { key: DiaClave; label: string }[] = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
]

export const HORARIO_DEFAULT: HorarioSemana = {
  lunes: { abierto: true, desde: "11:00", hasta: "22:00" },
  martes: { abierto: true, desde: "11:00", hasta: "22:00" },
  miercoles: { abierto: true, desde: "11:00", hasta: "22:00" },
  jueves: { abierto: true, desde: "11:00", hasta: "22:00" },
  viernes: { abierto: true, desde: "11:00", hasta: "23:00" },
  sabado: { abierto: true, desde: "12:00", hasta: "23:00" },
  domingo: { abierto: false, desde: "12:00", hasta: "20:00" },
}

/** 0=domingo ... 6=sábado → nuestra clave */
export function diaActual(timeZone = "America/Bogota"): DiaClave {
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(new Date())

  const map: Record<string, DiaClave> = {
    Mon: "lunes",
    Tue: "martes",
    Wed: "miercoles",
    Thu: "jueves",
    Fri: "viernes",
    Sat: "sabado",
    Sun: "domingo",
  }
  return map[day] || "lunes"
}

function minutosAhora(timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date())

  const h = Number(parts.find((p) => p.type === "hour")?.value || 0)
  const m = Number(parts.find((p) => p.type === "minute")?.value || 0)
  return h * 60 + m
}

function parseHm(hm: string): number {
  const [h, m] = hm.split(":").map(Number)
  return h * 60 + m
}

export function estaAbierto(
  horario: HorarioSemana,
  timeZone = "America/Bogota"
): { abierto: boolean; hoy: DiaClave; desde?: string; hasta?: string } {
  const hoy = diaActual(timeZone)
  const config = horario[hoy]

  if (!config?.abierto) {
    return { abierto: false, hoy }
  }

  const now = minutosAhora(timeZone)
  const desde = parseHm(config.desde)
  const hasta = parseHm(config.hasta)

  // Si hasta < desde, cruza medianoche (ej. 18:00–02:00)
  const dentro =
    hasta < desde
      ? now >= desde || now < hasta
      : now >= desde && now < hasta

  return {
    abierto: dentro,
    hoy,
    desde: config.desde,
    hasta: config.hasta,
  }
}

/** "22:00" → "10:00 p. m."  |  "11:00" → "11:00 a. m." */
export function formatHora12(hm: string): string {
  if (!hm || !hm.includes(":")) return hm
  const [hStr, mStr] = hm.split(":")
  let h = Number(hStr)
  const m = mStr?.padStart(2, "0") ?? "00"
  if (Number.isNaN(h)) return hm

  const sufijo = h >= 12 ? "p. m." : "a. m."
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${m} ${sufijo}`
}