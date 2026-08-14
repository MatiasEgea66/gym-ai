import { Play, Dumbbell, Calendar, Flame } from 'lucide-react'
import { PLAN, getDayByWeekday, type Day } from '../data/plan'
import { getStats } from '../lib/storage'

type Props = {
  onOpenDay: (day: Day) => void
  onStart: (day: Day) => void
}

const OTHER_DAY_MESSAGES: Record<number, string> = {
  0: 'Descanso. Mañana arranca la semana de gimnasio.',
  2: 'Hoy toca fútbol. Las piernas descansan del gimnasio.',
  4: 'Hoy toca fútbol. Mañana es día de tirón en el gym.',
  6: 'Hoy es el partido. Suerte — nada de gimnasio hoy.',
}

export default function InicioScreen({ onOpenDay, onStart }: Props) {
  const today = new Date()
  const weekday = today.getDay()
  const todayPlan = getDayByWeekday(weekday)
  const stats = getStats()

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <header className="mb-6">
        <p className="text-sm capitalize text-[var(--text-muted)]">
          {today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-2xl font-bold">Hola 💪</h1>
      </header>

      {todayPlan ? (
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Entrenamiento de hoy</p>
          <h2 className="mb-1 text-xl font-bold">{todayPlan.dayLabel}</h2>
          <p className="mb-4 text-sm text-[var(--text-muted)]">{todayPlan.title}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onStart(todayPlan)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 font-semibold text-black active:scale-[0.98]"
            >
              <Play size={18} fill="black" /> Comenzar
            </button>
            <button
              onClick={() => onOpenDay(todayPlan)}
              className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--text-muted)] active:scale-[0.98]"
            >
              Ver
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">Hoy</p>
          <p className="text-lg font-semibold">{OTHER_DAY_MESSAGES[weekday]}</p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <Flame size={18} className="mb-2 text-[var(--accent)]" />
          <p className="text-2xl font-bold">{stats.thisWeek}/3</p>
          <p className="text-xs text-[var(--text-muted)]">esta semana</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <Calendar size={18} className="mb-2 text-[var(--accent)]" />
          <p className="text-2xl font-bold">{stats.totalSessions}</p>
          <p className="text-xs text-[var(--text-muted)]">entrenamientos totales</p>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Semana</p>
        <div className="space-y-2">
          {PLAN.map((day) => (
            <button
              key={day.id}
              onClick={() => onOpenDay(day)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left active:scale-[0.99] ${
                day.id === todayPlan?.id
                  ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                  : 'border-[var(--border)] bg-[var(--card)]'
              }`}
            >
              <Dumbbell size={18} className="text-[var(--text-dim)]" />
              <div>
                <p className="text-sm font-semibold">{day.dayLabel}</p>
                <p className="text-xs text-[var(--text-muted)]">{day.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
