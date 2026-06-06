import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/client"
import { requireAdmin } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, isAdmin } = await requireAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const updates: { password?: string; app_metadata?: Record<string, unknown> } = {}

    if (typeof body.password === "string" && body.password.length > 0) {
      if (body.password.length < 6) {
        return NextResponse.json(
          { error: "Contraseña mínima de 6 caracteres" },
          { status: 400 },
        )
      }
      updates.password = body.password
    }

    if (typeof body.is_admin === "boolean") {
      if (user!.id === id && body.is_admin === false) {
        return NextResponse.json(
          { error: "No podés quitarte el rol de admin a vos mismo" },
          { status: 400 },
        )
      }
      updates.app_metadata = { is_admin: body.is_admin }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin.auth.admin.updateUserById(id, updates)
    if (error) throw error

    return NextResponse.json({
      usuario: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
        is_admin: data.user.app_metadata?.is_admin === true,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al actualizar usuario"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, isAdmin } = await requireAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { id } = await params

  if (user!.id === id) {
    return NextResponse.json(
      { error: "No podés eliminarte a vos mismo" },
      { status: 400 },
    )
  }

  try {
    const admin = getSupabaseAdmin()
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al eliminar usuario"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
