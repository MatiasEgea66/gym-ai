import { ChevronRight } from 'lucide-react'
import { PLAN, PLAN_INTRO, type Day } from '../data/plan'

type Props = { onOpenDay: (day: Day) => void }

export default function RutinaScreen({ onOpenDay }: Props) {
  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold">{PLAN_INTRO.title}</h1>
        <p className="text-sm text-[var(--text-muted)]">{PLAN_INTRO.subtitle}</p>
      </header>

      <div className="space-y-3">
        {PLAN.map((day) => (
          <button
            key={day.id}
            onClick={() => onOpenDay(day)}
            className="flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left active:scale-[0.99]"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">{day.dayLabel}</p>
              <p className="font-semibold">{day.title}</p>
              <p className="mt-1 text-xs text-[var(--text-dim)]">{day.blocks.length} bloques</p>
            </div>
            <ChevronRight className="shrink-0 text-[var(--text-dim)]" />
          </button>
        ))}
      </div>

      <details className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--text-muted)]">
        <summary className="cursor-pointer font-semibold text-[var(--text)]">¿Por qué esta estructura?</summary>
        <p className="mt-2 leading-relaxed">{PLAN_INTRO.why}</p>
        <p className="mt-3 leading-relaxed">{PLAN_INTRO.goal}</p>
      </details>
    </div>
  )
}
