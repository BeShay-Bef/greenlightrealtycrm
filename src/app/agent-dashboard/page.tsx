'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GlrLogo from '@/components/GlrLogo'
import { createClient } from '@/lib/supabase'
import type { Agent } from '@/types'

export default function AgentDashboardPage() {
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.push('/'); return }
      setEmail(user.email ?? '')
      const { data } = await sb.from('agents').select('*').eq('email', user.email).single()
      setAgent(data ?? null)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSignOut() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initial = (agent?.name ?? email).charAt(0).toUpperCase()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#2d2e30' }}>
      {/* Top bar */}
      <div className="h-1 w-full bg-glr-green flex-shrink-0" />
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.07]">
        <GlrLogo size={30} color="#8DC63F" textColor="#ffffff" />
        <button
          onClick={handleSignOut}
          className="text-xs font-heading font-bold text-white/35 hover:text-white/70 uppercase tracking-wider transition-colors"
        >
          Sign Out
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {loading ? (
          <div className="text-white/30 text-sm font-heading">Loading…</div>
        ) : (
          <div className="w-full max-w-md animate-fade-up text-center">

            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 font-heading font-bold text-2xl"
              style={{ background: '#8DC63F', color: '#2d2e30' }}
            >
              {initial}
            </div>

            <h1 className="font-heading font-bold text-white text-2xl mb-1">
              {agent?.name ? `Hey, ${agent.name.split(' ')[0]}` : 'Agent Portal'}
            </h1>
            <p className="text-white/35 text-sm mb-8">{email}</p>

            {/* Status card */}
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: '#1a1b1d', border: '1px solid rgba(141,198,63,0.18)' }}
            >
              {!agent ? (
                <>
                  <svg className="w-10 h-10 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <h2 className="font-heading font-bold text-white text-lg mb-2">You&apos;re signed in</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Contact your broker to be added to the team.
                  </p>
                </>
              ) : !agent.active ? (
                <>
                  <svg className="w-10 h-10 text-amber-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h2 className="font-heading font-bold text-white text-lg mb-2">Pending Approval</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Your broker will grant access shortly.
                  </p>
                </>
              ) : (
                <>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                    style={{ background: 'rgba(141,198,63,0.12)', border: '1px solid rgba(141,198,63,0.25)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-glr-green" />
                    <span className="text-glr-green text-xs font-heading font-bold uppercase tracking-wider">Active</span>
                  </div>
                  <h2 className="font-heading font-bold text-white text-lg mb-4">Agent Portal</h2>
                  <p className="text-white/30 text-xs font-heading uppercase tracking-widest mb-6">Coming Soon</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Leads', ok: agent.access_leads },
                      { label: 'Docs',  ok: agent.access_docs },
                      { label: 'Msgs',  ok: agent.access_msgs },
                    ].map(item => (
                      <div
                        key={item.label}
                        className="rounded-xl py-3 px-2"
                        style={{
                          background: item.ok ? 'rgba(141,198,63,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${item.ok ? 'rgba(141,198,63,0.2)' : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        <p className={`text-xs font-heading font-bold ${item.ok ? 'text-glr-green' : 'text-white/20'}`}>
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </main>

      <footer className="py-5 text-center">
        <p className="text-white/12 text-xs font-heading uppercase tracking-widest">
          GreenLight Realty &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
