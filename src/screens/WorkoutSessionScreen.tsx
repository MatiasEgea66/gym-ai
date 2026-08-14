import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronLeft, Minus, Plus, Timer, Trophy, X } from 'lucide-react'
import type { Day } from '../data/plan'
import { addSession, getLastWeight, type ExerciseLog, type Session } from '../lib/storage'

type Props = {
  day: Day
  onFinish: () => void
  onExit: () => void
}

type SetState = { done: boolean }

function setsForExercise(rounds: number | undefined): number {
  return rounds ?? 1
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function WorkoutSessionScreen({ day, onFinish, onExit }: Props) {
  const [startedAt] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [phase, setPhase] = useState<'active' | 'done'>('active')
  const [confirmExit, setConfirmExit] = useState(false)
  const [restLeft, setRestLeft] = useState<number | null>(null)

  const allExercises = useMemo(
    () =>
      day.blocks.flatMap((block) =>
        block.exercises.map((ex) => ({ block, ex, totalSets: setsForExercise(block.rounds) })),
      ),
    [day],
  )

  const [sets, setSets] = useState<Record<string, SetState[]>>(() => {
    const init: Record<string, SetState[]> = {}
    for (const { ex, totalSets } of allExercises) {
      init[ex.id] = Array.from({ length: totalSets }, () => ({ done: false }))
    }
    return init
  })

  const [weights, setWeights] = useState<Record<string, number | undefined>>(() => {
    const init: Record<string, number | undefined> = {}
    for (const { ex } of allExercises) {
      init[ex.id] = getLastWeight(ex.id)
    }
    return init
  })

  useEffect(() => {
    if (phase !== 'active') return
    const id = setInterval(() => setElapsed(Math.round((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(id)
  }, [phase, startedAt])

  useEffect(() => {
    if (restLeft === null || restLeft <= 0) return
    const id = setTimeout(() => setRestLeft((r) => (r !== null && r > 1 ? r - 1 : null)), 1000)
    return () => clearTimeout(id)
  }, [restLeft])

  const totalSets = allExercises.reduce((sum, e) => sum + e.totalSets, 0)
  const doneSets = Object.values(sets).reduce((sum, arr) => sum + arr.filter((s) => s.done).length, 0)
  const progress = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0

  function toggleSet(exerciseId: string, index: number) {
    setSets((prev) => {
      const next = { ...prev }
      const arr = [...next[exerciseId]]
      const wasDone = arr[index].done
      arr[index] = { done: !wasDone }
      next[exerciseId] = arr
      if (!wasDone) setRestLeft(60)
      return next
    })
  }

  function changeWeight(exerciseId: string, delta: number) {
    setWeights((prev) => {
      const current = prev[exerciseId] ?? 0
      const next = Math.max(0, Math.round((current + delta) * 4) / 4)
      return { ...prev, [exerciseId]: next }
    })
  }

  function finishSession() {
    const exercises: ExerciseLog[] = allExercises.map(({ ex, totalSets: n }) => ({
      exerciseId: ex.id,
      name: ex.name,
      sets: Array.from({ length: n }, (_, i) => ({
        setNumber: i + 1,
        done: sets[ex.id]?.[i]?.done ?? false,
        weightKg: weights[ex.id],
      })),
    }))

    const session: Session = {
      id: `${day.id}-${startedAt}`,
      dayId: day.id,
      dayTitle: `${day.dayLabel} — ${day.title}`,
      dateISO: new Date().toISOString(),
      durationSec: elapsed,
      exercises,
    }

    addSession(session)
    setPhase('done')
  }

  if (phase === 'done') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-[var(--accent-subtle)]">
          <Trophy size={36} className="text-[var(--accent)]" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">¡Entrenamiento completo!</h1>
        <p className="mb-8 text-sm text-[var(--text-muted)]">
          {day.dayLabel} — {formatDuration(elapsed)} · {doneSets}/{totalSets} series
        </p>
        <button
          onClick={onFinish}
          className="w-full max-w-xs rounded-xl bg-[var(--accent)] py-3 font-semibold text-black active:scale-[0.98]"
        >
          Volver al inicio
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="flex items-center gap-3 px-3 py-3">
          <button onClick={() => setConfirmExit(true)} className="rounded-full p-1 active:scale-90" aria-label="Salir">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">{day.dayLabel}</p>
            <h1 className="text-base font-bold leading-tight">{day.title}</h1>
          </div>
          <p className="shrink-0 text-sm font-mono text-[var(--text-muted)]">{formatDuration(elapsed)}</p>
        </div>
        <div className="h-1 bg-[var(--surface)]">
          <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-md flex-1 space-y-6 px-4 py-5">
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
            <div className="space-y-3">
              {block.exercises.map((ex) => {
                const exSets = sets[ex.id] ?? []
                const weight = weights[ex.id]
                const showWeight = Boolean(block.rounds)
                return (
                  <div key={ex.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{ex.name}</p>
                      <span className="shrink-0 rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                        {ex.target}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{ex.description}</p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex gap-2">
                        {exSets.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => toggleSet(ex.id, i)}
                            className={`flex size-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors active:scale-90 ${
                              s.done
                                ? 'border-[var(--accent)] bg-[var(--accent)] text-black'
                                : 'border-[var(--border)] text-[var(--text-dim)]'
                            }`}
                          >
                            {s.done ? <Check size={16} /> : i + 1}
                          </button>
                        ))}
                      </div>

                      {showWeight && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => changeWeight(ex.id, -2.5)}
                            className="flex size-7 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] active:scale-90"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-14 text-center text-sm font-semibold tabular-nums">
                            {weight ? `${weight}kg` : '—'}
                          </span>
                          <button
                            onClick={() => changeWeight(ex.id, 2.5)}
                            className="flex size-7 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] active:scale-90"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="sticky bottom-0 border-t border-[var(--border)] bg-[var(--bg)]/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur">
        <button
          onClick={finishSession}
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 font-semibold text-black active:scale-[0.98]"
        >
          Finalizar entrenamiento ({doneSets}/{totalSets})
        </button>
      </div>

      {restLeft !== null && (
        <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)]/95 px-4 py-2 shadow-lg backdrop-blur">
            <Timer size={16} className="text-[var(--accent)]" />
            <span className="text-sm font-semibold tabular-nums">Descanso {formatDuration(restLeft)}</span>
            <button
              onClick={() => setRestLeft((r) => (r === null ? null : r + 30))}
              className="text-xs font-semibold text-[var(--text-muted)]"
            >
              +30s
            </button>
            <button onClick={() => setRestLeft(null)} className="text-xs font-semibold text-[var(--accent)]">
              Saltar
            </button>
          </div>
        </div>
      )}

      {confirmExit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-6">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="mb-1 font-semibold">¿Salir del entrenamiento?</p>
            <p className="mb-4 text-sm text-[var(--text-muted)]">El progreso de esta sesión no se va a guardar.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmExit(false)}
                className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium active:scale-[0.98]"
              >
                Seguir
              </button>
              <button
                onClick={onExit}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500/15 py-2.5 text-sm font-semibold text-red-400 active:scale-[0.98]"
              >
                <X size={16} /> Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
