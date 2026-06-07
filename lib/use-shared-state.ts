"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createSupabaseBrowser } from "@/lib/supabase/browser"

type Status = "loading" | "ready" | "error"

export function useSharedState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(fallback)
  const [status, setStatus] = useState<Status>("loading")
  const [error, setError] = useState<string | null>(null)
  const lastSyncedRef = useRef<string | null>(null)
  const skipNextRealtimeRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingValueRef = useRef<T | null>(null)

  // Carga inicial vía API.
  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    fetch(`/api/state/${key}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Error al cargar")
        return json as { value: T | null; updated_at: string | null }
      })
      .then((json) => {
        if (cancelled) return
        if (json.value != null) setState(json.value)
        lastSyncedRef.current = json.updated_at
        setStatus("ready")
      })
      .catch((e) => {
        if (cancelled) return
        setError(e.message)
        setStatus("error")
      })
    return () => {
      cancelled = true
    }
  }, [key])

  // Suscripción realtime a postgres_changes.
  useEffect(() => {
    let supabase
    try {
      supabase = createSupabaseBrowser()
    } catch {
      return
    }
    const channel = supabase
      .channel(`app_state:${key}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_state",
          filter: `key=eq.${key}`,
        },
        (payload: any) => {
          if (skipNextRealtimeRef.current) {
            skipNextRealtimeRef.current = false
            return
          }
          const row = payload.new ?? payload.record
          if (!row) return
          if (
            lastSyncedRef.current &&
            row.updated_at &&
            row.updated_at <= lastSyncedRef.current
          ) {
            return
          }
          lastSyncedRef.current = row.updated_at ?? lastSyncedRef.current
          if (row.value != null) setState(row.value as T)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [key])

  const flush = useCallback(async () => {
    if (pendingValueRef.current === null) return
    const value = pendingValueRef.current
    pendingValueRef.current = null
    try {
      skipNextRealtimeRef.current = true
      const res = await fetch(`/api/state/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al guardar")
      lastSyncedRef.current = json.updated_at ?? lastSyncedRef.current
    } catch (e) {
      skipNextRealtimeRef.current = false
      console.error("useSharedState save error:", e)
    }
  }, [key])

  const persist = useCallback(
    (value: T) => {
      pendingValueRef.current = value
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        flush()
      }, 400)
    },
    [flush],
  )

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (p: T) => T)(prev)
            : updater
        persist(next)
        return next
      })
    },
    [persist],
  )

  return { state, setState: update, status, error }
}
