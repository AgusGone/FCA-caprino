"use client"

import {
  ListChecks,
  Droplet,
  Sprout,
  Brush,
  IdCard,
  Users,
  LogOut,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type SectionId =
  | "rutinas"
  | "ordeno"
  | "alimentacion"
  | "limpieza"
  | "fichas"
  | "usuarios"

// Lista reordenada
const nav: { id: SectionId; label: string; icon: typeof ListChecks; adminOnly?: boolean }[] = [
  { id: "fichas", label: "Fichas de cabras", icon: IdCard },
  { id: "rutinas", label: "Rutinas del día", icon: ListChecks },
  { id: "ordeno", label: "Ordeño", icon: Droplet },
  { id: "alimentacion", label: "Alimentación", icon: Sprout },
  { id: "limpieza", label: "Limpieza", icon: Brush },
  { id: "usuarios", label: "Usuarios", icon: Users, adminOnly: true },
]

export function Sidebar({
  active,
  onSelect,
  open,
  onClose,
  cabrasCount,
  isAdmin,
  userEmail,
  onLogout,
}: {
  active: SectionId
  onSelect: (id: SectionId) => void
  open: boolean
  onClose: () => void
  cabrasCount: number
  isAdmin: boolean
  userEmail: string
  onLogout: () => void
}) {
  const visibleNav = nav.filter((n) => !n.adminOnly || isAdmin)
  return (
    <>
      {/* Overlay mobile */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-black/60 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform md:static md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-6 py-6">
          <div className="flex items-center gap-3">
            {/* AQUÍ HICE EL CAMBIO PARA TU IMAGEN */}
            <img 
              src="/logo.png" 
              alt="FCA CRABRAS" 
              className="size-10 rounded-full object-cover scale-110" 
            />
            
            <div className="leading-tight">
              <p className="text-lg font-semibold tracking-tight">FCA CRABRAS</p>
              <p className="text-sm text-muted-foreground">Gestión caprina</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {visibleNav.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-base transition-colors",
                  isActive
                    ? "border-border bg-sidebar-accent font-medium text-sidebar-foreground"
                    : "border-transparent text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="px-6 py-6">
          <p className="text-sm text-muted-foreground">Rodeo activo</p>
          <p className="text-2xl font-semibold tracking-tight">
            {cabrasCount} cabras
          </p>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            <button
              type="button"
              onClick={onLogout}
              className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}