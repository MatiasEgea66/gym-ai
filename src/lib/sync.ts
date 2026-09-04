import { supabase } from './supabase'

const KEYS = [
  'gymai:history',
  'gymai:lastWeight',
  'forge:plans',
  'forge:activePlan',
  'forge:planStartDate',
  'forge:planChangeWeeks',
  'forge:planChangeNotified',
]

function collectLocalData(): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (const key of KEYS) {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      try { data[key] = JSON.parse(raw) } catch { data[key] = raw }
    }
  }
  return data
}

function applyCloudData(data: Record<string, unknown>): void {
  for (const key of KEYS) {
    if (key in data) {
      localStorage.setItem(key, JSON.stringify(data[key]))
    }
  }
}

export async function uploadProgress(userId: string): Promise<void> {
  const data = collectLocalData()
  await supabase.from('user_data').upsert({ id: userId, data, updated_at: new Date().toISOString() })
}

export async function downloadProgress(userId: string): Promise<boolean> {
  const { data: row } = await supabase
    .from('user_data')
    .select('data')
    .eq('id', userId)
    .single()
  if (!row?.data || Object.keys(row.data).length === 0) return false
  applyCloudData(row.data as Record<string, unknown>)
  return true
}

// Merge: keep local history + cloud history combined (no duplicates by id)
export async function mergeAndUpload(userId: string): Promise<void> {
  const { data: row } = await supabase
    .from('user_data')
    .select('data')
    .eq('id', userId)
    .single()

  const local = collectLocalData()

  if (row?.data) {
    const cloud = row.data as Record<string, unknown>
    // Merge history: combine and deduplicate by session id
    const localHistory = (local['gymai:history'] as { id: string }[]) ?? []
    const cloudHistory = (cloud['gymai:history'] as { id: string }[]) ?? []
    const merged = [...localHistory]
    for (const s of cloudHistory) {
      if (!merged.find(m => m.id === s.id)) merged.push(s)
    }
    local['gymai:history'] = merged
    if (merged.length > 0) localStorage.setItem('gymai:history', JSON.stringify(merged))
  }

  await supabase.from('user_data').upsert({ id: userId, data: local, updated_at: new Date().toISOString() })
}
