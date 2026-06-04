"use client"

import { useState, useCallback, FormEvent, ReactNode } from "react"
import {
  Search,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Cabra, type EstadoReproductivo, cabras as initialCabras } from "@/lib/data"
import { cn } from "@/lib/utils"

const dotColor: Record<Cabra["dot"], string> = {
  verde: "bg-chart-2",
  azul: "bg-chart-3",
  naranja: "bg-primary",
  gris: "bg-muted-foreground",
}

function calcularEdad(nacimiento: string): string {
  const nac = new Date(nacimiento)
  const hoy = new Date()
  const diffMs = hoy.getTime() - nac.getTime()
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25)
  return `${diffYears.toFixed(1)} años`
}

function EstadoBadge({ estado }: { estado: EstadoReproductivo }) {
  const styles: Record<EstadoReproductivo, string> = {
    "En lactancia": "bg-chart-2/15 text-chart-2",
    Gestante: "bg-chart-3/15 text-chart-3",
    Seca: "bg-primary/15 text-primary",
    Vacía: "bg-muted text-muted-foreground",
    Cabrita: "bg-accent text-accent-foreground",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium",
        styles[estado],
      )}
    >
      {estado}
    </span>
  )
}

const tabs = ["Ficha", "Producción", "Partos", "Sanidad"] as const
type Tab = (typeof tabs)[number]

const estadosReproductivos: EstadoReproductivo[] = [
  "En lactancia",
  "Gestante",
  "Seca",
  "Vacía",
  "Cabrita",
]

