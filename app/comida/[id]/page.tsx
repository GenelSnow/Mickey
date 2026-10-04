import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Flame, Crown, Star, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { ReviewForm } from "@/components/menu/ReviewForm"

interface Props {
    params: Promise<{ id: string }>
}

export default async function ComidaPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    // Traer el item + su categoría + reseñas
    const { data: item, error } = await supabase
        .from("menu_items")
        .select(`
      id,
      name,
      description,
      price,
      spicy_level,
      is_popular,
      image_url,
      categories (
        name,
        description
      ),
      reviews (
        id,
        author_name,
        rating,
        comment,
        created_at
      )
    `)
        .eq("id", id)
        .eq("is_available", true)
        .single()

    if (error || !item) {
        notFound()
    }

    const category = Array.isArray(item.categories)
        ? item.categories[0]
        : item.categories

    const imageSrc = item.image_url
        ? item.image_url.startsWith("http")
            ? item.image_url
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${item.image_url}`
        : null

    const formattedPrice = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(Number(item.price))

    const isMielMostaza = category?.name?.toLowerCase().includes("miel")
    const accentColor = isMielMostaza ? "text-yellow-400" : "text-orange-500"
    const flameColor = isMielMostaza ? "fill-yellow-400 text-yellow-400" : "fill-orange-500 text-orange-500"

    const reviews = item.reviews || []
    const averageRating =
        reviews.length > 0
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
            : null

    return (
        <div className="container mx-auto px-4 py-10 max-w-5xl">
            {/* Volver */}
            <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-orange-400 transition-colors mb-8"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver al menú
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Imagen principal */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                    {imageSrc ? (
                        <Image
                            src={imageSrc}
                            alt={item.name}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            quality={80}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-600">
                            Sin imagen
                        </div>
                    )}
                </div>

                {/* Información */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                        {category?.name && (
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                {category.name}
                            </Badge>
                        )}
                        {item.is_popular && (
                            <Badge className="bg-orange-500 text-white font-bold">
                                <Crown className="h-3.5 w-3.5 mr-1" />
                                Popular
                            </Badge>
                        )}
                    </div>

                    <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${accentColor}`}>
                        {item.name}
                    </h1>

                    {item.description ? (
                        <p className="text-zinc-400 mt-4 text-lg leading-relaxed">
                            {item.description}
                        </p>
                    ) : (
                        <p className="text-zinc-600 mt-4 text-sm italic">
                            Sin descripción por ahora.
                        </p>
                    )}

                    {/* Precio */}
                    <div className="mt-6">
                        <span className={`text-4xl font-black ${accentColor}`}>
                            {formattedPrice}
                        </span>
                    </div>

                    {/* Características */}
                    <div className="mt-8 space-y-4">
                        <h2 className="text-xl font-bold text-white">Características</h2>

                        {item.spicy_level > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400 text-sm w-28">Nivel picante:</span>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: item.spicy_level }).map((_, i) => (
                                        <Flame key={i} className={`h-5 w-5 ${flameColor}`} />
                                    ))}
                                    <span className="text-sm text-zinc-500 ml-2">
                                        {item.spicy_level === 1 && "Suave"}
                                        {item.spicy_level === 2 && "Medio"}
                                        {item.spicy_level === 3 && "Extremo"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {averageRating && (
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400 text-sm w-28">Valoración:</span>
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold text-white">{averageRating}</span>
                                    <span className="text-zinc-500 text-sm">
                                        ({reviews.length} reseña{reviews.length !== 1 ? "s" : ""})
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botón pedir */}
                    <div className="mt-10">
                        <AddToCartButton
                            id={item.id}
                            name={item.name}
                            price={Number(item.price)}
                            image_url={item.image_url}
                            label="Agregar al carrito"
                            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-base px-8 h-11 rounded-full transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Reseñas */}
            <section className="mt-16 space-y-8">
                <h2 className="text-2xl font-bold text-white">Reseñas de clientes</h2>

                {reviews.length === 0 ? (
                    <p className="text-zinc-500">Aún no hay reseñas para este producto.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/60"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-white">{review.author_name}</span>
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < review.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-zinc-700"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        {review.comment}
                                    </p>
                                )}
                                <p className="text-zinc-600 text-xs mt-3">
                                    {new Date(review.created_at).toLocaleDateString("es-CO", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Formulario para publicar reseña */}
                <ReviewForm menuItemId={item.id} />
            </section>
        </div>
    )
}