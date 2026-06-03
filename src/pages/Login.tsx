import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export function Login() {
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  if (session) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              backgroundColor: '#22c55e15',
              border: '1px solid #22c55e30',
              boxShadow: '0 0 40px #22c55e10',
            }}
          >
            <Dumbbell size={30} color="#22c55e" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#f1f5f9' }}>
            Gym<span style={{ color: '#22c55e' }}>AI</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Tu entrenador personal con inteligencia artificial
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: '#111111',
            border: '1px solid #222222',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#f1f5f9' }}>
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail size={16} color="#475569" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#161616',
                    border: '1px solid #222222',
                    color: '#f1f5f9',
                  }}
                  onFocus={e => {
                    e.target.style.border = '1px solid #22c55e'
                    e.target.style.boxShadow = '0 0 0 3px #22c55e15'
                  }}
                  onBlur={e => {
                    e.target.style.border = '1px solid #222222'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock size={16} color="#475569" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#161616',
                    border: '1px solid #222222',
                    color: '#f1f5f9',
                  }}
                  onFocus={e => {
                    e.target.style.border = '1px solid #22c55e'
                    e.target.style.boxShadow = '0 0 0 3px #22c55e15'
                  }}
                  onBlur={e => {
                    e.target.style.border = '1px solid #222222'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-all duration-200 hover:opacity-70"
                  style={{ color: '#475569' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: '#7f1d1d20', color: '#f87171', border: '1px solid #7f1d1d40' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 mt-2"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#0a0a0a',
                boxShadow: '0 4px 20px #22c55e30',
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: '#222222' }} />
            <span className="text-xs" style={{ color: '#475569' }}>o</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#222222' }} />
          </div>

          <p className="text-center text-sm" style={{ color: '#64748b' }}>
            ¿No tenés cuenta?{' '}
            <Link
              to="/registro"
              className="font-medium transition-all duration-200 hover:underline"
              style={{ color: '#22c55e' }}
            >
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
