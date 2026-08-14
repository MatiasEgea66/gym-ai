import { useState } from 'react'
import BottomNav from './components/BottomNav'
import InicioScreen from './screens/InicioScreen'
import RutinaScreen from './screens/RutinaScreen'
import HistorialScreen from './screens/HistorialScreen'
import DayDetailScreen from './screens/DayDetailScreen'
import WorkoutSessionScreen from './screens/WorkoutSessionScreen'
import type { Day } from './data/plan'
import type { Tab } from './types'

type Screen = { type: 'tabs' } | { type: 'dayDetail'; day: Day } | { type: 'session'; day: Day }

function App() {
  const [tab, setTab] = useState<Tab>('inicio')
  const [screen, setScreen] = useState<Screen>({ type: 'tabs' })
  const [refreshKey, setRefreshKey] = useState(0)

  function openDay(day: Day) {
    setScreen({ type: 'dayDetail', day })
  }

  function startSession(day: Day) {
    setScreen({ type: 'session', day })
  }

  function closeToTabs() {
    setScreen({ type: 'tabs' })
  }

  function finishSession() {
    setRefreshKey((k) => k + 1)
    setTab('historial')
    setScreen({ type: 'tabs' })
  }

  if (screen.type === 'session') {
    return <WorkoutSessionScreen day={screen.day} onFinish={finishSession} onExit={closeToTabs} />
  }

  if (screen.type === 'dayDetail') {
    return <DayDetailScreen day={screen.day} onBack={closeToTabs} onStart={() => startSession(screen.day)} />
  }

  return (
    <div className="min-h-screen">
      <div className="pb-24">
        {tab === 'inicio' && <InicioScreen key={refreshKey} onOpenDay={openDay} onStart={startSession} />}
        {tab === 'rutina' && <RutinaScreen onOpenDay={openDay} />}
        {tab === 'historial' && <HistorialScreen key={refreshKey} />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

export default App
