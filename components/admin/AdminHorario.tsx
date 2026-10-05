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

export function AdminHorario() {
  const supabase = createClient()
  const [horario, setHorario] = useState<HorarioSemana>(HORARIO_DEFAULT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("config_app")
        .select("valor")
        .eq("clave", "horario_semana")
        .maybeSingle()

      if (data?.valor) {
        try {
          setHorario({ ...HORARIO_DEFAULT, ...JSON.parse(data.valor) })
        } catch {
          /* keep default */
        }
      }
    }
    load()
  }, [])

  function patch(dia: DiaClave, field: "abierto" | "desde" | "hasta", value: boolean | string) {
    setHorario((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [field]: value },
    }))
  }

  async function save() {
    setLoading(true)
    const { error } = await supabase.from("config_app").upsert({
      clave: "horario_semana",
      valor: JSON.stringify(horario),
      updated_at: new Date().toISOString(),
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Horario guardado")
  }

  const estado = estaAbierto(horario)

  return (
    <div className="border border-zinc-800 rounded-2xl p-5 bg-zinc-950/80 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-white text-lg">Horario del local</h2>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            estado.abierto
              ? "bg-green-500/15 text-green-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          Ahora: {estado.abierto ? "Abierto" : "Cerrado"}
        </span>
      </div>

      <div className="space-y-2">
        {DIAS.map(({ key, label }) => {
          const d = horario[key]
          return (
            <div
              key={key}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center border border-zinc-800 rounded-xl px-3 py-2"
            >
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={d.abierto}
                  onChange={(e) => patch(key, "abierto", e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                {label}
              </label>
              <input
                type="time"
                value={d.desde}
                disabled={!d.abierto}
                onChange={(e) => patch(key, "desde", e.target.value)}
                className="h-9 px-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm disabled:opacity-40"
              />
              <span className="text-zinc-500 text-xs">a</span>
              <input
                type="time"
                value={d.hasta}
                disabled={!d.abierto}
                onChange={(e) => patch(key, "hasta", e.target.value)}
                className="h-9 px-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm disabled:opacity-40"
              />
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="w-full h-10 rounded-full bg-red-500 hover:bg-red-400 text-black font-bold text-sm disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar horario"}
      </button>
    </div>
  )
}