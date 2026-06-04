"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { AlimentacionView } from "@/components/views/alimentacion-view"
import { AsistenteView } from "@/components/views/asistente-view"
import { FichasView } from "@/components/views/fichas-view"
import { LimpiezaView } from "@/components/views/limpieza-view"
import { OrdenoView } from "@/components/views/ordeno-view"
import { RutinasView } from "@/components/views/rutinas-view"
import { Sidebar, type SectionId } from "@/components/sidebar"

const titles: Record<SectionId, string> = {
  rutinas: "Rutinas",
  ordeno: "Ordeño",
  alimentacion: "Alimentación",
  limpieza: "Limpieza",
  fichas: "Fichas",
  asistente: "Asistente",
}

export default function Page() {
  // Inicializamos en "fichas" para que arranque ahí al cargar la página
  const [active, setActive] = useState<SectionId>("fichas")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [assistantPrompt, setAssistantPrompt] = useState("")

  function selectSection(section: SectionId) {
    setActive(section)
    setSidebarOpen(false)
  }

  function consultAssistant(prompt: string) {
    setAssistantPrompt(prompt)
    selectSection("asistente")
  }

  const content = {
    rutinas: <RutinasView />,
    ordeno: <OrdenoView />,
    alimentacion: <AlimentacionView onConsult={consultAssistant} />,
    limpieza: <LimpiezaView />,
    fichas: <FichasView onConsult={consultAssistant} />,
    asistente: (
      <AsistenteView key={assistantPrompt || "empty"} initialPrompt={assistantPrompt} />
    ),
  }[active]

  const scrollMode =
    active === "fichas" || active === "asistente" ? "overflow-hidden" : "overflow-y-auto"

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        active={active}
        open={sidebarOpen}
        onSelect={selectSection}
        onClose={() => setSidebarOpen(false)}
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