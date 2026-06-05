import { getSupabaseAdmin } from "@/lib/supabase/client"
import {
  CabrasApiError,
  mapCabraRow,
  parseCabraBody,
} from "@/lib/supabase/cabras"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("cabras")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return Response.json({ cabras: (data ?? []).map(mapCabraRow) })
  } catch (error) {
    console.error("GET /api/cabras error:", error)
    const status = error instanceof CabrasApiError ? error.status : 500
    const message =
      error instanceof Error ? error.message : "Error al listar cabras"
    return Response.json({ error: message }, { status })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const insert = parseCabraBody(body, { partial: false })
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("cabras")
      .insert(insert)
      .select("*")
      .single()

    if (error) throw error
    return Response.json({ cabra: mapCabraRow(data) }, { status: 201 })
  } catch (error) {
    console.error("POST /api/cabras error:", error)
    const status = error instanceof CabrasApiError ? error.status : 500
    const message =
      error instanceof Error ? error.message : "Error al crear cabra"
    return Response.json({ error: message }, { status })
  }
}
