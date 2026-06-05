import { getSupabaseAdmin } from "@/lib/supabase/client"
import {
  CabrasApiError,
  mapCabraRow,
  parseCabraBody,
} from "@/lib/supabase/cabras"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    if (!id) throw new CabrasApiError("ID requerido")
    const body = await req.json()
    const update = parseCabraBody(body, { partial: true })
    if (Object.keys(update).length === 0) {
      throw new CabrasApiError("Sin campos para actualizar")
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("cabras")
      .update(update)
      .eq("id", id)
      .select("*")
      .single()

    if (error) throw error
    if (!data) throw new CabrasApiError("Cabra no encontrada", 404)
    return Response.json({ cabra: mapCabraRow(data) })
  } catch (error) {
    console.error("PATCH /api/cabras/[id] error:", error)
    const status = error instanceof CabrasApiError ? error.status : 500
    const message =
      error instanceof Error ? error.message : "Error al actualizar cabra"
    return Response.json({ error: message }, { status })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    if (!id) throw new CabrasApiError("ID requerido")

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from("cabras").delete().eq("id", id)
    if (error) throw error
    return Response.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/cabras/[id] error:", error)
    const status = error instanceof CabrasApiError ? error.status : 500
    const message =
      error instanceof Error ? error.message : "Error al eliminar cabra"
    return Response.json({ error: message }, { status })
  }
}
