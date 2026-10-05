"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  DIAS,
  HORARIO_DEFAULT,
  type HorarioSemana,
  type DiaClave,
  estaAbierto,
} from "@/lib/horario"

const LABELS: Record<string, string> = {
  precio_domicilio: "Precio domicilio (COP)",
  nequi_numero: "Número Nequi",
  llave_numero: "Número Llave",
}

const PARAM_KEYS = ["precio_domicilio", "nequi_numero", "llave_numero"] as const

export function AdminConfig() {
  const supabase = createClient()
  const [params, setParams] = useState<Record<string, string>>({
    precio_domicilio: "2500",
    nequi_numero: "",
    llave_numero: "",
  })
  const [horario, setHorario] = useState<HorarioSemana>(HORARIO_DEFAULT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("config_app").select("clave, valor")
      if (!data) return

      const next = { ...params }
      data.forEach((row) => {
        if (PARAM_KEYS.includes(row.clave as (typeof PARAM_KEYS)[number])) {
          next[row.clave] = row.valor
        }
        if (row.clave === "horario_semana" && row.valor) {
          try {
            setHorario({ ...HORARIO_DEFAULT, ...JSON.parse(row.valor) })
          } catch { }
        }
      })
      setParams(next)
    }
    load()
  }, [])

  function patchDia(
    dia: DiaClave,
    field: "abierto" | "desde" | "hasta",
    value: boolean | string
  ) {
    setHorario((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [field]: value },
    }))
  }

  async function save() {
    setLoading(true)

    const updates = [
      ...PARAM_KEYS.map((clave) => ({
        clave,
        valor: params[clave] ?? "",
      })),
      {
        clave: "horario_semana",
        valor: JSON.stringify(horario),
      },
    ]

    for (const row of updates) {
      const { error } = await supabase.from("config_app").upsert({
        clave: row.clave,
        valor: row.valor,
        updated_at: new Date().toISOString(),
      })
      if (error) {
        toast.error(`${row.clave}: ${error.message}`)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    toast.success("Configuración guardada")
  }

  const estado = estaAbierto(horario)
  const inputClass =
    "w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500"

  return (
    <div className="space-y-6 max-w-lg w-full mx-auto overflow-x-hidden px-1">
      {/* Parámetros */}
      <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 space-y-4">
        <h2 className="font-bold text-white text-lg">Parámetros</h2>
        {PARAM_KEYS.map((clave) => (
          <div key={clave}>
            <label className="text-xs text-zinc-400 mb-1 block">
              {LABELS[clave]}
            </label>
            <input
              value={params[clave] ?? ""}
              onChange={(e) =>
                setParams((p) => ({ ...p, [clave]: e.target.value }))
              }
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {/* Horario */}
      <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-white text-lg">Horario del local</h2>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${estado.abierto
                ? "bg-green-500/15 text-green-400"
                : "bg-red-500/15 text-red-400"
              }`}
          >
            Ahora: {estado.abierto ? "Abierto" : "Cerrado"}
          </span>
        </div>

        {DIAS.map(({ key, label }) => {
          const d = horario[key]
          return (
            <div
              key={key}
              className="flex flex-col gap-2 border border-zinc-800 rounded-xl px-3 py-3 sm:flex-row sm:items-center sm:gap-3"
            >
              {/* Día */}
              <label className="flex items-center gap-2 text-sm text-white shrink-0 sm:w-28">
                <input
                  type="checkbox"
                  checked={d.abierto}
                  onChange={(e) => patchDia(key, "abierto", e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                {label}
              </label>

              {/* Horas: en móvil ocupan todo el ancho, en desktop en fila */}
              <div className="flex items-center gap-2 w-full min-w-0 sm:flex-1 sm:justify-end">
                <input
                  type="time"
                  value={d.desde}
                  disabled={!d.abierto}
                  onChange={(e) => patchDia(key, "desde", e.target.value)}
                  className="h-9 min-w-0 flex-1 max-w-[9rem] px-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm disabled:opacity-40"
                />
                <span className="text-zinc-500 text-xs shrink-0">a</span>
                <input
                  type="time"
                  value={d.hasta}
                  disabled={!d.abierto}
                  onChange={(e) => patchDia(key, "hasta", e.target.value)}
                  className="h-9 min-w-0 flex-1 max-w-[9rem] px-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm disabled:opacity-40"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Un solo guardar */}
      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="w-full h-11 rounded-full bg-red-500 hover:bg-red-400 text-black font-bold text-sm disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar configuración"}
      </button>
    </div>
  )
}