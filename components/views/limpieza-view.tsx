"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const inicial = [
  { zona: "Sala de ordeño", frecuencia: "Diaria", hecho: false },
  { zona: "Comederos", frecuencia: "Diaria", hecho: false },
  { zona: "Bebederos", frecuencia: "Diaria", hecho: false },
  { zona: "Recria", frecuencia: "2 veces/semana", hecho: false },
  { zona: "Silo", frecuencia: "Tras cada ordeño", hecho: false },
  { zona: "Arbol", frecuencia: "Tras recolección", hecho: false },
]

export function LimpiezaView() {
  const [items, setItems] = useState(inicial)

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10">
      <h1 className="text-2xl font-semibold tracking-tight">Limpieza</h1>
      <p className="mt-2 text-muted-foreground">
        Higiene de instalaciones y equipos del tambo.
      </p>

      <ul className="mt-6 flex flex-col gap-2">
        {items.map((it, i) => (
          <li key={it.zona}>
            <button
              onClick={() =>
                setItems((prev) =>
                  prev.map((p, idx) =>
                    idx === i ? { ...p, hecho: !p.hecho } : p,
                  ),
                )
              }
              className="flex w-full items-center gap-4 rounded-2xl bg-card px-5 py-4 text-left transition-colors hover:bg-secondary"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  it.hecho
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {it.hecho && <Check className="size-4" />}
              </span>
              <span className="flex-1">
                <span className="block text-base">{it.zona}</span>
                <span className="block text-sm text-muted-foreground">
                  {it.frecuencia}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
