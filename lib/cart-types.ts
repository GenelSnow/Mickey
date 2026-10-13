export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string | null
  category?: string | null
}

export type CheckoutData = {
  nombre: string
  telefono: string
  direccion: string
  referencia_vivienda: string
  nota_adicional: string
}