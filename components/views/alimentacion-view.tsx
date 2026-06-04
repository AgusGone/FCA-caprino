import { ArrowUpRight, ArrowDown } from "lucide-react"
import { racionDiaria, horariosSuministro } from "@/lib/data"

export function AlimentacionView({
  onConsult,
}: {
  onConsult: (prompt: string) => void
}) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-10">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Consumo hoy
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight">128 kg</p>
          <p className="mt-2 text-sm text-muted-foreground">Heno + balanceado</p>
        </div>
        <div className="rounded-2xl bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Stock heno
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-destructive">
            18 días
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Reponer pronto</p>
        </div>
      </div>

      {/* Ración */}
      <h2 className="mt-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Ración diaria recomendada (32 cabras en lactancia)
      </h2>
      <div className="mt-4 rounded-2xl bg-card px-6 py-2">
        {racionDiaria.map((item, i) => (
          <div
            key={`${item.nombre}-${i}`}
            className={`flex items-center justify-between py-4 ${
              i !== racionDiaria.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="text-base text-foreground/90">{item.nombre}</span>
            <span className="text-lg font-semibold">{item.cantidad}</span>
          </div>
        ))}
      </div>

      {/* Horarios */}
      <h2 className="mt-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Horarios de suministro
      </h2>
      <div className="mt-4 rounded-2xl bg-card px-6 py-2">
        {horariosSuministro.map((item, i) => (
          <div
            key={`${item.hora}-${i}`}
            className={`flex items-center justify-between py-4 ${
              i !== horariosSuministro.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="text-base text-foreground/90">
              {item.hora} — {item.momento}
            </span>
            <span className="font-semibold">{item.detalle}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          onConsult(
            "Necesito alternativas forrajeras al heno de alfalfa para 32 cabras en lactancia. El stock de heno me dura 18 días. ¿Qué opciones tengo?",
          )
        }
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-base font-medium transition-colors hover:bg-secondary"
      >
        ¿Alternativas forrajeras?
        <ArrowUpRight className="size-4" />
      </button>

      <div className="mt-10 flex justify-center">
        <span className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground">
          <ArrowDown className="size-5" />
        </span>
      </div>
    </div>
  )
}