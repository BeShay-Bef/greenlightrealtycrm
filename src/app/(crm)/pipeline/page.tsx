'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Badge from '@/components/Badge'
import { toast } from '@/components/Toast'
import type { Lead } from '@/types'

const COLUMNS: {
  status: Lead['status']
  label: string
  textColor: string
  headerBg: string
}[] = [
  {
    status: 'Hot',
    label: 'Hot',
    textColor: 'text-red-600',
    headerBg: 'bg-red-50 border-red-200',
  },
  {
    status: 'Warm',
    label: 'Warm',
    textColor: 'text-amber-600',
    headerBg: 'bg-amber-50 border-amber-200',
  },
  {
    status: 'Cold',
    label: 'Cold',
    textColor: 'text-blue-600',
    headerBg: 'bg-blue-50 border-blue-200',
  },
]

export default function PipelinePage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [moving, setMoving] = useState<string | null>(null)

  async function fetchLeads() {
    const { data } = await supabase
      .from('leads')
      .select('*, agents(name)')
      .order('created_at', { ascending: false })
    setLeads(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  async function moveToStatus(lead: Lead, newStatus: Lead['status']) {
    setMoving(lead.id)
    await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id)
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
    )
    toast(`${lead.name} moved to ${newStatus}`)
    setMoving(null)
  }

  const totalLeads = leads.length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-glr-gray-dark">Pipeline</h1>
          <p className="text-sm text-glr-gray mt-1">
            {totalLeads} total lead{totalLeads !== 1 ? 's' : ''} across all stages
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-glr-gray text-sm gap-2">
          <span className="inline-block w-4 h-4 border-2 border-glr-green border-t-transparent rounded-full animate-spin" />
          Loading pipeline…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((col) => {
            const colLeads = leads.filter((l) => l.status === col.status)
            const others = COLUMNS.filter((c) => c.status !== col.status)

            return (
              <div key={col.status} className="flex flex-col gap-3">
                {/* Column header */}
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border ${col.headerBg}`}
                >
                  <span className={`font-heading font-bold text-sm ${col.textColor}`}>
                    {col.label}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/70 ${col.textColor}`}
                  >
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3 min-h-20">
                  {colLeads.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center gap-2 text-glr-gray">
                      <p className="text-xs">No {col.label.toLowerCase()} leads</p>
                    </div>
                  ) : (
                    colLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 card-hover ${
                          moving === lead.id ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        {/* Lead info */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0 flex-1 mr-3">
                            <p className="font-semibold text-glr-gray-dark text-sm truncate">
                              {lead.name}
                            </p>
                            <p className="text-xs text-glr-gray mt-0.5">
                              {lead.agents?.name ?? 'Unassigned'}
                            </p>
                          </div>
                          <Badge status={lead.status} dot={false} />
                        </div>

                        {(lead.phone || lead.email) && (
                          <div className="mb-3 space-y-0.5">
                            {lead.phone && (
                              <p className="text-xs text-glr-gray">{lead.phone}</p>
                            )}
                            {lead.email && (
                              <p className="text-xs text-glr-gray truncate">{lead.email}</p>
                            )}
                          </div>
                        )}

                        {lead.notes && (
                          <p className="text-xs text-glr-gray italic truncate mb-3">
                            {lead.notes}
                          </p>
                        )}

                        {/* Move buttons */}
                        <div className="flex gap-1.5 flex-wrap pt-2 border-t border-gray-50">
                          {others.map((target) => (
                            <button
                              key={target.status}
                              onClick={() => moveToStatus(lead, target.status)}
                              className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all hover:opacity-80 active:scale-95 ${target.headerBg} ${target.textColor}`}
                            >
                              → {target.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
