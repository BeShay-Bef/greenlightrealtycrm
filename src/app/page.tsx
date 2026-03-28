'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GlrLogo from '@/components/GlrLogo'
import { createClient } from '@/lib/supabase'

type AgentTab = 'signin' | 'signup'

export default function HomePage() {
  const router = useRouter()

  // ── Broker state ──
  const [brokerEmail, setBrokerEmail] = useState('')
  const [brokerPassword, setBrokerPassword] = useState('')
  const [brokerError, setBrokerError] = useState('')
  const [brokerLoading, setBrokerLoading] = useState(false)

  // ── Agent state ──
  const [agentTab, setAgentTab] = useState<AgentTab>('signin')
  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')
  const [agentPassword, setAgentPassword] = useState('')
  const [agentError, setAgentError] = useState('')
  const [agentLoading, setAgentLoading] = useState(false)
  const [agentSuccess, setAgentSuccess] = useState('')

  // ── Admin dot state ──
  const [adminVisible, setAdminVisible] = useState(false)
  const [adminPasscode, setAdminPasscode] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminChecking, setAdminChecking] = useState(false)

  async function handleBrokerLogin(e: React.FormEvent) {
    e.preventDefault()
    setBrokerError('')
    setBrokerLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: brokerEmail,
      password: brokerPassword,
    })
    if (error) {
      setBrokerError(error.message)
      setBrokerLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function handleAgentSignIn(e: React.FormEvent) {
    e.preventDefault()
    setAgentError('')
    setAgentLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: agentEmail,
      password: agentPassword,
    })
    if (error) {
      setAgentError(error.message)
      setAgentLoading(false)
    } else {
      router.push('/agent-dashboard')
      router.refresh()
    }
  }

  async function handleAgentSignUp(e: React.FormEvent) {
    e.preventDefault()
    setAgentError('')
    setAgentLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: agentEmail,
      password: agentPassword,
    })
    if (error) {
      setAgentError(error.message)
      setAgentLoading(false)
      return
    }
    if (data.user) {
      await supabase.from('agents').insert({
        name: agentName,
        email: agentEmail,
        phone: '',
        active: false,
        access_leads: false,
        access_docs: false,
        access_msgs: false,
      })
    }
    setAgentLoading(false)
    setAgentSuccess('Account created! Check your email to confirm, then sign in.')
    setAgentTab('signin')
    setAgentEmail('')
    setAgentPassword('')
    setAgentName('')
  }

  async function handleAdminPasscode(e: React.FormEvent) {
    e.preventDefault()
    setAdminError('')
    setAdminChecking(true)
    try {
      const res = await fetch('/api/admin/check-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: adminPasscode }),
      })
      if (res.ok) {
        router.push('/glradmin')
      } else {
        setAdminError('Incorrect passcode')
        setAdminPasscode('')
      }
    } catch {
      setAdminError('Request failed')
    }
    setAdminChecking(false)
  }

  const darkInputClass =
    'w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-glr-green transition'
  const darkInputStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
  }
  const lightInputClass =
    'w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 text-glr-gray-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-glr-green focus:border-transparent transition'

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #1e1f22 0%, #2d2e30 55%, #252627 100%)',
      }}
    >
      {/* Top green accent bar */}
      <div className="h-1 w-full bg-glr-green flex-shrink-0" />

      {/* Subtle background texture circles */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(141,198,63,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">

        {/* Logo + tagline */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="flex justify-center mb-5">
            <GlrLogo size={54} color="#8DC63F" textColor="#ffffff" />
          </div>
          <p className="font-heading font-bold text-glr-green tracking-[0.3em] uppercase text-sm mb-1">
            Forward. Moving.
          </p>
          <p className="text-white/30 text-xs tracking-widest uppercase">
            Real Estate Management Portal
          </p>
        </div>

        {/* Two-card layout */}
        <div
          className="flex flex-col md:flex-row gap-5 w-full max-w-2xl animate-fade-up"
          style={{ animationDelay: '100ms' }}
        >

          {/* ════ BROKER PORTAL — dark card ════ */}
          <div
            className="flex-1 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(255,255,255,0.045)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Card header */}
            <div
              className="px-7 pt-6 pb-4 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-glr-green" />
                <p className="text-xs font-heading font-bold text-glr-green uppercase tracking-widest">
                  Broker Portal
                </p>
              </div>
              <p className="text-white/35 text-xs pl-3.5">Full management access</p>
            </div>

            <form onSubmit={handleBrokerLogin} className="px-7 py-6 space-y-4">
              {brokerError && (
                <div className="bg-red-900/30 border border-red-500/25 text-red-300 text-xs px-3 py-2.5 rounded-lg">
                  {brokerError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={brokerEmail}
                  onChange={(e) => setBrokerEmail(e.target.value)}
                  placeholder="broker@glrealty.com"
                  className={darkInputClass}
                  style={darkInputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={brokerPassword}
                  onChange={(e) => setBrokerPassword(e.target.value)}
                  placeholder="••••••••"
                  className={darkInputClass}
                  style={darkInputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={brokerLoading}
                className="w-full font-heading font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 hover:brightness-110 mt-1"
                style={{ background: '#8DC63F', color: '#2d2e30' }}
              >
                {brokerLoading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
          </div>

          {/* ════ AGENT PORTAL — light card ════ */}
          <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl bg-white">
            {/* Card header */}
            <div className="px-7 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-glr-gray" />
                <p className="text-xs font-heading font-bold text-glr-gray-dark uppercase tracking-widest">
                  Agent Portal
                </p>
              </div>
              <p className="text-glr-gray text-xs pl-3.5">Agent access & registration</p>
            </div>

            {/* Sign In / Sign Up tabs */}
            <div className="px-7 pt-5">
              <div className="flex gap-1 bg-glr-gray-light p-1 rounded-xl">
                {(['signin', 'signup'] as AgentTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setAgentTab(tab)
                      setAgentError('')
                      setAgentSuccess('')
                    }}
                    className={`flex-1 text-xs font-heading font-bold py-2 rounded-lg transition-all ${
                      agentTab === tab
                        ? 'bg-white text-glr-gray-dark shadow-sm'
                        : 'text-glr-gray hover:text-glr-gray-dark'
                    }`}
                  >
                    {tab === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>
            </div>

            <form
              key={agentTab}
              onSubmit={agentTab === 'signin' ? handleAgentSignIn : handleAgentSignUp}
              className="px-7 py-5 space-y-4"
            >
              {agentError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5 rounded-lg">
                  {agentError}
                </div>
              )}
              {agentSuccess && (
                <div className="bg-glr-green-light border border-glr-green-mid text-glr-green-dark text-xs px-3 py-2.5 rounded-lg">
                  {agentSuccess}
                </div>
              )}

              {agentTab === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-glr-gray uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    required
                    placeholder="Jane Smith"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className={lightInputClass}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-glr-gray uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="agent@example.com"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                  className={lightInputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-glr-gray uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={agentPassword}
                  onChange={(e) => setAgentPassword(e.target.value)}
                  className={lightInputClass}
                />
              </div>

              <button
                type="submit"
                disabled={agentLoading}
                className="w-full font-heading font-bold py-3 rounded-xl text-sm text-white transition-all disabled:opacity-50 hover:brightness-110 mt-1"
                style={{ background: '#2d2e30' }}
              >
                {agentLoading
                  ? agentTab === 'signin'
                    ? 'Signing in…'
                    : 'Creating account…'
                  : agentTab === 'signin'
                  ? 'Sign In →'
                  : 'Create Account →'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-white/20 text-xs mt-8 tracking-widest uppercase animate-fade-up"
          style={{ animationDelay: '200ms' }}
        >
          GreenLight Realty &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* ════ Hidden admin dot (bottom-right) ════ */}
      <div className="fixed bottom-4 right-4 z-50">
        {!adminVisible ? (
          <button
            onClick={() => setAdminVisible(true)}
            className="w-2.5 h-2.5 rounded-full bg-white/10 hover:bg-white/30 transition-colors duration-300"
            aria-hidden="true"
          />
        ) : (
          <form
            onSubmit={handleAdminPasscode}
            className="flex flex-col gap-2 rounded-xl p-3 shadow-2xl animate-fade-in"
            style={{
              minWidth: '190px',
              background: 'rgba(30,31,34,0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {adminError && (
              <p className="text-red-400 text-xs px-1">{adminError}</p>
            )}
            <input
              type="password"
              autoFocus
              placeholder="Admin passcode"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setAdminVisible(false)
                  setAdminPasscode('')
                  setAdminError('')
                }
              }}
              className="px-3 py-2 rounded-lg text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-glr-green"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
            <div className="flex gap-1.5">
              <button
                type="submit"
                disabled={adminChecking}
                className="flex-1 text-xs font-heading font-bold py-1.5 rounded-lg transition hover:brightness-110 disabled:opacity-50"
                style={{ background: '#8DC63F', color: '#2d2e30' }}
              >
                {adminChecking ? '…' : 'Enter →'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminVisible(false)
                  setAdminPasscode('')
                  setAdminError('')
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg text-white/40 hover:text-white/70 transition"
              >
                ✕
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
