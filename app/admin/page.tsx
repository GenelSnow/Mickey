import { redirect } from "next/navigation"
import Link from "next/link"
import { getPerfil, esStaff } from "@/lib/perfil"
import { AdminTabs } from "@/components/admin/AdminTabs"

export default async function AdminPage() {
  const perfil = await getPerfil()
  if (!perfil) redirect("/auth/login")
  if (!esStaff(perfil.rol)) redirect("/")

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Administración</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Menú, recompensas y configuración
          </p>
        </div>
        <Link
          href="/admin/pedidos"
          className="text-sm font-medium text-red-400 hover:underline"
        >
          → Ver pedidos
        </Link>
      </div>

      <AdminTabs rol={perfil.rol} />
    </div>
  )
}