import { getSupabaseAdmin } from "@/lib/supabase/client"
import { CabrasApiError } from "@/lib/supabase/cabras"
import {
  mapOrdenoRow,
  parseFecha,
  parseLitros,
  type OrdenoDiarioRow,
} from "@/lib/supabase/ordeno"

export const dynamic = "force-dynamic"

// Devuelve los registros de los últimos 14 días. El cliente arma la semana
// (Lun-Dom) en su huso horario local y matchea por fecha.
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const desde = new Date()
    desde.setUTCDate(desde.getUTCDate() - 14)
    const desdeStr = desde.toISOString().slice(0, 10)

    const { data, error } = await supabase
      .from("ordeno_diario")
      .select("*")
      .gte("fecha", desdeStr)
      .order("fecha", { ascending: true })

    if (error) throw error
    return Response.json({
      registros: (data ?? []).map((r: OrdenoDiarioRow) => mapOrdenoRow(r)),
    })
  } catch (error) {
    console.error("GET /api/ordeno error:", error)
    const status = error instanceof CabrasApiError ? error.status : 500
    const message =
      error instanceof Error ? error.message : "Error al listar ordeño"
    return Response.json({ error: message }, { status })
  }
}

// Upsert por fecha. Si el cliente no manda fecha, usamos la fecha UTC actual
// (el cliente normalmente manda la fecha local, así evitamos drift por TZ).
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const litros = parseLitros(body?.litros)
    const fecha = body?.fecha
      ? parseFecha(body.fecha)
      : new Date().toISOString().slice(0, 10)

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("ordeno_diario")
      .upsert({ fecha, litros }, { onConflict: "fecha" })
      .select("*")
      .single()

    if (error) throw error
    return Response.json({ registro: mapOrdenoRow(data) }, { status: 201 })
  } catch (error) {
    console.error("POST /api/ordeno error:", error)
    const status = error instanceof CabrasApiError ? error.status : 500
    const message =
      error instanceof Error ? error.message : "Error al guardar ordeño"
    return Response.json({ error: message }, { status })
  }
}
