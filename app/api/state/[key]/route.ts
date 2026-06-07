import { getSupabaseAdmin } from "@/lib/supabase/client"

export const dynamic = "force-dynamic"

const ALLOWED_KEYS = new Set([
  "rutinas",
  "limpieza",
  "alimentacion_raciones",
  "alimentacion_horarios",
])

function checkKey(key: string) {
  if (!ALLOWED_KEYS.has(key)) {
    return Response.json({ error: "Clave no permitida" }, { status: 400 })
  }
  return null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await params
    const bad = checkKey(key)
    if (bad) return bad

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("app_state")
      .select("value, updated_at")
      .eq("key", key)
      .maybeSingle()

    if (error) throw error
    return Response.json({
      value: data?.value ?? null,
      updated_at: data?.updated_at ?? null,
    })
  } catch (error) {
    console.error("GET /api/state/[key] error:", error)
    const message =
      error instanceof Error ? error.message : "Error al leer estado"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await params
    const bad = checkKey(key)
    if (bad) return bad

    const body = await req.json()
    if (!Object.prototype.hasOwnProperty.call(body ?? {}, "value")) {
      return Response.json({ error: "Falta 'value'" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("app_state")
      .upsert(
        { key, value: body.value, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      )
      .select("value, updated_at")
      .single()

    if (error) throw error
    return Response.json({ value: data.value, updated_at: data.updated_at })
  } catch (error) {
    console.error("PUT /api/state/[key] error:", error)
    const message =
      error instanceof Error ? error.message : "Error al guardar estado"
    return Response.json({ error: message }, { status: 500 })
  }
}
