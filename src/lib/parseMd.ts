import type { CustomBlock, CustomDay, CustomExercise } from './storage'

export function parsePlanMarkdown(md: string): { name: string; customDays: CustomDay[] } {
  const lines = md.split('\n')
  let planName = 'Plan importado'
  const days: CustomDay[] = []
  let currentDay: CustomDay | null = null
  let currentBlock: CustomBlock | null = null
  let currentExercise: CustomExercise | null = null
  let descLines: string[] = []
  let exCounter = 0

  function flushExercise() {
    if (currentExercise && currentBlock) {
      currentExercise.description = descLines.join(' ').trim()
      currentBlock.exercises.push(currentExercise)
      currentExercise = null
      descLines = []
    }
  }

  function flushBlock() {
    flushExercise()
    if (currentBlock && currentDay) {
      currentDay.blocks!.push(currentBlock)
      currentBlock = null
    }
  }

  function flushDay() {
    flushBlock()
    if (currentDay) {
      days.push(currentDay)
      currentDay = null
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    // Plan name from h1 (single #)
    if (/^# [^#]/.test(line)) {
      planName = line.slice(2).trim()
      continue
    }

    // Day header: ## Día N (...) — Title
    const dayMatch = line.match(/^## Día (\d+)[^—]*— (.+)$/)
    if (dayMatch) {
      flushDay()
      currentDay = {
        id: `day-md-${days.length}`,
        label: `Día ${dayMatch[1]}`,
        title: dayMatch[2].trim(),
        exercises: [],
        blocks: [],
      }
      continue
    }

    // Block header: ### Block name (optional: N vueltas)
    if (line.startsWith('### ') && currentDay) {
      flushBlock()
      const blockRaw = line.slice(4).trim()
      const roundsMatch = blockRaw.match(/\((\d+) vueltas?\)/)
      const rounds = roundsMatch ? parseInt(roundsMatch[1]) : undefined
      const title = blockRaw.replace(/\s*\(\d+ vueltas?\)/, '').trim()
      currentBlock = {
        id: `block-md-${days.length}-${currentDay.blocks!.length}`,
        title,
        rounds,
        exercises: [],
      }
      continue
    }

    // Exercise line: **name — target**
    if (line.startsWith('**') && line.endsWith('**') && currentBlock) {
      flushExercise()
      const inner = line.slice(2, -2)
      const sepIdx = inner.lastIndexOf(' — ')
      if (sepIdx > 0) {
        const name = inner.slice(0, sepIdx).trim()
        const target = inner.slice(sepIdx + 3).trim()
        exCounter++
        currentExercise = {
          id: `ex-md-${exCounter}`,
          name,
          target,
          description: '',
          sets: 3,
        }
        descLines = []
      }
      continue
    }

    // Description text (non-header, non-empty, inside an exercise)
    if (currentExercise && line.trim() && !line.startsWith('#') && !line.startsWith('---')) {
      descLines.push(line.trim())
    }
  }

  flushDay()

  return { name: planName, customDays: days }
}
