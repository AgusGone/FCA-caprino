import { CabrasApiError } from "@/lib/supabase/cabras"

export type OrdenoDiarioRow = {
  fecha: string
  litros: number | string
  created_at?: string
}

export type OrdenoDiario = {
  fecha: string
  litros: number
}

export function mapOrdenoRow(row: OrdenoDiarioRow): OrdenoDiario {
  return {
    fecha: row.fecha,
    litros: Number(row.litros),
  }
}

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/

export function parseFecha(value: unknown): string {
  const s = String(value ?? "").trim()
  if (!FECHA_RE.test(s) || Number.isNaN(Date.parse(s))) {
    throw new CabrasApiError("Fecha inválida (esperado YYYY-MM-DD)")
  }
  return s
}

export function parseLitros(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) {
    throw new CabrasApiError("Litros debe ser >= 0")
  }
  return n
}
