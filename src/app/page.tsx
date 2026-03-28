'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GlrLogo from '@/components/GlrLogo'
import { createClient } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #2d2e30 0%, #3d3f42 40%, #2d2e30 100%)' }}>
      {/* Top accent bar */}
      <div className="h-1 w-full bg-glr-green" />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">

        {/* Logo */}
        <div className="mb-6 animate-fade-up">
          <GlrLogo size={56} color="#8DC63F" textColor="#ffffff" />
        </div>

        {/* Tagline */}
        <div className="text-center mb-10 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <p className="text-glr-green text-sm font-semibold tracking-[0.3em] uppercase mb-1">
            Forward. Moving.
          </p>
          <p className="text-white/40 text-xs tracking-widest uppercase">
            Broker Portal
          </p>
        </div>

        {/* Login card */}
        <div
          className="w-full max-w-sm animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
              {error && (
                <div className="bg-red-900/40 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-glr-green transition"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="broker@glrealty.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-glr-green transition"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-3 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: loading ? '#6fa832' : '#8DC63F', color: '#2d2e30' }}
              >
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-xs mt-10 tracking-widest uppercase animate-fade-up" style={{ animationDelay: '240ms' }}>
          GreenLight Realty &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
