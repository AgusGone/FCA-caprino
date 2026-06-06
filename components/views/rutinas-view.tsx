"use client"

import { useState } from "react"
import { Check } from "lucide-react"
// Cambiamos la línea de abajo:
import { cn } from "@/lib/utils" 

const inicial = [
  { hora: "08:00", tarea: "Limpieza recinto", hecho: false },
  { hora: "07:30", tarea: "Suministro de ración (50%)", hecho: false },
  { hora: "08:30", tarea: "Limpieza de comederos", hecho: false },
  { hora: "10:00", tarea: "Reposición de agua y sales", hecho: false },
  { hora: "12:00", tarea: "Control sanitario del rodeo", hecho: false },
  { hora: "15:00", tarea: "Suministro de ración (50%)", hecho: false },
  { hora: "17:30", tarea: "Ordeño de la tarde", hecho: false },
]

export function RutinasView() {
  const [tareas, setTareas] = useState(inicial)
  const completas = tareas.filter((t) => t.hecho).length

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Rutinas del día</h1>
        <span className="rounded-full bg-card px-4 py-1.5 text-sm text-muted-foreground">
          Jueves 28 de mayo
        </span>
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
            style={{ width: `${(completas / tareas.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {tareas.map((t, i) => (
          <li key={t.hora + t.tarea}>
            <button
              onClick={() =>
                setTareas((prev) =>
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
          </li>
        ))}
      </ul>
    </div>
  )
}