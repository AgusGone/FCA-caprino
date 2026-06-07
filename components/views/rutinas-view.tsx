"use client"

import { useEffect, useState } from "react"
import { Check, Pencil, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Tarea = { hora: string; tarea: string; hecho: boolean }

const STORAGE_KEY = "fca:rutinas"

const inicial: Tarea[] = [
  { hora: "08:00", tarea: "Limpieza recinto", hecho: false },
  { hora: "07:30", tarea: "Suministro de ración (50%)", hecho: false },
  { hora: "08:30", tarea: "Limpieza de comederos", hecho: false },
  { hora: "10:00", tarea: "Reposición de agua y sales", hecho: false },
  { hora: "12:00", tarea: "Control sanitario del rodeo", hecho: false },
  { hora: "15:00", tarea: "Suministro de ración (50%)", hecho: false },
  { hora: "17:30", tarea: "Ordeño de la tarde", hecho: false },
]

function load(): Tarea[] {
  if (typeof window === "undefined") return inicial
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return inicial
    return JSON.parse(raw) as Tarea[]
  } catch {
    return inicial
  }
}

export function RutinasView() {
  const [tareas, setTareas] = useState<Tarea[]>(inicial)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setTareas(load())
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas))
    }
  }, [tareas])

  const completas = tareas.filter((t) => t.hecho).length
  const total = tareas.length || 1

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Rutinas del día</h1>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary"
        >
          {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
          {editing ? "Listo" : "Editar"}
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-card p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progreso del día</span>
          <span className="font-semibold">
            {completas}/{tareas.length} tareas
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(completas / total) * 100}%` }}
          />
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {tareas.map((t, i) => (
          <li key={i}>
            {editing ? (
              <div className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3">
                <input
                  type="time"
                  value={t.hora}
                  onChange={(e) =>
                    setTareas((prev) =>
                      prev.map((p, idx) => (idx === i ? { ...p, hora: e.target.value } : p)),
                    )
                  }
                  className="w-28 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none"
                />
                <input
                  value={t.tarea}
                  onChange={(e) =>
                    setTareas((prev) =>
                      prev.map((p, idx) => (idx === i ? { ...p, tarea: e.target.value } : p)),
                    )
                  }
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setTareas((prev) => prev.filter((_, idx) => idx !== i))}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                  aria-label="Eliminar tarea"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  setTareas((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, hecho: !p.hecho } : p)),
                  )
                }
                className="flex w-full items-center gap-4 rounded-2xl bg-card px-5 py-4 text-left transition-colors hover:bg-secondary"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    t.hecho
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {t.hecho && <Check className="size-4" />}
                </span>
                <span className="w-14 shrink-0 font-mono text-sm text-muted-foreground">
                  {t.hora}
                </span>
                <span className="flex-1 text-base">{t.tarea}</span>
              </button>
            )}
          </li>
        ))}
      </ul>

      {editing && (
        <button
          type="button"
          onClick={() =>
            setTareas((prev) => [...prev, { hora: "", tarea: "", hecho: false }])
          }
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
        >
          <Plus className="size-4" /> Agregar tarea
        </button>
      )}
    </div>
  )
}
