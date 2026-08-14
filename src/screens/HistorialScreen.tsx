import { useState } from 'react'
import { ChevronDown, Dumbbell, Trash2 } from 'lucide-react'
import { deleteSession, getHistory, getStats, type Session } from '../lib/storage'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  return `${m} min`
}

export default function HistorialScreen() {
  const [history, setHistory] = useState<Session[]>(() => getHistory())
  const [expanded, setExpanded] = useState<string | null>(null)
  const stats = getStats()

  function handleDelete(id: string) {
    deleteSession(id)
    setHistory(getHistory())
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold">Historial</h1>
        <p className="text-sm text-[var(--text-muted)]">
          {stats.totalSessions} entrenamientos · {stats.thisWeek}/3 esta semana
        </p>
      </header>

      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center">
          <Dumbbell size={28} className="text-[var(--text-dim)]" />
          <p className="text-sm text-[var(--text-muted)]">Todavía no completaste ningún entrenamiento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((session) => {
            const isOpen = expanded === session.id
            const totalSets = session.exercises.reduce((s, e) => s + e.sets.length, 0)
            const doneSets = session.exercises.reduce((s, e) => s + e.sets.filter((x) => x.done).length, 0)
            return (
              <div key={session.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                <button
                  onClick={() => setExpanded(isOpen ? null : session.id)}
                  className="flex w-full items-center justify-between gap-2 p-4 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold capitalize">{formatDate(session.dateISO)}</p>
                    <p className="text-xs text-[var(--text-muted)]">{session.dayTitle}</p>
                    <p className="mt-1 text-xs text-[var(--text-dim)]">
                      {formatDuration(session.durationSec)} · {doneSets}/{totalSets} series
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-[var(--text-dim)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="space-y-2 border-t border-[var(--border)] p-4 pt-3">
                    {session.exercises.map((ex) => (
                      <div key={ex.exerciseId} className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-muted)]">{ex.name}</span>
                        <span className="shrink-0 font-medium">
                          {ex.sets.filter((s) => s.done).length}/{ex.sets.length}
                          {ex.sets[0]?.weightKg ? ` · ${ex.sets[0].weightKg}kg` : ''}
                        </span>
                      </div>
                    ))}
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-400 active:scale-[0.98]"
                    >
                      <Trash2 size={14} /> Eliminar registro
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
