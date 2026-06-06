"use client"

import { useEffect, useState, FormEvent } from "react"
import { Plus, Trash2, KeyRound, Shield, ShieldOff } from "lucide-react"
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

type Usuario = {
  id: string
  email: string | undefined
  created_at: string
  is_admin: boolean
}

export function UsuariosView({ currentUserId }: { currentUserId: string }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formIsAdmin, setFormIsAdmin] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [passwordOpenId, setPasswordOpenId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/usuarios")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al cargar")
      setUsuarios(json.usuarios)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail, password: formPassword, is_admin: formIsAdmin }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al crear")
      setUsuarios((prev) => [...prev, json.usuario])
      setCreateOpen(false)
      setFormEmail("")
      setFormPassword("")
      setFormIsAdmin(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error")
    } finally {
      setSaving(false)
    }
  }

  async function toggleAdmin(u: Usuario) {
    try {
      const res = await fetch(`/api/usuarios/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: !u.is_admin }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error")
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? json.usuario : x)))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error")
    }
  }

  async function changePassword(id: string) {
    if (newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres")
      return
    }
    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error")
      setPasswordOpenId(null)
      setNewPassword("")
      alert("Contraseña actualizada")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error")
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Error")
      setUsuarios((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error")
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
          <p className="mt-2 text-muted-foreground">Dar de alta y administrar accesos.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
        >
          <Plus className="size-4" /> Nuevo usuario
        </button>
      </div>

      {loading && <p className="mt-6 text-sm text-muted-foreground">Cargando...</p>}
      {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <ul className="mt-6 flex flex-col gap-2">
          {usuarios.map((u) => {
            const isSelf = u.id === currentUserId
            return (
              <li key={u.id} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{u.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.is_admin ? "Administrador" : "Usuario"} {isSelf && "· vos"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordOpenId(u.id)}
                  className="rounded-lg border border-border p-2 text-sm hover:bg-secondary"
                  title="Cambiar contraseña"
                >
                  <KeyRound className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleAdmin(u)}
                  disabled={isSelf && u.is_admin}
                  className="rounded-lg border border-border p-2 text-sm hover:bg-secondary disabled:opacity-40"
                  title={u.is_admin ? "Quitar admin" : "Hacer admin"}
                >
                  {u.is_admin ? <ShieldOff className="size-4" /> : <Shield className="size-4" />}
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      disabled={isSelf}
                      className="rounded-lg border border-border p-2 text-destructive hover:bg-secondary disabled:opacity-40"
                      title="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar {u.email}?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(u.id)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>Definí email y contraseña iniciales.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Contraseña</label>
              <input
                type="text"
                required
                minLength={6}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formIsAdmin}
                onChange={(e) => setFormIsAdmin(e.target.checked)}
              />
              Marcar como administrador
            </label>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl border disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50"
              >
                {saving ? "Creando..." : "Crear"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={passwordOpenId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordOpenId(null)
            setNewPassword("")
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nueva contraseña"
            className="rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setPasswordOpenId(null)
                setNewPassword("")
              }}
              className="px-5 py-2.5 rounded-xl border"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => passwordOpenId && changePassword(passwordOpenId)}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium"
            >
              Guardar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