export function FichasView({
  onConsult,
}: {
  onConsult: (prompt: string) => void
}) {
  const [cabras, setCabras] = useState<Cabra[]>(initialCabras)
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(initialCabras[0]?.id || "")
  const [tab, setTab] = useState<Tab>("Ficha")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [formCaravana, setFormCaravana] = useState("")
  const [formNacimiento, setFormNacimiento] = useState("")
  const [formEstado, setFormEstado] = useState<EstadoReproductivo>("En lactancia")
  const [formPartos, setFormPartos] = useState("0")
  const [formPromedio, setFormPromedio] = useState("0.0")
  const [formCrias, setFormCrias] = useState("")
  const [formObservaciones, setFormObservaciones] = useState("")

  const formEdad = formNacimiento ? calcularEdad(formNacimiento) : "—"
  const isEditing = editingId !== null

  const filtered = cabras.filter((c) =>
    c.caravana.toLowerCase().includes(query.toLowerCase()),
  )
  const cabra = cabras.find((c) => c.id === selectedId)

  const resetForm = useCallback(() => {
    setFormCaravana("")
    setFormNacimiento("")
    setFormEstado("En lactancia")
    setFormPartos("0")
    setFormPromedio("0.0")
    setFormCrias("")
    setFormObservaciones("")
  }, [])

  const openCreateModal = useCallback(() => {
    setEditingId(null)
    resetForm()
    setModalOpen(true)
  }, [resetForm])

  const openEditModal = useCallback((cabraEditada: Cabra) => {
    setEditingId(cabraEditada.id)
    setFormCaravana(cabraEditada.caravana)
    setFormNacimiento(cabraEditada.nacimiento)
    setFormEstado(cabraEditada.estado)
    setFormPartos(String(cabraEditada.partos))
    setFormPromedio(String(cabraEditada.promedio))
    setFormCrias(cabraEditada.crias.join(", "))
    setFormObservaciones(cabraEditada.observaciones || "")
    setModalOpen(true)
  }, [])

  const closeFormModal = useCallback(() => {
    setModalOpen(false)
    setEditingId(null)
    resetForm()
  }, [resetForm])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    const criasArray = formCrias.split(",").map(c => c.trim()).filter(c => c !== "")

    const newCabra: Cabra = {
      id: editingId || Math.floor(Math.random() * 10000).toString(),
      caravana: formCaravana,
      nacimiento: formNacimiento,
      edad: formEdad,
      estado: formEstado,
      partos: parseInt(formPartos),
      promedio: parseFloat(formPromedio),
      dot: "verde",
      produccion: [],
      historialPartos: [],
      sanidad: [],
      crias: criasArray,
      observaciones: formObservaciones
    }

    if (editingId) {
      setCabras((prev) => prev.map((c) => (c.id === editingId ? newCabra : c)))
    } else {
      setCabras((prev) => [newCabra, ...prev])
    }
    
    setSelectedId(newCabra.id)
    closeFormModal()
  }

  function handleDelete(cabraId: string) {
    const restantes = cabras.filter((c) => c.id !== cabraId)
    setCabras(restantes)
    setSelectedId(restantes[0]?.id ?? "")
    setTab("Ficha")
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-4 px-5 py-5 md:px-8">
        <h1 className="text-xl font-semibold tracking-tight">Fichas de cabras</h1>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {cabras.length} animales
          </span>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            <Plus className="size-4" />
            Nueva cabra
          </button>
        </div>
      </header>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar cabra" : "Nueva cabra"}</DialogTitle>
            <DialogDescription>
               {isEditing 
                ? "Actualiza los datos del ejemplar seleccionado." 
                : "Completa el formulario para registrar un nuevo ejemplar."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Número de caravana</label>
              <input value={formCaravana} onChange={(e) => setFormCaravana(e.target.value)} required className="rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Fecha de nacimiento</label>
              <input type="date" value={formNacimiento} onChange={(e) => setFormNacimiento(e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Estado reproductivo</label>
              <Select value={formEstado} onValueChange={(v) => setFormEstado(v as EstadoReproductivo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {estadosReproductivos.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Caravanas de crías (separadas por coma)</label>
              <input 
                placeholder="Ej: 25, 27" 
                value={formCrias} 
                onChange={(e) => setFormCrias(e.target.value)} 
                className="rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Observaciones</label>
              <textarea 
                value={formObservaciones} 
                onChange={(e) => setFormObservaciones(e.target.value)} 
                className="rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring min-h-[80px]" 
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeFormModal} className="px-5 py-2.5 rounded-xl border">Cancelar</button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium">Guardar</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid flex-1 gap-px overflow-hidden border-t border-border md:grid-cols-[20rem_1fr]">
        <div className="flex flex-col gap-3 overflow-y-auto bg-background p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-3 outline-none" />
          </div>

          {filtered.map((c) => {
            const isSelected = c.id === selectedId;
            return (
              <button 
                key={c.id} 
                onClick={() => setSelectedId(c.id)} 
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-3 py-3 text-left", 
                  isSelected 
                    ? "bg-[#F5E6CC] border-l-4 border-l-primary" 
                    : "border-transparent hover:bg-card"
                )}
              >
                <span className={cn(
                  "flex size-11 items-center justify-center rounded-full text-xs font-bold",
                  isSelected ? "bg-primary/20 text-black" : "bg-primary/10 text-foreground"
                )}>
                  #{c.id}
                </span>
                <span className={cn(
                  "flex-1 font-semibold",
                  isSelected ? "text-black" : "text-foreground"
                )}>
                  Caravana {c.caravana}
                </span>
                <span className={cn("size-2.5 rounded-full", dotColor[c.dot])} />
              </button>
            )
          })}
        </div>

        <div className="overflow-y-auto bg-background">
          {cabra ? (
            <div className="mx-auto max-w-2xl px-5 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-semibold">Caravana {cabra.caravana}</h2>
                  <div className="mt-2 flex gap-3">
                    <EstadoBadge estado={cabra.estado} />
                    <span className="text-muted-foreground">{cabra.edad}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(cabra)} className="p-2 border rounded-xl"><Pencil className="size-5" /></button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><button className="p-2 border rounded-xl text-destructive"><Trash2 className="size-5" /></button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>¿Eliminar?</AlertDialogTitle></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(cabra.id)}>Sí, eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="mt-6 border-b flex gap-6">
                {tabs.map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={cn("pb-3 border-b-2", tab === t ? "border-primary text-primary" : "border-transparent")}>{t}</button>
                ))}
              </div>
              <div className="py-6">
                {tab === "Ficha" && (
                    <div className="flex flex-col">
                        <Row label="Caravana">{cabra.caravana}</Row>
                        <Row label="Estado">{cabra.estado}</Row>
                        <Row label="Partos">{cabra.partos}</Row>
                        <Row label="Crías">
                           {cabra.crias.length > 0 ? cabra.crias.join(", ") : "Sin crías"}
                        </Row>
                        <Row label="Observaciones">
                           <span className="text-sm italic">{cabra.observaciones || "Sin observaciones"}</span>
                        </Row>
                    </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Selecciona una cabra.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b py-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-right">{children}</span>
    </div>
  )
}