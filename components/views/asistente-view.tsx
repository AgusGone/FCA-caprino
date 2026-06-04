"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ArrowUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const sugerencias = [
  "¿Cómo ajusto la ración si baja la producción?",
  "Alternativas forrajeras al heno de alfalfa",
  "Plan sanitario para cabras en lactancia",
  "¿Cuándo conviene secar una cabra?",
]

export function AsistenteView({ initialPrompt }: { initialPrompt?: string }) {
  const [input, setInput] = useState("")
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })
  const endRef = useRef<HTMLDivElement>(null)
  const sentInitial = useRef(false)

  useEffect(() => {
    if (initialPrompt && !sentInitial.current) {
      sentInitial.current = true
      sendMessage({ text: initialPrompt })
    }
  }, [initialPrompt, sendMessage])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const busy = status === "streaming" || status === "submitted"

  function submit(text: string) {
    const value = text.trim()
    if (!value || busy) return
    sendMessage({ text: value })
    setInput("")
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-5 py-6 md:px-10">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Asistente IA</h1>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-center">
            <p className="text-pretty text-muted-foreground">
              Preguntame lo que necesites sobre el manejo de tu tambo caprino:
              alimentación, ordeño, sanidad o reproducción.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {sugerencias.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:bg-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-4">
            {messages.map((m) => {
              const text = m.parts
                .filter((p) => p.type === "text")
                .map((p) => (p as { text: string }).text)
                .join("")
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-base leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-card-foreground",
                    )}
                  >
                    {text || (
                      <span className="text-muted-foreground">Pensando…</span>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
        className="mt-3 flex items-end gap-2 rounded-2xl border border-border bg-card p-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit(input)
            }
          }}
          rows={1}
          placeholder="Escribí tu consulta…"
          className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          aria-label="Enviar"
        >
          <ArrowUp className="size-5" />
        </button>
      </form>
    </div>
  )
}
