"use client"

import { useState, useEffect } from "react"
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

const DIAS_INICIALES = [
  { dia: "Lun", litros: 0 },
  { dia: "Mar", litros: 0 },
  { dia: "Mié", litros: 0 },
  { dia: "Jue", litros: 0 },
  { dia: "Vie", litros: 0 },
  { dia: "Sáb", litros: 0 },
  { dia: "Dom", litros: 0 },
]

// Índice en DIAS_INICIALES del día actual (semana arranca lunes).
// Date.getDay(): Dom=0, Lun=1, ..., Sáb=6 → convertimos a Lun=0, ..., Dom=6.
function getIndiceHoy() {
  return (new Date().getDay() + 6) % 7
}

export function OrdenoView() {
  const [semana, setSemana] = useState(DIAS_INICIALES)
  const [nuevoValor, setNuevoValor] = useState("")
  const [open, setOpen] = useState(false)

  // Cargar datos y verificar si cambió el día
  useEffect(() => {
    const guardado = localStorage.getItem("ordeño-data")
    const hoy = new Date().toDateString()

    if (guardado) {
      try {
        const { data, date } = JSON.parse(guardado)
        
        // Si la fecha guardada es distinta a hoy, reseteamos el valor del día actual
        // (todavía no se cargó) para que el usuario lo registre.
        if (date !== hoy) {
          const indiceHoy = getIndiceHoy()
          const resetData = data.map((item: any, index: number) =>
            index === indiceHoy ? { ...item, litros: 0 } : item
          )
          setSemana(resetData)
        } else {
          setSemana(data)
        }
      } catch (e) {
        setSemana(DIAS_INICIALES)
      }
    }
  }, [])

  // Guardar datos y la fecha actual cada vez que cambia el estado
  useEffect(() => {
    const hoy = new Date().toDateString()
    localStorage.setItem("ordeño-data", JSON.stringify({ data: semana, date: hoy }))
  }, [semana])

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault()
    const litros = Number(nuevoValor)
    if (isNaN(litros) || litros <= 0) return

    const indiceHoy = getIndiceHoy()
    const nuevaSemana = [...semana]
    nuevaSemana[indiceHoy] = {
      ...nuevaSemana[indiceHoy],
      litros: litros,
    }
    setSemana(nuevaSemana)
    setNuevoValor("")
    setOpen(false)
  }

  const hoy = semana[getIndiceHoy()].litros
  const totalSemana = semana.reduce((acc, curr) => acc + curr.litros, 0)
  const promedioCabra = (hoy / 32).toFixed(1)

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
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGuardar} className="flex flex-col gap-4">
              <input
                type="number"
                placeholder="Litros obtenidos"
                value={nuevoValor}
                onChange={(e) => setNuevoValor(e.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground">
                Guardar producción
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hoy</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{hoy} L</p>
            <p className="mt-2 text-sm text-muted-foreground">Producción registrada</p>
        </div>
        <div className="rounded-2xl bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Promedio cabra</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{promedioCabra} L</p>
            <p className="mt-2 text-sm text-muted-foreground">32 en lactancia</p>
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
            <YAxis domain={[40, 70]} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Line type="monotone" dataKey="litros" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: "var(--primary)", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}