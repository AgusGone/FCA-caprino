"use client"

import { useState } from "react"
import { Check, Pencil, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSharedState } from "@/lib/use-shared-state"

type Item = { zona: string; frecuencia: string; hecho: boolean }

const inicial: Item[] = [
  { zona: "Sala de ordeño", frecuencia: "Diaria", hecho: false },
  { zona: "Comederos", frecuencia: "Diaria", hecho: false },
  { zona: "Bebederos", frecuencia: "Diaria", hecho: false },
  { zona: "Recria", frecuencia: "2 veces/semana", hecho: false },
  { zona: "Silo", frecuencia: "Tras cada ordeño", hecho: false },
  { zona: "Arbol", frecuencia: "Tras recolección", hecho: false },
]

export function LimpiezaView() {
  const { state: items, setState: setItems, status, error } = useSharedState<Item[]>(
    "limpieza",
    inicial,
  )
  const [editing, setEditing] = useState(false)

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Limpieza</h1>
          <p className="mt-2 text-muted-foreground">
            Higiene de instalaciones y equipos del tambo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary"
        >
          {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
          {editing ? "Listo" : "Editar"}
        </button>
      </div>

      {status === "loading" && (
        <p className="mt-4 text-sm text-muted-foreground">Sincronizando…</p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      )}

      <ul className="mt-6 flex flex-col gap-2">
        {items.map((it, i) => (
          <li key={i}>
            {editing ? (
              <div className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3">
                <input
                  value={it.zona}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, idx) => (idx === i ? { ...p, zona: e.target.value } : p)),
                    )
                  }
                  placeholder="Zona"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none"
                />
                <input
                  value={it.frecuencia}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, idx) =>
                        idx === i ? { ...p, frecuencia: e.target.value } : p,
                      ),
                    )
                  }
                  placeholder="Frecuencia"
                  className="w-40 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                  aria-label="Eliminar"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  setItems((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, hecho: !p.hecho } : p)),
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
            )}
          </li>
        ))}
      </ul>

      {editing && (
        <button
          type="button"
          onClick={() =>
            setItems((prev) => [...prev, { zona: "", frecuencia: "", hecho: false }])
          }
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
        >
          <Plus className="size-4" /> Agregar zona
        </button>
      )}
    </div>
  )
}
