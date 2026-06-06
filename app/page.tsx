"use client"

import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { AlimentacionView } from "@/components/views/alimentacion-view"
import { FichasView } from "@/components/views/fichas-view"
import { LimpiezaView } from "@/components/views/limpieza-view"
import { OrdenoView } from "@/components/views/ordeno-view"
import { RutinasView } from "@/components/views/rutinas-view"
import { Sidebar, type SectionId } from "@/components/sidebar"
import type { Cabra } from "@/lib/data"

const titles: Record<SectionId, string> = {
  rutinas: "Rutinas",
  ordeno: "Ordeño",
  alimentacion: "Alimentación",
  limpieza: "Limpieza",
  fichas: "Fichas",
}

export default function Page() {
  const [active, setActive] = useState<SectionId>("fichas")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cabras, setCabras] = useState<Cabra[]>([])
  const [cabrasLoading, setCabrasLoading] = useState(true)
  const [cabrasError, setCabrasError] = useState<string | null>(null)

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

  const cabrasEnLactancia = cabras.filter(
    (c) => c.estado === "En lactancia",
  ).length

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
  }[active]

  const scrollMode = active === "fichas" ? "overflow-hidden" : "overflow-y-auto"

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        active={active}
        open={sidebarOpen}
        onSelect={selectSection}
        onClose={() => setSidebarOpen(false)}
        cabrasCount={cabras.length}
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
          <span className="text-base font-semibold tracking-tight">{titles[active]}</span>
        </header>
        <section
          className={`min-h-0 flex-1 ${scrollMode}`}
          aria-label={titles[active]}
        >
          {content}
        </section>
      </main>
    </div>
  )
}
