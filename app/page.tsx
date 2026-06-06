"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { AlimentacionView } from "@/components/views/alimentacion-view"
import { FichasView } from "@/components/views/fichas-view"
import { LimpiezaView } from "@/components/views/limpieza-view"
import { OrdenoView } from "@/components/views/ordeno-view"
import { RutinasView } from "@/components/views/rutinas-view"
import { UsuariosView } from "@/components/views/usuarios-view"
import { Sidebar, type SectionId } from "@/components/sidebar"
import { createSupabaseBrowser } from "@/lib/supabase/browser"
import type { Cabra } from "@/lib/data"

const titles: Record<SectionId, string> = {
  rutinas: "Rutinas",
  ordeno: "Ordeño",
  alimentacion: "Alimentación",
  limpieza: "Limpieza",
  fichas: "Fichas",
  usuarios: "Usuarios",
}

export default function Page() {
  const router = useRouter()
  const [active, setActive] = useState<SectionId>("fichas")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cabras, setCabras] = useState<Cabra[]>([])
  const [cabrasLoading, setCabrasLoading] = useState(true)
  const [cabrasError, setCabrasError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        setUserEmail(data.user.email ?? "")
        setIsAdmin(data.user.app_metadata?.is_admin === true)
      }
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    setCabrasLoading(true)
    setCabrasError(null)
    fetch("/api/cabras")
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Error al cargar cabras")
        return json.cabras as Cabra[]
      })
      .then((data) => {
        if (!cancelled) setCabras(data)
      })
      .catch((e) => {
        if (!cancelled) setCabrasError(e.message)
      })
      .finally(() => {
        if (!cancelled) setCabrasLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function selectSection(section: SectionId) {
    setActive(section)
    setSidebarOpen(false)
  }

  async function logout() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  const cabrasEnLactancia = cabras.filter(
    (c) => c.estado === "En lactancia",
  ).length

  const effectiveActive: SectionId =
    active === "usuarios" && !isAdmin ? "fichas" : active

  const content = {
    rutinas: <RutinasView />,
    ordeno: <OrdenoView cabrasEnLactancia={cabrasEnLactancia} />,
    alimentacion: <AlimentacionView cabrasEnLactancia={cabrasEnLactancia} />,
    limpieza: <LimpiezaView />,
    fichas: (
      <FichasView
        cabras={cabras}
        setCabras={setCabras}
        loading={cabrasLoading}
        error={cabrasError}
      />
    ),
    usuarios: <UsuariosView currentUserId={userId} />,
  }[effectiveActive]

  const scrollMode = effectiveActive === "fichas" ? "overflow-hidden" : "overflow-y-auto"

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        active={effectiveActive}
        open={sidebarOpen}
        onSelect={selectSection}
        onClose={() => setSidebarOpen(false)}
        cabrasCount={cabras.length}
        isAdmin={isAdmin}
        userEmail={userEmail}
        onLogout={logout}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-foreground"
            aria-label="Abrir menú"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-base font-semibold tracking-tight">{titles[effectiveActive]}</span>
        </header>
        <section
          className={`min-h-0 flex-1 ${scrollMode}`}
          aria-label={titles[effectiveActive]}
        >
          {content}
        </section>
      </main>
    </div>
  )
}
