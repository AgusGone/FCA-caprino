import type { Cabra, EstadoReproductivo } from "@/lib/data"

const estadosReproductivos = [
  "En lactancia",
  "Gestante",
  "Seca",
  "Vacía",
  "Cabrita",
] as const

const dotValues = ["verde", "azul", "naranja", "gris"] as const
type Dot = (typeof dotValues)[number]

const dotPorEstado: Record<EstadoReproductivo, Dot> = {
  "En lactancia": "verde",
  Gestante: "azul",
  Seca: "naranja",
  Vacía: "gris",
  Cabrita: "gris",
}

function calcularEdad(nacimiento: string): string {
  const nac = new Date(nacimiento)
  if (Number.isNaN(nac.getTime())) return "Sin fecha"
  const diffMs = Math.max(Date.now() - nac.getTime(), 0)
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25)
  if (diffYears < 1) {
    const meses = Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375)), 0)
    return `${meses} ${meses === 1 ? "mes" : "meses"}`
  }
  return `${diffYears.toFixed(1)} años`
}

export class CabrasApiError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
  }
}

// Filas crudas que devuelve Supabase (snake_case, jsonb sin parsear)
type CabraRow = {
  id: string
  caravana: string
  nacimiento: string
  estado: EstadoReproductivo
  partos: number
  promedio: number | string
  dot: Dot
  produccion: Cabra["produccion"] | null
  historial_partos: Cabra["historialPartos"] | null
  sanidad: Cabra["sanidad"] | null
  crias: string[] | null
  observaciones: string | null
}

export function mapCabraRow(row: CabraRow): Cabra {
  return {
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
    crias: row.crias ?? [],
    observaciones: row.observaciones ?? "",
  }
}

// Payload que aceptamos del frontend en POST/PATCH (en camelCase, como el tipo Cabra).
// Devolvemos columnas en snake_case listas para insertar.
export function parseCabraBody(body: any, opts: { partial?: boolean } = {}) {
  const partial = opts.partial === true
  const out: Record<string, unknown> = {}

  const has = (k: string) =>
    body != null && Object.prototype.hasOwnProperty.call(body, k)

  if (has("caravana")) {
    const v = String(body.caravana ?? "").trim()
    if (!v) throw new CabrasApiError("Caravana requerida")
    out.caravana = v
  } else if (!partial) {
    throw new CabrasApiError("Caravana requerida")
  }

  if (has("nacimiento")) {
    const v = String(body.nacimiento ?? "").trim()
    if (!v || Number.isNaN(Date.parse(v))) {
      throw new CabrasApiError("Fecha de nacimiento inválida")
    }
    out.nacimiento = v
  } else if (!partial) {
    throw new CabrasApiError("Fecha de nacimiento requerida")
  }

  if (has("estado")) {
    const v = String(body.estado ?? "").trim()
    if (!estadosReproductivos.includes(v as EstadoReproductivo)) {
      throw new CabrasApiError("Estado reproductivo inválido")
    }
    out.estado = v
  } else if (!partial) {
    throw new CabrasApiError("Estado requerido")
  }

  if (has("partos")) {
    const n = Number(body.partos)
    if (!Number.isFinite(n) || n < 0) {
      throw new CabrasApiError("Partos debe ser >= 0")
    }
    out.partos = Math.trunc(n)
  }

  if (has("promedio")) {
    const n = Number(body.promedio)
    if (!Number.isFinite(n) || n < 0) {
      throw new CabrasApiError("Promedio debe ser >= 0")
    }
    out.promedio = n
  }

  if (has("dot")) {
    if (!dotValues.includes(body.dot)) {
      throw new CabrasApiError("Dot inválido")
    }
    out.dot = body.dot
  } else if (!partial && has("estado")) {
    out.dot = dotPorEstado[out.estado as EstadoReproductivo]
  }

  if (has("observaciones")) {
    out.observaciones = String(body.observaciones ?? "")
  }

  if (has("crias")) {
    if (!Array.isArray(body.crias)) {
      throw new CabrasApiError("crias debe ser array")
    }
    out.crias = body.crias.map((c: unknown) => String(c))
  }

  // Los jsonb pesados (produccion, historial_partos, sanidad) los aceptamos
  // tal cual si vienen, sin validación estructural por ahora.
  if (has("produccion")) out.produccion = body.produccion ?? []
  if (has("historialPartos")) out.historial_partos = body.historialPartos ?? []
  if (has("sanidad")) out.sanidad = body.sanidad ?? []

  return out
}
