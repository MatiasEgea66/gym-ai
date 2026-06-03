import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Dumbbell, Calendar, Apple, History, User, LogOut } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Plan', end: true, icon: Calendar },
  { to: '/dieta', label: 'Dieta', icon: Apple },
  { to: '/historial', label: 'Historial', icon: History },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export function Layout() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-full z-50"
        style={{
          width: '260px',
          backgroundColor: '#111111',
          borderRight: '1px solid #222222',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: '1px solid #222222' }}>
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ backgroundColor: '#22c55e15', border: '1px solid #22c55e30' }}
          >
            <Dumbbell size={18} color="#22c55e" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: '#f1f5f9' }}>
            Gym<span style={{ color: '#22c55e' }}>AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? '' : 'hover:bg-white/[0.03]'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      backgroundColor: '#22c55e15',
                      color: '#22c55e',
                      borderLeft: '3px solid #22c55e',
                      paddingLeft: '13px',
                    }
                  : { color: '#94a3b8', borderLeft: '3px solid transparent', paddingLeft: '13px' }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} color={isActive ? '#22c55e' : '#94a3b8'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid #222222' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/10"
            style={{ color: '#64748b' }}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: '#111111', borderBottom: '1px solid #222222' }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Dumbbell size={18} color="#22c55e" />
            <span className="font-bold text-base" style={{ color: '#f1f5f9' }}>
              Gym<span style={{ color: '#22c55e' }}>AI</span>
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-red-500/10"
            style={{ color: '#64748b' }}
          >
            <LogOut size={18} />
          </button>
        </div>
        <nav className="flex px-2 pb-2 gap-1">
          {navItems.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive ? '' : 'hover:bg-white/[0.03]'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: '#22c55e15', color: '#22c55e' }
                  : { color: '#64748b' }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} color={isActive ? '#22c55e' : '#64748b'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main
        className="flex-1 md:ml-[260px] pt-[100px] md:pt-0"
        style={{ minHeight: '100vh' }}
      >
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
