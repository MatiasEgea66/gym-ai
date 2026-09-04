import { useRef, useState, useEffect } from 'react'
import BottomNav from './components/BottomNav'
import InstallPrompt from './components/InstallPrompt'
import InicioScreen from './screens/InicioScreen'
import RutinaScreen from './screens/RutinaScreen'
import HistorialScreen from './screens/HistorialScreen'
import PerfilScreen from './screens/PerfilScreen'
import DayDetailScreen from './screens/DayDetailScreen'
import WorkoutSessionScreen from './screens/WorkoutSessionScreen'
import LoginScreen from './screens/LoginScreen'
import PlanEditorScreen from './screens/PlanEditorScreen'
import type { Day } from './data/plan'
import type { Tab } from './types'
import type { Plan } from './lib/storage'
import { supabase } from './lib/supabase'
import { clearPasskey } from './lib/webauthn'

type Screen =
  | { type: 'tabs' }
  | { type: 'dayDetail'; day: Day }
  | { type: 'session'; day: Day }
  | { type: 'planEditor'; plan?: Plan }

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])
  const [tab, setTab] = useState<Tab>('inicio')
  const [screen, setScreen] = useState<Screen>({ type: 'tabs' })
  const [refreshKey, setRefreshKey] = useState(0)

  const TABS: Tab[] = ['inicio', 'rutina', 'historial', 'perfil']
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null)

  function handleSwipeTouchStart(e: React.TouchEvent) {
    swipeStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function handleSwipeTouchEnd(e: React.TouchEvent) {
    if (!swipeStartRef.current) return
    const dx = e.changedTouches[0].clientX - swipeStartRef.current.x
    const dy = Math.abs(e.changedTouches[0].clientY - swipeStartRef.current.y)
    swipeStartRef.current = null
    if (Math.abs(dx) < 80 || dy > 40) return
    const currentIndex = TABS.indexOf(tab)
    if (dx < 0 && currentIndex < TABS.length - 1) setTab(TABS[currentIndex + 1])
    if (dx > 0 && currentIndex > 0) setTab(TABS[currentIndex - 1])
  }

  if (!authReady) return <div style={{ minHeight: '100dvh', background: '#0C0E1A' }} />
  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />

  if (screen.type === 'session') {
    return <WorkoutSessionScreen day={screen.day} onFinish={() => { setRefreshKey((k) => k + 1); setTab('historial'); setScreen({ type: 'tabs' }) }} onExit={() => setScreen({ type: 'tabs' })} />
  }
  if (screen.type === 'dayDetail') {
    return <DayDetailScreen day={screen.day} onBack={() => setScreen({ type: 'tabs' })} onStart={() => setScreen({ type: 'session', day: screen.day })} />
  }
  if (screen.type === 'planEditor') {
    return (
      <PlanEditorScreen
        plan={screen.plan}
        onBack={() => setScreen({ type: 'tabs' })}
        onSaved={() => { setRefreshKey((k) => k + 1); setScreen({ type: 'tabs' }) }}
      />
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0C0E1A' }} onTouchStart={handleSwipeTouchStart} onTouchEnd={handleSwipeTouchEnd}>
      <div style={{ paddingBottom: '80px' }}>
        {tab === 'inicio' && <InicioScreen key={refreshKey} onOpenDay={(day) => setScreen({ type: 'dayDetail', day })} onStart={(day) => setScreen({ type: 'session', day })} />}
        {tab === 'rutina' && <RutinaScreen key={refreshKey} onOpenDay={(day) => setScreen({ type: 'dayDetail', day })} onNewPlan={() => setScreen({ type: 'planEditor' })} onEditPlan={(plan) => setScreen({ type: 'planEditor', plan })} />}
        {tab === 'historial' && <HistorialScreen key={refreshKey} />}
        {tab === 'perfil' && <PerfilScreen onLogout={() => setIsLoggedIn(false)} />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
      <InstallPrompt />
    </div>
  )
}

export default App
