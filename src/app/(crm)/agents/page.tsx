'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Badge from '@/components/Badge'
import { createClient } from '@/lib/supabase'
import type { Agent } from '@/types'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
}

export default function AgentsPage() {
  const supabase = createClient()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function fetchAgents() {
    const { data } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
    setAgents(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  async function handleAddAgent(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase.from('agents').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      active: true,
      access_leads: true,
      access_docs: false,
      access_msgs: true,
    })
    if (error) {
      setError(error.message)
    } else {
      setForm(emptyForm)
      setShowForm(false)
      await fetchAgents()
    }
    setSaving(false)
  }

  async function toggleActive(agent: Agent) {
    await supabase
      .from('agents')
      .update({ active: !agent.active })
      .eq('id', agent.id)
    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, active: !a.active } : a))
    )
  }

  async function togglePermission(
    agent: Agent,
    field: 'access_leads' | 'access_docs' | 'access_msgs'
  ) {
    const newVal = !agent[field]
    await supabase
      .from('agents')
      .update({ [field]: newVal })
      .eq('id', agent.id)
    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, [field]: newVal } : a))
    )
  }

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-glr-gray-dark">Agents</h1>
            <p className="text-glr-gray text-sm mt-1">Manage your agent roster and access</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-glr-green hover:bg-glr-green-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Agent'}
          </button>
        </div>

        {/* Add agent form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-fade-up">
            <h2 className="font-semibold text-glr-gray-dark mb-4">New Agent</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleAddAgent} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green"
              />
              <input
                placeholder="Phone (+1...)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green"
              />
              <button
                type="submit"
                disabled={saving}
                className="sm:col-span-3 bg-glr-green hover:bg-glr-green-dark text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {saving ? 'Adding…' : 'Add Agent'}
              </button>
            </form>
          </div>
        )}

        {/* Agents table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-glr-gray text-sm">Loading…</div>
          ) : agents.length === 0 ? (
            <div className="p-8 text-center text-glr-gray text-sm">No agents yet. Add your first agent above.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-glr-green-light border-b border-glr-green-mid">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-glr-gray-dark">Name</th>
                  <th className="text-left px-6 py-3 font-semibold text-glr-gray-dark">Phone</th>
                  <th className="text-left px-6 py-3 font-semibold text-glr-gray-dark">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-glr-gray-dark">Leads</th>
                  <th className="text-center px-4 py-3 font-semibold text-glr-gray-dark">Docs</th>
                  <th className="text-center px-4 py-3 font-semibold text-glr-gray-dark">Msgs</th>
                  <th className="text-left px-6 py-3 font-semibold text-glr-gray-dark">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-glr-gray-light/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-glr-gray-dark">{agent.name}</p>
                      <p className="text-xs text-glr-gray">{agent.email}</p>
                    </td>
                    <td className="px-6 py-4 text-glr-gray">{agent.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <Badge status={agent.active ? 'active' : 'inactive'} />
                    </td>
                    {/* Access checkboxes */}
                    {(['access_leads', 'access_docs', 'access_msgs'] as const).map((field) => (
                      <td key={field} className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={agent[field]}
                          onChange={() => togglePermission(agent, field)}
                          className="w-4 h-4 accent-glr-green cursor-pointer"
                        />
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleActive(agent)}
                          className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                            agent.active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-glr-green-light text-glr-green-dark hover:bg-glr-green-mid'
                          }`}
                        >
                          {agent.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                          href="/messages"
                          className="text-xs font-medium text-glr-green hover:text-glr-green-dark underline"
                        >
                          Text
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
