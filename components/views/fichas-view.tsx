"use client"

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  FormEvent,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react"
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
import type { Cabra, EstadoReproductivo } from "@/lib/data"
import { cn } from "@/lib/utils"

const dotColor: Record<Cabra["dot"], string> = {
  verde: "bg-chart-2",
  azul: "bg-chart-3",
  naranja: "bg-primary",
  gris: "bg-muted-foreground",
}

function calcularEdad(nacimiento: string): string {
  const nac = new Date(nacimiento)
  if (Number.isNaN(nac.getTime())) return "—"
  const diffYears =
    (Date.now() - nac.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return `${Math.max(diffYears, 0).toFixed(1)} años`
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

type FichasViewProps = {
  cabras: Cabra[]
  setCabras: Dispatch<SetStateAction<Cabra[]>>
  loading: boolean
  error: string | null
  onConsult: (prompt: string) => void
}

export function FichasView({ cabras, setCabras, loading, error }: FichasViewProps) {
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string>("")
  const [tab, setTab] = useState<Tab>("Ficha")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Form state
  const [formCaravana, setFormCaravana] = useState("")
  const [formNacimiento, setFormNacimiento] = useState("")
  const [formEstado, setFormEstado] = useState<EstadoReproductivo>("En lactancia")
  const [formCrias, setFormCrias] = useState("")
  const [formObservaciones, setFormObservaciones] = useState("")

  const formEdad = formNacimiento ? calcularEdad(formNacimiento) : "—"
  const isEditing = editingId !== null

  const filtered = useMemo(
    () => cabras.filter((c) => c.caravana.toLowerCase().includes(query.toLowerCase())),
    [cabras, query],
  )

  // Seleccionar la primera cabra una vez que llegan
  useEffect(() => {
    if (!selectedId && cabras.length > 0) {
      setSelectedId(cabras[0].id)
    }
    if (selectedId && !cabras.some((c) => c.id === selectedId)) {
      setSelectedId(cabras[0]?.id ?? "")
    }
  }, [cabras, selectedId])

  const cabra = cabras.find((c) => c.id === selectedId)

  const resetForm = useCallback(() => {
    setFormCaravana("")
    setFormNacimiento("")
    setFormEstado("En lactancia")
    setFormCrias("")
    setFormObservaciones("")
    setFormError(null)
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
    setFormCrias(cabraEditada.crias.join(", "))
    setFormObservaciones(cabraEditada.observaciones || "")
    setFormError(null)
    setModalOpen(true)
  }, [])

  const closeFormModal = useCallback(() => {
    setModalOpen(false)
    setEditingId(null)
    resetForm()
  }, [resetForm])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setSaving(true)

    const criasArray = formCrias
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c !== "")

    const payload = {
      caravana: formCaravana,
      nacimiento: formNacimiento,
      estado: formEstado,
      crias: criasArray,
      observaciones: formObservaciones,
    }

    try {
      const res = await fetch(
        editingId ? `/api/cabras/${editingId}` : "/api/cabras",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al guardar")
      const saved = json.cabra as Cabra

      if (editingId) {
        setCabras((prev) => prev.map((c) => (c.id === editingId ? saved : c)))
      } else {
        setCabras((prev) => [saved, ...prev])
      }
      setSelectedId(saved.id)
      closeFormModal()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cabraId: string) {
    try {
      const res = await fetch(`/api/cabras/${cabraId}`, { method: "DELETE" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Error al eliminar")
      setCabras((prev) => prev.filter((c) => c.id !== cabraId))
      setTab("Ficha")
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Error al eliminar")
    }
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
              <span className="text-xs text-muted-foreground">{formEdad}</span>
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
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeFormModal} disabled={saving} className="px-5 py-2.5 rounded-xl border disabled:opacity-50">Cancelar</button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50">
                {saving ? "Guardando..." : "Guardar"}
              </button>
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

          {loading && (
            <p className="px-2 text-sm text-muted-foreground">Cargando cabras...</p>
          )}
          {error && (
            <p className="px-2 text-sm text-destructive">{error}</p>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="px-2 text-sm text-muted-foreground">
              {cabras.length === 0
                ? "Aún no hay cabras. Creá la primera con \"Nueva cabra\"."
                : "Sin resultados."}
            </p>
          )}

          {filtered.map((c) => {
            const isSelected = c.id === selectedId
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-3 py-3 text-left",
                  isSelected
                    ? "bg-[#F5E6CC] border-l-4 border-l-primary"
                    : "border-transparent hover:bg-card",
                )}
              >
                <span className={cn(
                  "flex size-11 items-center justify-center rounded-full text-xs font-bold",
                  isSelected ? "bg-primary/20 text-black" : "bg-primary/10 text-foreground",
                )}>
                  {c.caravana}
                </span>
                <span className={cn(
                  "flex-1 font-semibold",
                  isSelected ? "text-black" : "text-foreground",
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
                {tab !== "Ficha" && (
                  <p className="text-muted-foreground">Sección pendiente.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">
                {loading ? "Cargando..." : "Selecciona una cabra."}
              </p>
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
