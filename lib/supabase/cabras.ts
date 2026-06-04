import { createClient } from "@supabase/supabase-js"
import type { Cabra, EstadoReproductivo } from "@/nextjs-dashboard/lib/data"

export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new CabrasApiError(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.",
      500,
    )
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}

function calcularEdad(nacimiento: string): string {
  const nac = new Date(nacimiento)

  if (Number.isNaN(nac.getTime())) {
    return "Sin fecha"
  }

  const hoy = new Date()
  const diffMs = hoy.getTime() - nac.getTime()
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25)
  return `${Math.max(diffYears, 0).toFixed(1)} años`
}

const estadosReproductivos = [
  "En lactancia",
  "Gestante",
  "Seca",
  "Vacía",
  "Cabrita",
] as const

const dotPorEstado: Record<EstadoReproductivo, Cabra["dot"]> = {
  "En lactancia": "verde",
  Gestante: "azul",
  Seca: "naranja",
  Vacía: "gris",
  Cabrita: "gris",
}

const dotValues = ["verde", "azul", "naranja", "gris"] as const

export const mapCabraRow = (row: any): Cabra => ({
  id: row.id,
  caravana: row.caravana,
  nacimiento: row.nacimiento,
  edad: calcularEdad(row.nacimiento),
  estado: row.estado,
  partos: row.partos,
  promedio: Number(row.promedio),
  dot: row.dot,
  produccion: row.produccion ?? [],
  historialPartos: row.historial_partos ?? [],
  sanidad: row.sanidad ?? [],
})

export const parseCabraBody = (body: any) => {
  const caravana = String(body.caravana ?? "").trim()
  const nacimiento = String(body.nacimiento ?? "").trim()
  const estado = String(body.estado ?? "").trim()
  const partos = Number(body.partos ?? 0)
  const promedio = Number(body.promedio ?? 0)

  if (!caravana) throw new CabrasApiError("Caravana requerida")
  if (!nacimiento || Number.isNaN(Date.parse(nacimiento))) {
    throw new CabrasApiError("Fecha de nacimiento inválida")
  }
  if (!estadosReproductivos.includes(estado as EstadoReproductivo)) {
    throw new CabrasApiError("Estado reproductivo inválido")
  }
  if (!Number.isFinite(partos) || partos < 0) {
    throw new CabrasApiError("Partos debe ser un número mayor o igual a 0")
  }
  if (!Number.isFinite(promedio) || promedio < 0) {
    throw new CabrasApiError("Promedio debe ser un número mayor o igual a 0")
  }

  const dot = dotValues.includes(body.dot)
    ? body.dot
    : dotPorEstado[estado as EstadoReproductivo]

  return {
    caravana,
    nacimiento,
    estado,
    partos: Math.trunc(partos),
    promedio,
    dot,
  }
}

export const parseCabraId = (id: string) => {
  const parsed = String(id ?? "").trim()
  if (!parsed) throw new CabrasApiError("ID requerido")
  return parsed
}

export class CabrasApiError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}
