'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GlrLogo from '@/components/GlrLogo'
import { createClient } from '@/lib/supabase'
import type { Agent } from '@/types'

export default function AgentDashboardPage() {
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAgent() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUserEmail(user.email ?? '')
      const { data } = await supabase
        .from('agents')
        .select('*')
        .eq('email', user.email)
        .single()
      setAgent(data ?? null)
      setLoading(false)
    }
    loadAgent()
  }, [router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #1e1f22 0%, #2d2e30 55%, #252627 100%)',
      }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-glr-green flex-shrink-0" />

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/8">
        <GlrLogo size={32} color="#8DC63F" textColor="#ffffff" />
        <button
          onClick={handleSignOut}
          className="text-xs font-heading font-bold text-white/40 hover:text-white/70 transition-colors uppercase tracking-wider"
        >
          Sign Out
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {loading ? (
          <div className="text-white/40 text-sm">Loading…</div>
        ) : (
          <div className="w-full max-w-lg animate-fade-up">

            {/* Welcome */}
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-heading font-bold text-glr-gray-dark mx-auto mb-4"
                style={{ background: '#8DC63F' }}
              >
                {(agent?.name ?? userEmail).charAt(0).toUpperCase()}
              </div>
              <h1 className="font-heading text-2xl font-bold text-white mb-1">
                Welcome{agent?.name ? `, ${agent.name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-white/40 text-sm">{userEmail}</p>
            </div>

            {/* Status card */}
            {agent && !agent.active ? (
              <div
                className="rounded-2xl p-6 text-center mb-5"
                style={{
                  background: 'rgba(255,255,255,0.045)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="text-3xl mb-3">⏳</div>
                <h2 className="font-heading font-bold text-white mb-2">
                  Pending Broker Approval
                </h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Your account has been created. Your broker will activate your
                  account and assign access permissions shortly.
                </p>
              </div>
            ) : agent && agent.active ? (
              <div className="space-y-4">
                {/* Active status */}
                <div
                  className="rounded-2xl p-5 flex items-center gap-4"
                  style={{
                    background: 'rgba(141,198,63,0.1)',
                    border: '1px solid rgba(141,198,63,0.2)',
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-glr-green flex items-center justify-center text-glr-gray-dark text-lg">
                    ✓
                  </div>
                  <div>
                    <p className="font-heading font-bold text-glr-green text-sm">
                      Account Active
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      Your broker has activated your account
                    </p>
                  </div>
                </div>

                {/* Access cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Leads', allowed: agent.access_leads, icon: '📋' },
                    { label: 'Docs', allowed: agent.access_docs, icon: '📄' },
                    { label: 'Messages', allowed: agent.access_msgs, icon: '💬' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl p-4 text-center"
                      style={{
                        background: item.allowed
                          ? 'rgba(141,198,63,0.08)'
                          : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${
                          item.allowed
                            ? 'rgba(141,198,63,0.2)'
                            : 'rgba(255,255,255,0.06)'
                        }`,
                      }}
                    >
                      <div className="text-xl mb-1">{item.icon}</div>
                      <p
                        className={`text-xs font-heading font-bold ${
                          item.allowed ? 'text-glr-green' : 'text-white/25'
                        }`}
                      >
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Coming soon */}
                <div
                  className="rounded-2xl p-5 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <p className="text-white/30 text-xs uppercase tracking-widest font-heading font-bold mb-1">
                    Agent Features
                  </p>
                  <p className="text-white/50 text-sm">Coming soon</p>
                </div>
              </div>
            ) : (
              /* No agent record */
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'rgba(255,255,255,0.045)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="text-3xl mb-3">👋</div>
                <h2 className="font-heading font-bold text-white mb-2">
                  You&apos;re signed in
                </h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Contact your broker to be added to the team.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-5 text-center">
        <p className="text-white/15 text-xs uppercase tracking-widest font-heading">
          GreenLight Realty &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
