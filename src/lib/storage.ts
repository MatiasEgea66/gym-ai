import type { Day, Block, Exercise } from '../data/plan'

export type SetLog = { setNumber: number; done: boolean; weightKg?: number }
export type ExerciseLog = { exerciseId: string; name: string; sets: SetLog[] }
export type Session = {
  id: string
  dayId: string
  dayTitle: string
  dateISO: string
  durationSec: number
  exercises: ExerciseLog[]
  planId?: string
}

export type CustomExercise = {
  id: string
  name: string
  target: string
  description: string
  sets: number
  bodyweight?: boolean
}

export type CustomDay = {
  id: string
  label: string
  title: string
  exercises: CustomExercise[]
}

export type Plan = {
  id: string
  name: string
  createdAt: string
  customDays?: CustomDay[]
}

const HISTORY_KEY = 'gymai:history'
const LAST_WEIGHT_KEY = 'gymai:lastWeight'
const PLANS_KEY = 'forge:plans'
const ACTIVE_PLAN_KEY = 'forge:activePlan'
const PLAN_START_KEY = 'forge:planStartDate'
const PLAN_CHANGE_WEEKS_KEY = 'forge:planChangeWeeks'
const PLAN_CHANGE_NOTIFIED_KEY = 'forge:planChangeNotified'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

// ── Plans ──────────────────────────────────────────────────────────────────

export function getPlans(): Plan[] {
  return safeParse<Plan[]>(localStorage.getItem(PLANS_KEY), [])
}

export function getActivePlan(): Plan {
  const plans = getPlans()
  const activeId = localStorage.getItem(ACTIVE_PLAN_KEY)
  const found = plans.find((p) => p.id === activeId)
  if (found) return found
  const defaultPlan: Plan = { id: 'plan-1', name: 'Programa 1', createdAt: new Date().toISOString() }
  localStorage.setItem(PLANS_KEY, JSON.stringify([defaultPlan]))
  localStorage.setItem(ACTIVE_PLAN_KEY, defaultPlan.id)
  return defaultPlan
}

export function setActivePlan(id: string): void {
  localStorage.setItem(ACTIVE_PLAN_KEY, id)
}

export function getPlanStartDate(): string | null {
  return localStorage.getItem(PLAN_START_KEY)
}

export function setPlanStartDate(dateISO?: string): void {
  localStorage.setItem(PLAN_START_KEY, dateISO ?? new Date().toISOString())
}

export function getPlanChangeWeeks(): number {
  const raw = localStorage.getItem(PLAN_CHANGE_WEEKS_KEY)
  return raw ? parseInt(raw, 10) : 4
}

export function setPlanChangeWeeks(weeks: number): void {
  localStorage.setItem(PLAN_CHANGE_WEEKS_KEY, String(weeks))
}

export function initPlanStartDateIfNeeded(planId: string): void {
  if (getPlanStartDate()) return
  const sessions = safeParse<Session[]>(localStorage.getItem(HISTORY_KEY), [])
    .filter(s => (s.planId ?? 'plan-1') === planId)
  if (sessions.length > 0) {
    const oldest = sessions.reduce((a, b) => a.dateISO < b.dateISO ? a : b)
    setPlanStartDate(oldest.dateISO)
  } else {
    setPlanStartDate()
  }
}

export function getPlanTotalSessions(daysPerWeek: number): number {
  return Math.round(daysPerWeek * 4.5)
}

export function shouldChangePlan(planId: string, daysPerWeek: number): boolean {
  const sessions = safeParse<Session[]>(localStorage.getItem(HISTORY_KEY), [])
    .filter(s => (s.planId ?? 'plan-1') === planId).length
  return sessions >= getPlanTotalSessions(daysPerWeek)
}

export function getPlanChangeWarning(planId: string, daysPerWeek: number): { sessionsLeft: number } | null {
  if (shouldChangePlan(planId, daysPerWeek)) return null
  const sessions = safeParse<Session[]>(localStorage.getItem(HISTORY_KEY), [])
    .filter(s => (s.planId ?? 'plan-1') === planId).length
  const sessionsLeft = getPlanTotalSessions(daysPerWeek) - sessions
  if (sessionsLeft <= 2) return { sessionsLeft }
  return null
}

export function getPlanChangeNotifiedDate(): string | null {
  return localStorage.getItem(PLAN_CHANGE_NOTIFIED_KEY)
}

export function setPlanChangeNotifiedDate(date: string): void {
  localStorage.setItem(PLAN_CHANGE_NOTIFIED_KEY, date)
}

export function savePlan(plan: Plan): void {
  const plans = getPlans()
  const idx = plans.findIndex((p) => p.id === plan.id)
  if (idx >= 0) plans[idx] = plan
  else plans.push(plan)
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
}

export function createPlan(name: string, customDays?: CustomDay[]): Plan {
  const plan: Plan = {
    id: `plan-${Date.now()}`,
    name: name.trim() || 'Nuevo programa',
    createdAt: new Date().toISOString(),
    customDays,
  }
  savePlan(plan)
  setActivePlan(plan.id)
  setPlanStartDate()
  return plan
}

/** Convert a CustomDay to the Day format used by session screens */
export function customDayToDay(day: CustomDay): Day {
  const exercises: Exercise[] = day.exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    target: ex.target,
    description: ex.description,
    bodyweight: ex.bodyweight,
  }))
  const block: Block = {
    id: `${day.id}-block`,
    title: day.title,
    rounds: day.exercises[0]?.sets ?? 3,
    exercises,
  }
  return {
    id: day.id,
    weekday: 0,
    dayLabel: day.label,
    title: day.title,
    blocks: [block],
  }
}

// ── Sessions ───────────────────────────────────────────────────────────────

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
    if (weights.length > 0) setLastWeight(ex.exerciseId, weights[weights.length - 1])
  }
}

export function deleteSession(id: string): void {
  const list = safeParse<Session[]>(localStorage.getItem(HISTORY_KEY), [])
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.filter((s) => s.id !== id)))
}

// ── Weights ────────────────────────────────────────────────────────────────

export function getLastWeight(exerciseId: string): number | undefined {
  const map = safeParse<Record<string, number>>(localStorage.getItem(LAST_WEIGHT_KEY), {})
  return map[exerciseId]
}

export function setLastWeight(exerciseId: string, weightKg: number): void {
  const map = safeParse<Record<string, number>>(localStorage.getItem(LAST_WEIGHT_KEY), {})
  map[exerciseId] = weightKg
  localStorage.setItem(LAST_WEIGHT_KEY, JSON.stringify(map))
}

// ── Stats ──────────────────────────────────────────────────────────────────

export function getStats() {
  const history = getHistory()
  const now = new Date()
  const startOfWeek = new Date(now)
  const day = (startOfWeek.getDay() + 6) % 7
  startOfWeek.setDate(startOfWeek.getDate() - day)
  startOfWeek.setHours(0, 0, 0, 0)
  const thisWeek = history.filter((s) => new Date(s.dateISO) >= startOfWeek).length
  return { totalSessions: history.length, thisWeek, lastSession: history[0] }
}
