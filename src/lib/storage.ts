export type SetLog = {
  setNumber: number
  done: boolean
  weightKg?: number
}

export type ExerciseLog = {
  exerciseId: string
  name: string
  sets: SetLog[]
}

export type Session = {
  id: string
  dayId: string
  dayTitle: string
  dateISO: string // full timestamp
  durationSec: number
  exercises: ExerciseLog[]
}

const HISTORY_KEY = 'gymai:history'
const LAST_WEIGHT_KEY = 'gymai:lastWeight'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function getHistory(): Session[] {
  const list = safeParse<Session[]>(localStorage.getItem(HISTORY_KEY), [])
  return list.sort((a, b) => b.dateISO.localeCompare(a.dateISO))
}

export function addSession(session: Session): void {
  const list = safeParse<Session[]>(localStorage.getItem(HISTORY_KEY), [])
  list.push(session)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))

  for (const ex of session.exercises) {
    const weights = ex.sets.map((s) => s.weightKg).filter((w): w is number => typeof w === 'number' && w > 0)
    if (weights.length > 0) {
      setLastWeight(ex.exerciseId, weights[weights.length - 1])
    }
  }
}

export function deleteSession(id: string): void {
  const list = safeParse<Session[]>(localStorage.getItem(HISTORY_KEY), [])
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.filter((s) => s.id !== id)))
}

export function getLastWeight(exerciseId: string): number | undefined {
  const map = safeParse<Record<string, number>>(localStorage.getItem(LAST_WEIGHT_KEY), {})
  return map[exerciseId]
}

export function setLastWeight(exerciseId: string, weightKg: number): void {
  const map = safeParse<Record<string, number>>(localStorage.getItem(LAST_WEIGHT_KEY), {})
  map[exerciseId] = weightKg
  localStorage.setItem(LAST_WEIGHT_KEY, JSON.stringify(map))
}

export function getStats() {
  const history = getHistory()
  const now = new Date()
  const startOfWeek = new Date(now)
  const day = (startOfWeek.getDay() + 6) % 7 // 0 = Monday
  startOfWeek.setDate(startOfWeek.getDate() - day)
  startOfWeek.setHours(0, 0, 0, 0)

  const thisWeek = history.filter((s) => new Date(s.dateISO) >= startOfWeek).length

  return {
    totalSessions: history.length,
    thisWeek,
    lastSession: history[0],
  }
}
