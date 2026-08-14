import { ChevronLeft, Play } from 'lucide-react'
import type { Day } from '../data/plan'
import { getLastWeight } from '../lib/storage'

type Props = {
  day: Day
  onBack: () => void
  onStart: () => void
}

export default function DayDetailScreen({ day, onBack, onStart }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--bg)]/95 px-3 py-3 backdrop-blur">
        <button onClick={onBack} className="rounded-full p-1 active:scale-90" aria-label="Volver">
          <ChevronLeft size={24} />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">{day.dayLabel}</p>
          <h1 className="text-base font-bold leading-tight">{day.title}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md flex-1 space-y-6 px-4 py-5">
        {day.note && (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm text-[var(--text-muted)]">
            {day.note}
          </p>
        )}

        {day.blocks.map((block) => (
          <section key={block.id}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
              {block.title}
              {block.rounds ? (
                <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs font-medium text-[var(--text-dim)]">
                  {block.rounds} vueltas
                </span>
              ) : null}
            </h2>
            <div className="space-y-2">
              {block.exercises.map((ex) => {
                const lastWeight = getLastWeight(ex.id)
                return (
                  <div key={ex.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{ex.name}</p>
                      <span className="shrink-0 rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                        {ex.target}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{ex.description}</p>
                    {lastWeight ? <p className="mt-1 text-xs text-[var(--text-dim)]">Último peso: {lastWeight} kg</p> : null}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--bg)]/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur">
        <button
          onClick={onStart}
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 font-semibold text-black active:scale-[0.98]"
        >
          <Play size={18} fill="black" /> Comenzar entrenamiento
        </button>
      </div>
    </div>
  )
}
