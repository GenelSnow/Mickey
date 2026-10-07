import { Star } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.4

  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && hasHalf)
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
              filled
                ? "fill-yellow-400 text-yellow-400"
                : "text-zinc-600"
            }`}
          />
        )
      })}
    </div>
  )
}

export async function GoogleReviewsBadge({
  compact = false,
}: {
  compact?: boolean
}) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("config_app")
    .select("clave, valor")
    .in("clave", [
      "google_reviews_url",
      "google_rating",
      "google_reviews_count",
    ])

  const map = Object.fromEntries((data || []).map((r) => [r.clave, r.valor]))
  const url =
    map.google_reviews_url || "https://share.google/hJlhpdltxUJKKBrwB"
  const rating = Number(map.google_rating || "0")
  const count = Number(map.google_reviews_count || "0")

  if (!rating && !count) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-950/80 hover:border-yellow-500/40 transition-colors ${
        compact ? "px-3 py-2" : "px-4 py-3"
      }`}
    >
      {/* Logo G simple */}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-[#4285F4]">
        G
      </span>

      <div className="min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm sm:text-base tabular-nums">
            {rating.toFixed(1)}
          </span>
          <Stars rating={rating} />
        </div>
        <p className="text-[11px] sm:text-xs text-zinc-500 group-hover:text-yellow-400/80 transition-colors">
          {count} reseña{count === 1 ? "" : "s"} en Google · Ver más
        </p>
      </div>
    </a>
  )
}