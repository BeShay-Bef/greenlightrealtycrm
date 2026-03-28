'use client'

import { useEffect, useState } from 'react'
import Badge from '@/components/Badge'
import { createClient } from '@/lib/supabase'
import type { Agent, Lead } from '@/types'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  status: 'Warm' as Lead['status'],
  agent_id: '',
  notes: '',
}

const STATUS_OPTIONS: Lead['status'][] = ['Hot', 'Warm', 'Cold']

export default function LeadsPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'All'>('All')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function fetchData() {
    const [leadsRes, agentsRes] = await Promise.all([
      supabase
        .from('leads')
        .select('*, agents(name)')
        .order('created_at', { ascending: false }),
      supabase.from('agents').select('*').eq('active', true),
    ])
    setLeads(leadsRes.data ?? [])
    setAgents(agentsRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase.from('leads').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      status: form.status,
      agent_id: form.agent_id || null,
      notes: form.notes,
    })
    if (error) {
      setError(error.message)
    } else {
      setForm(emptyForm)
      setShowForm(false)
      await fetchData()
    }
    setSaving(false)
  }

  async function handleStatusChange(lead: Lead, newStatus: Lead['status']) {
    await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id)
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
    )
  }

  const filtered = leads.filter((l) => {
    const matchesSearch =
      search === '' ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search)
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-glr-gray-dark">Leads</h1>
            <p className="text-glr-gray text-sm mt-1">Track and manage your lead pipeline</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-glr-green hover:bg-glr-green-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Lead'}
          </button>
        </div>

        {/* Add lead form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 animate-fade-up">
            <h2 className="font-semibold text-glr-gray-dark mb-4">New Lead</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleAddLead} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green"
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Lead['status'] })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green bg-white"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={form.agent_id}
                onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green bg-white"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <textarea
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green resize-none"
              />
              <button
                type="submit"
                disabled={saving}
                className="sm:col-span-2 bg-glr-green hover:bg-glr-green-dark text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {saving ? 'Adding…' : 'Add Lead'}
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <input
            type="search"
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-glr-green"
          />
          <div className="flex gap-2">
            {(['All', ...STATUS_OPTIONS] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-glr-green text-white'
                    : 'bg-white border border-gray-200 text-glr-gray hover:border-glr-green'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Leads table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-glr-gray text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-glr-gray text-sm">No leads found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-glr-green-light border-b border-glr-green-mid">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-glr-gray-dark">Name</th>
                  <th className="text-left px-6 py-3 font-semibold text-glr-gray-dark">Phone</th>
                  <th className="text-left px-6 py-3 font-semibold text-glr-gray-dark">Assigned To</th>
                  <th className="text-left px-6 py-3 font-semibold text-glr-gray-dark">Status</th>
                  <th className="text-left px-6 py-3 font-semibold text-glr-gray-dark">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-glr-gray-light/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-glr-gray-dark">{lead.name}</p>
                      <p className="text-xs text-glr-gray">{lead.email}</p>
                    </td>
                    <td className="px-6 py-4 text-glr-gray">{lead.phone || '—'}</td>
                    <td className="px-6 py-4 text-glr-gray">
                      {lead.agents?.name ?? 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusChange(lead, e.target.value as Lead['status'])
                        }
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-glr-green"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-glr-gray text-xs max-w-48 truncate">
                      {lead.notes || '—'}
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
