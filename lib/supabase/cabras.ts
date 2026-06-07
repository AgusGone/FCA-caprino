import type { Cabra, EstadoReproductivo, Sexo } from "@/lib/data"

const estadosReproductivos = [
  "En lactancia",
  "Gestante",
  "Seca",
  "Vacía",
  "Cabrita",
] as const

const sexos = ["Hembra", "Macho"] as const

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
  if (!nacimiento) return "Sin fecha"
  // Parseamos YYYY-MM-DD como medianoche local para evitar desfases por huso
  // horario que dejaban a cabritos nacidos el mismo día con edad "0 meses" o "—".
  const m = nacimiento.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const nac = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(nacimiento)
  if (Number.isNaN(nac.getTime())) return "Sin fecha"
  const diffMs = Date.now() - nac.getTime()
  if (diffMs < 0) return "Sin fecha"
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (dias < 1) return "Hoy"
  if (dias < 14) return `${dias} ${dias === 1 ? "día" : "días"}`
  if (dias < 60) {
    const semanas = Math.floor(dias / 7)
    return `${semanas} ${semanas === 1 ? "semana" : "semanas"}`
  }
  const meses = Math.floor(dias / 30.4375)
  if (meses < 12) return `${meses} ${meses === 1 ? "mes" : "meses"}`
  const anios = dias / 365.25
  return `${anios.toFixed(1)} años`
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
  sexo: Sexo | null
  estado: EstadoReproductivo
  partos: number
  promedio: number | string
  dot: Dot
  produccion: Cabra["produccion"] | null
  historial_partos: Cabra["historialPartos"] | null
  sanidad: Cabra["sanidad"] | null
  pesos: Cabra["pesos"] | null
  crias: string[] | null
  observaciones: string | null
}

export function mapCabraRow(row: CabraRow): Cabra {
  return {
    id: row.id,
    caravana: row.caravana,
    nacimiento: row.nacimiento,
    edad: calcularEdad(row.nacimiento),
    sexo: row.sexo ?? "Hembra",
    estado: row.estado,
    partos: row.partos,
    promedio: Number(row.promedio),
    dot: row.dot,
    produccion: row.produccion ?? [],
    historialPartos: row.historial_partos ?? [],
    sanidad: row.sanidad ?? [],
    pesos: row.pesos ?? [],
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

  if (has("sexo")) {
    const v = String(body.sexo ?? "").trim()
    if (!sexos.includes(v as Sexo)) {
      throw new CabrasApiError("Sexo inválido (Hembra o Macho)")
    }
    out.sexo = v
  } else if (!partial) {
    out.sexo = "Hembra"
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

  // Los jsonb pesados (produccion, historial_partos, sanidad, pesos) los aceptamos
  // tal cual si vienen, sin validación estructural por ahora.
  if (has("produccion")) out.produccion = body.produccion ?? []
  if (has("historialPartos")) out.historial_partos = body.historialPartos ?? []
  if (has("sanidad")) out.sanidad = body.sanidad ?? []
  if (has("pesos")) {
    if (!Array.isArray(body.pesos)) {
      throw new CabrasApiError("pesos debe ser array")
    }
    out.pesos = body.pesos.map((p: any) => ({
      fecha: String(p?.fecha ?? ""),
      kg: Number(p?.kg) || 0,
    }))
  }

  return out
}
