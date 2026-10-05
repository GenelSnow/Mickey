"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  LogOut,
  User,
  Gift,
  ClipboardList,
  ChevronDown,
  KeyRound,
  Settings,
  Lock,
} from "lucide-react"

type Props = {
  nombre?: string | null
  rol?: string | null
}

export function AuthButtons({ nombre, rol }: Props) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const esStaff = rol === "empleado" || rol === "dueño" || rol === "developer"

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleLogout() {
    setOpen(false)
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // No logueado
  if (!nombre) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/auth/login"
          className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors px-2 sm:px-3 py-1.5"
        >
          Entrar
        </Link>
        <Link
          href="/auth/sign-up"
          className="text-xs sm:text-sm font-bold bg-orange-500 hover:bg-orange-400 text-black px-2.5 sm:px-4 py-1.5 rounded-full transition-colors whitespace-nowrap"
        >
          <span className="sm:hidden">Cuenta</span>
          <span className="hidden sm:inline">Crear cuenta</span>
        </Link>
      </div>
    )
  }

  // Logueado → botón de perfil + menú
  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-zinc-700 hover:border-orange-500/50 bg-zinc-900/80 px-3 py-1.5 transition-colors"
      >
        <div className="h-7 w-7 rounded-full bg-orange-500/20 flex items-center justify-center">
          <User className="h-4 w-4 text-orange-400" />
        </div>
        <span className="hidden sm:inline text-sm font-medium text-white max-w-[100px] truncate">
          {nombre}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/50 py-1 z-50">
          {/* Cabecera del menú */}
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm font-semibold text-white truncate">{nombre}</p>
            <p className="text-xs text-zinc-500 capitalize">{rol ?? "usuario"}</p>
          </div>

          {/* Opciones de cliente */}
          <div className="py-1">
            <Link
              href="/recompensas"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-orange-400 transition-colors"
            >
              <Gift className="h-4 w-4" />
              Mis recompensas
            </Link>
          </div>

          {/* Opciones de staff */}
          {esStaff && (
            <>
              <Link
                href="/admin/pedidos"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-green-400 transition-colors"
              >
                <ClipboardList className="h-4 w-4" />
                Pedidos
              </Link>

              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-green-400 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Administración
              </Link>
            </>
          )}

          {/* Cambiar contraseña */}
          <div className="py-1 border-t border-zinc-800">
            <Link
              href="/auth/cambiar-clave"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-orange-400 transition-colors"
            >
              <KeyRound className="h-4 w-4" />
              Cambiar contraseña
            </Link>
          </div>

          {/* Cerrar sesión */}
          <div className="py-1 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}