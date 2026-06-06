import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/client"
import { requireAdmin } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.auth.admin.listUsers()
    if (error) throw error
    const usuarios = data.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      is_admin: u.app_metadata?.is_admin === true,
    }))
    return NextResponse.json({ usuarios })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al listar usuarios"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const email = String(body.email ?? "").trim()
    const password = String(body.password ?? "")
    const makeAdmin = body.is_admin === true

    if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    if (password.length < 6) {
      return NextResponse.json({ error: "Contraseña mínima de 6 caracteres" }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: makeAdmin ? { is_admin: true } : {},
    })
    if (error) throw error
    return NextResponse.json({
      usuario: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
        is_admin: makeAdmin,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al crear usuario"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
