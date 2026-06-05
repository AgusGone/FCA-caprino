"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

const DIAS_LABEL = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

type RegistroApi = { fecha: string; litros: number }
type DiaSemana = { dia: string; fecha: string; litros: number }

// YYYY-MM-DD en huso local (no UTC).
function fechaLocalISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// Lunes 00:00 de la semana actual (en huso local).
function lunesDeEstaSemana(): Date {
  const hoy = new Date()
  const diaSemana = hoy.getDay() // 0 = Dom
  const offset = (diaSemana + 6) % 7 // días desde el último lunes
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - offset)
  lunes.setHours(0, 0, 0, 0)
  return lunes
}

function construirSemana(registros: RegistroApi[]): DiaSemana[] {
  const lunes = lunesDeEstaSemana()
  const porFecha = new Map(registros.map((r) => [r.fecha, r.litros]))
  return DIAS_LABEL.map((label, i) => {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    const fecha = fechaLocalISO(d)
    return { dia: label, fecha, litros: porFecha.get(fecha) ?? 0 }
  })
}

export function OrdenoView({
  cabrasEnLactancia,
}: {
  cabrasEnLactancia: number
}) {
  const [semana, setSemana] = useState<DiaSemana[]>(() => construirSemana([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nuevoValor, setNuevoValor] = useState("")
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch("/api/ordeno")
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Error al cargar ordeño")
        return (json.registros ?? []) as RegistroApi[]
      })
      .then((registros) => {
        if (!cancelled) setSemana(construirSemana(registros))
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const indiceHoy = useMemo(() => {
    const fechaHoy = fechaLocalISO(new Date())
    return Math.max(
      semana.findIndex((d) => d.fecha === fechaHoy),
      0,
    )
  }, [semana])

  const hoy = semana[indiceHoy]?.litros ?? 0
  const totalSemana = semana.reduce((acc, curr) => acc + curr.litros, 0)
  const promedioCabra =
    cabrasEnLactancia > 0 ? (hoy / cabrasEnLactancia).toFixed(1) : "—"

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const litros = Number(nuevoValor)
    if (!Number.isFinite(litros) || litros <= 0) {
      setFormError("Ingresá un número mayor a 0")
      return
    }

    setSaving(true)
    try {
      const fecha = fechaLocalISO(new Date())
      const res = await fetch("/api/ordeno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha, litros }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al guardar")

      // Patch local del día actual
      setSemana((prev) =>
        prev.map((d) => (d.fecha === fecha ? { ...d, litros } : d)),
      )
      setNuevoValor("")
      setOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Ordeño</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Plus className="size-4" />
              Registrar hoy
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar litros de hoy</DialogTitle>
              <DialogDescription>
                Ingresa la cantidad total de litros obtenidos en el ordeño de hoy.
                Si ya cargaste un valor para hoy, este lo sobreescribe.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGuardar} className="flex flex-col gap-4">
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Litros obtenidos"
                value={nuevoValor}
                onChange={(e) => setNuevoValor(e.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar producción"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hoy</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{hoy} L</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {loading ? "Cargando..." : "Producción registrada"}
            </p>
        </div>
        <div className="rounded-2xl bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Promedio cabra</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{promedioCabra} L</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {cabrasEnLactancia} en lactancia
            </p>
        </div>
        <div className="rounded-2xl bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Semana</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{totalSemana} L</p>
            <p className="mt-2 text-sm text-muted-foreground">Acumulado semanal</p>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Producción de la semana (litros/día)
      </h2>
      <div className="mt-4 h-72 w-full rounded-2xl bg-card p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={semana} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="dia" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis domain={[0, "auto"]} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Line type="monotone" dataKey="litros" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: "var(--primary)", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
