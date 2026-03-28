'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GlrLogo from '@/components/GlrLogo'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
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
    <div className="min-h-screen flex flex-col bg-glr-gray-light">
      {/* Dark logo bar */}
      <div className="w-full bg-glr-gray-dark px-8 py-4 flex items-center">
        <GlrLogo size={38} color="#8DC63F" textColor="#ffffff" />
      </div>

      {/* Login card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-up">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Card header */}
            <div className="bg-glr-green px-8 py-6">
              <h1 className="text-xl font-bold text-white">Broker Portal</h1>
              <p className="text-green-50 text-sm mt-1">Sign in to manage your team</p>
            </div>

            {/* Card body */}
            <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-glr-gray-dark mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green focus:border-transparent transition"
                  placeholder="broker@greenlight.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-glr-gray-dark mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-glr-green hover:bg-glr-green-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-glr-gray mt-6">
            GreenLight Realty &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
