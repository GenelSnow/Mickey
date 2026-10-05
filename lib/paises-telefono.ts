export type PaisTel = {
  code: string
  label: string
  flag: string
  minLen: number
  maxLen: number
}

export const PAISES_TEL: PaisTel[] = [
  // Suramérica
  { code: "57", label: "Colombia", flag: "🇨🇴", minLen: 10, maxLen: 10 },
  { code: "58", label: "Venezuela", flag: "🇻🇪", minLen: 10, maxLen: 10 },
  { code: "51", label: "Perú", flag: "🇵🇪", minLen: 9, maxLen: 9 },
  { code: "56", label: "Chile", flag: "🇨🇱", minLen: 9, maxLen: 9 },
  { code: "54", label: "Argentina", flag: "🇦🇷", minLen: 10, maxLen: 11 },
  { code: "55", label: "Brasil", flag: "🇧🇷", minLen: 10, maxLen: 11 },
  { code: "593", label: "Ecuador", flag: "🇪🇨", minLen: 9, maxLen: 9 },
  { code: "591", label: "Bolivia", flag: "🇧🇴", minLen: 8, maxLen: 8 },
  { code: "595", label: "Paraguay", flag: "🇵🇾", minLen: 9, maxLen: 9 },
  { code: "598", label: "Uruguay", flag: "🇺🇾", minLen: 8, maxLen: 9 },
  { code: "592", label: "Guyana", flag: "🇬🇾", minLen: 7, maxLen: 7 },
  { code: "597", label: "Surinam", flag: "🇸🇷", minLen: 7, maxLen: 7 },
  // Centroamérica / Caribe
  { code: "52", label: "México", flag: "🇲🇽", minLen: 10, maxLen: 10 },
  { code: "507", label: "Panamá", flag: "🇵🇦", minLen: 8, maxLen: 8 },
  { code: "506", label: "Costa Rica", flag: "🇨🇷", minLen: 8, maxLen: 8 },
  { code: "505", label: "Nicaragua", flag: "🇳🇮", minLen: 8, maxLen: 8 },
  { code: "504", label: "Honduras", flag: "🇭🇳", minLen: 8, maxLen: 8 },
  { code: "503", label: "El Salvador", flag: "🇸🇻", minLen: 8, maxLen: 8 },
  { code: "502", label: "Guatemala", flag: "🇬🇹", minLen: 8, maxLen: 8 },
  { code: "501", label: "Belice", flag: "🇧🇿", minLen: 7, maxLen: 7 },
  { code: "53", label: "Cuba", flag: "🇨🇺", minLen: 8, maxLen: 8 },
  { code: "1809", label: "Rep. Dominicana", flag: "🇩🇴", minLen: 7, maxLen: 10 },
  { code: "1787", label: "Puerto Rico", flag: "🇵🇷", minLen: 7, maxLen: 10 },
  // Norte / Europa / otros
  { code: "1", label: "EE.UU. / Canadá", flag: "🇺🇸", minLen: 10, maxLen: 10 },
  { code: "34", label: "España", flag: "🇪🇸", minLen: 9, maxLen: 9 },
  { code: "351", label: "Portugal", flag: "🇵🇹", minLen: 9, maxLen: 9 },
  { code: "33", label: "Francia", flag: "🇫🇷", minLen: 9, maxLen: 9 },
  { code: "39", label: "Italia", flag: "🇮🇹", minLen: 9, maxLen: 10 },
  { code: "49", label: "Alemania", flag: "🇩🇪", minLen: 10, maxLen: 11 },
  { code: "44", label: "Reino Unido", flag: "🇬🇧", minLen: 10, maxLen: 10 },
  { code: "31", label: "Países Bajos", flag: "🇳🇱", minLen: 9, maxLen: 9 },
]

// Quitar duplicado España si quedó dos veces al copiar
export function getPaisesUnicos(): PaisTel[] {
  const seen = new Set<string>()
  return PAISES_TEL.filter((p) => {
    if (seen.has(p.code)) return false
    seen.add(p.code)
    return true
  })
}

export function limpiarDigitos(value: string) {
  return value.replace(/\D/g, "")
}

export function armarWhatsapp(countryCode: string, local: string): string {
  let num = limpiarDigitos(local)
  if (num.startsWith(countryCode) && num.length > countryCode.length + 5) {
    num = num.slice(countryCode.length)
  }
  return `${countryCode}${num}`
}

export const INPUT_CLASS =
  "w-full h-12 px-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40 transition-colors"

export const AUTOFILL_FIX =
  "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#18181b] [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[caret-color:white]"

/** Parte un número guardado (ej. 573245921012) en código de país + local */
export function partirWhatsapp(full: string): { code: string; local: string } {
  const num = limpiarDigitos(full)
  // Códigos más largos primero (593 antes que 57, etc.)
  const codes = [...PAISES_TEL]
    .map((p) => p.code)
    .sort((a, b) => b.length - a.length)

  for (const code of codes) {
    if (num.startsWith(code) && num.length > code.length + 5) {
      return { code, local: num.slice(code.length) }
    }
  }
  // Fallback Colombia
  if (num.length >= 10) {
    return { code: "57", local: num.slice(-10) }
  }
  return { code: "57", local: num }
}