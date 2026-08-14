import { Home, Dumbbell, History } from 'lucide-react'
import type { Tab } from '../types'

const items: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'rutina', label: 'Rutina', icon: Dumbbell },
  { id: 'historial', label: 'Historial', icon: History },
]

type Props = {
  active: Tab
  onChange: (tab: Tab) => void
}

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
