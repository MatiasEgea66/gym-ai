import { Home, Dumbbell, History, User } from 'lucide-react'
import type { Tab } from '../types'
import { C } from '../lib/colors'

const items: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'rutina', label: 'Rutina', icon: Dumbbell },
  { id: 'historial', label: 'Historial', icon: History },
  { id: 'perfil', label: 'Perfil', icon: User },
]

type Props = { active: Tab; onChange: (tab: Tab) => void }

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(12,14,26,0.92)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderTop: `1px solid ${C.border}`, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div style={{ display: 'flex', maxWidth: '480px', margin: '0 auto' }}>
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button key={id} onClick={() => onChange(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 0 8px', background: 'none', border: 'none', cursor: 'pointer', color: isActive ? C.accent : C.dim, transition: 'color 0.15s' }}>
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '400' }}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
