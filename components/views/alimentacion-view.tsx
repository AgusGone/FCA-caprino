"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, ArrowDown, Plus, X, Pencil, Check } from "lucide-react"

function parseKg(cantidad: string): number {
  const n = parseFloat(cantidad.replace(",", ".").replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : 0
}

type RacionItem = { nombre: string; cantidad: string }
type HorarioItem = { hora: string; momento: string; detalle: string }

const racionesDefault: RacionItem[] = [
  { nombre: "En lactancia", cantidad: "1.5 kg" },
  { nombre: "Gestante", cantidad: "1.2 kg" },
  { nombre: "Seca", cantidad: "0.8 kg" },
  { nombre: "Vacía", cantidad: "0.5 kg" },
  { nombre: "Cabrita", cantidad: "0.4 kg" },
]

const horariosDefault: HorarioItem[] = [
  { hora: "07:00", momento: "Mañana", detalle: "Heno + balanceado" },
  { hora: "16:00", momento: "Tarde", detalle: "Heno" },
]

const STORAGE_RACIONES = "fca:alimentacion:raciones"
const STORAGE_HORARIOS = "fca:alimentacion:horarios"

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function AlimentacionView({
  onConsult,
  cabrasEnLactancia,
}: {
  onConsult: (prompt: string) => void
  cabrasEnLactancia: number
}) {
  const [raciones, setRaciones] = useState<RacionItem[]>(racionesDefault)
  const [horarios, setHorarios] = useState<HorarioItem[]>(horariosDefault)
  const [editRaciones, setEditRaciones] = useState(false)
  const [editHorarios, setEditHorarios] = useState(false)

  useEffect(() => {
    setRaciones(loadFromStorage(STORAGE_RACIONES, racionesDefault))
    setHorarios(loadFromStorage(STORAGE_HORARIOS, horariosDefault))
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_RACIONES, JSON.stringify(raciones))
    }
  }, [raciones])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_HORARIOS, JSON.stringify(horarios))
    }
  }, [horarios])

  const consumoHoy = useMemo(() => {
    const lactancia = raciones.find((r) =>
      r.nombre.toLowerCase().includes("lactancia"),
    )
    const kgPorCabra = lactancia ? parseKg(lactancia.cantidad) : 0
    return kgPorCabra * cabrasEnLactancia
  }, [raciones, cabrasEnLactancia])

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-10">
      {/* Stat card */}
      <div className="rounded-2xl bg-card p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Consumo hoy
        </p>
        <p className="mt-3 text-4xl font-semibold tracking-tight">
          {consumoHoy % 1 === 0 ? consumoHoy : consumoHoy.toFixed(1)} kg
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Según ración de lactancia × {cabrasEnLactancia} cabras
        </p>
      </div>

      {/* Ración */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Ración diaria recomendada ({cabrasEnLactancia} cabras en lactancia)
        </h2>
        <button
          type="button"
          onClick={() => setEditRaciones((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
        >
          {editRaciones ? (
            <>
              <Check className="size-3.5" /> Listo
            </>
          ) : (
            <>
              <Pencil className="size-3.5" /> Editar
            </>
          )}
        </button>
      </div>
      <div className="mt-4 rounded-2xl bg-card px-6 py-2">
        {raciones.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between gap-3 py-4 ${
              i !== raciones.length - 1 ? "border-b border-border" : ""
            }`}
          >
            {editRaciones ? (
              <>
                <input
                  value={item.nombre}
                  onChange={(e) =>
                    setRaciones((prev) =>
                      prev.map((it, idx) =>
                        idx === i ? { ...it, nombre: e.target.value } : it,
                      ),
                    )
                  }
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base outline-none"
                />
                <input
                  value={item.cantidad}
                  onChange={(e) =>
                    setRaciones((prev) =>
                      prev.map((it, idx) =>
                        idx === i ? { ...it, cantidad: e.target.value } : it,
                      ),
                    )
                  }
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-base font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setRaciones((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                  aria-label="Eliminar ración"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <>
                <span className="text-base text-foreground/90">{item.nombre}</span>
                <span className="text-lg font-semibold">{item.cantidad}</span>
              </>
            )}
          </div>
        ))}
        {editRaciones && (
          <div className="py-3">
            <button
              type="button"
              onClick={() =>
                setRaciones((prev) => [...prev, { nombre: "", cantidad: "" }])
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              <Plus className="size-3.5" /> Agregar ración
            </button>
          </div>
        )}
      </div>

      {/* Horarios */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Horarios de suministro
        </h2>
        <button
          type="button"
          onClick={() => setEditHorarios((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
        >
          {editHorarios ? (
            <>
              <Check className="size-3.5" /> Listo
            </>
          ) : (
            <>
              <Pencil className="size-3.5" /> Editar
            </>
          )}
        </button>
      </div>
      <div className="mt-4 rounded-2xl bg-card px-6 py-2">
        {horarios.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between gap-3 py-4 ${
              i !== horarios.length - 1 ? "border-b border-border" : ""
            }`}
          >
            {editHorarios ? (
              <>
                <input
                  type="time"
                  value={item.hora}
                  onChange={(e) =>
                    setHorarios((prev) =>
                      prev.map((it, idx) =>
                        idx === i ? { ...it, hora: e.target.value } : it,
                      ),
                    )
                  }
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-base outline-none"
                />
                <input
                  value={item.momento}
                  onChange={(e) =>
                    setHorarios((prev) =>
                      prev.map((it, idx) =>
                        idx === i ? { ...it, momento: e.target.value } : it,
                      ),
                    )
                  }
                  placeholder="Momento"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base outline-none"
                />
                <input
                  value={item.detalle}
                  onChange={(e) =>
                    setHorarios((prev) =>
                      prev.map((it, idx) =>
                        idx === i ? { ...it, detalle: e.target.value } : it,
                      ),
                    )
                  }
                  placeholder="Detalle"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setHorarios((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                  aria-label="Eliminar horario"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <>
                <span className="text-base text-foreground/90">
                  {item.hora} — {item.momento}
                </span>
                <span className="font-semibold">{item.detalle}</span>
              </>
            )}
          </div>
        ))}
        {editHorarios && (
          <div className="py-3">
            <button
              type="button"
              onClick={() =>
                setHorarios((prev) => [
                  ...prev,
                  { hora: "", momento: "", detalle: "" },
                ])
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              <Plus className="size-3.5" /> Agregar horario
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() =>
          onConsult(
            `Necesito alternativas forrajeras al heno de alfalfa para ${cabrasEnLactancia} cabras en lactancia. ¿Qué opciones tengo?`,
          )
        }
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-base font-medium transition-colors hover:bg-secondary"
      >
        ¿Alternativas forrajeras?
        <ArrowUpRight className="size-4" />
      </button>

      <div className="mt-10 flex justify-center">
        <span className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground">
          <ArrowDown className="size-5" />
        </span>
      </div>
    </div>
  )
}
