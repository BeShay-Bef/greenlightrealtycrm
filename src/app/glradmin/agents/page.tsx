'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Agent } from '@/types'

const supabase = createClient()

export default function AdminAgentsPage() {
  const [pending,  setPending]  = useState<Agent[]>([])
  const [active,   setActive]   = useState<Agent[]>([])
  const [loading,  setLoading]  = useState(true)
  const [acting,   setActing]   = useState<string | null>(null)
  const [success,  setSuccess]  = useState('')
  const [error,    setError]    = useState('')

  async function fetchAgents() {
    const { data } = await supabase
      .from('agents').select('*').order('created_at', { ascending: false })
    const all = data ?? []
    setPending(all.filter(a => !a.active))
    setActive(all.filter(a => a.active))
    setLoading(false)
  }

  useEffect(() => { fetchAgents() }, [])

  function flash(msg: string, isError = false) {
    if (isError) { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 4000)
  }

  async function handleApprove(agent: Agent) {
    setActing(agent.id)
    await supabase.from('agents').update({ active: true, access_leads: true, access_msgs: true }).eq('id', agent.id)
    flash(`${agent.name} approved`)
    await fetchAgents()
    setActing(null)
  }

  async function handleReject(agent: Agent) {
    if (!confirm(`Reject and delete ${agent.name}? This cannot be undone.`)) return
    setActing(agent.id)
    // Find and delete auth user by email
    const usersRes = await fetch('/api/admin/users')
    if (usersRes.ok) {
      const { users } = await usersRes.json()
      const authUser = users.find((u: { id: string; email: string }) => u.email === agent.email)
      if (authUser) {
        await fetch(`/api/admin/users/${authUser.id}`, { method: 'DELETE' })
      }
    }
    await supabase.from('agents').delete().eq('id', agent.id)
    flash(`${agent.name} rejected and removed`)
    await fetchAgents()
    setActing(null)
  }

  async function toggleActive(agent: Agent) {
    await supabase.from('agents').update({ active: !agent.active }).eq('id', agent.id)
    setActive(prev => prev.map(a => a.id === agent.id ? { ...a, active: !a.active } : a))
  }

  function fmt(ts: string) {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-white">Agents</h1>
        <p className="text-white/40 text-sm mt-1">Manage agent approvals and access</p>
      </div>

      {error   && <div className="mb-5 bg-red-900/30 border border-red-500/25 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="mb-5 bg-glr-green/15 border border-glr-green/25 text-glr-green text-sm px-4 py-3 rounded-lg">{success}</div>}

      {loading ? (
        <div className="text-white/30 text-sm p-8 text-center">Loading…</div>
      ) : (
        <>
          {/* Pending section */}
          {pending.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-heading font-bold text-white text-sm uppercase tracking-wider">Pending Approval</h2>
                <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <table className="w-full text-sm">
                  <thead className="border-b border-white/8">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Agent</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Phone</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Signed Up</th>
                      <th className="text-right px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pending.map(agent => (
                      <tr key={agent.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-amber-400">{agent.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{agent.name}</p>
                              <p className="text-xs text-white/40">{agent.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/50">{agent.phone || '—'}</td>
                        <td className="px-6 py-4 text-white/50 text-xs">{fmt(agent.created_at)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(agent)}
                              disabled={acting === agent.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                              style={{ background: '#8DC63F', color: '#2d2e30' }}>
                              {acting === agent.id ? '…' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(agent)}
                              disabled={acting === agent.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/60 disabled:opacity-50 transition-colors">
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active agents */}
          <div>
            {pending.length > 0 && (
              <h2 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">Active Agents</h2>
            )}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {active.length === 0 ? (
                <div className="p-8 text-center text-white/30 text-sm">No active agents yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-white/8">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Agent</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Phone</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Joined</th>
                      <th className="text-right px-6 py-3 text-xs font-bold text-white/30 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {active.map(agent => (
                      <tr key={agent.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-glr-green/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-glr-green">{agent.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{agent.name}</p>
                              <p className="text-xs text-white/40">{agent.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/50">{agent.phone || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${agent.active ? 'bg-glr-green/15 text-glr-green' : 'bg-white/8 text-white/30'}`}>
                            {agent.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/40 text-xs">{fmt(agent.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleActive(agent)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                              agent.active
                                ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                : 'bg-glr-green/15 text-glr-green hover:bg-glr-green/25'
                            }`}>
                            {agent.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
