'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Agent, Message } from '@/types'

export default function MessagesPage() {
  const supabase = createClient()
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [groupMsg, setGroupMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [sendingGroup, setSendingGroup] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase
      .from('agents')
      .select('*')
      .eq('active', true)
      .order('name')
      .then(({ data }) => {
        setAgents(data ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!selectedAgent) return
    supabase
      .from('messages')
      .select('*')
      .eq('agent_id', selectedAgent.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []))
  }, [selectedAgent])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAgent || !newMsg.trim()) return
    setSending(true)
    await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: selectedAgent.phone,
        body: newMsg,
        agent_id: selectedAgent.id,
      }),
    })
    setNewMsg('')
    // Re-fetch messages
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('agent_id', selectedAgent.id)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
    setSending(false)
  }

  async function sendGroupMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!groupMsg.trim()) return
    setSendingGroup(true)
    await fetch('/api/sms/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: groupMsg }),
    })
    setGroupMsg('')
    setSendingGroup(false)
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <div className="flex h-full" style={{ height: 'calc(100vh)' }}>
        {/* Left panel — agent threads */}
        <div className="w-72 bg-white border-r border-gray-100 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-heading font-semibold text-glr-gray-dark">Conversations</h2>
            <p className="text-xs text-glr-gray mt-0.5">Active agents</p>
          </div>

          {loading ? (
            <div className="p-4 text-sm text-glr-gray">Loading…</div>
          ) : agents.length === 0 ? (
            <div className="p-4 text-sm text-glr-gray">No active agents.</div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full text-left px-5 py-4 border-b border-gray-50 hover:bg-glr-green-light transition-colors ${
                    selectedAgent?.id === agent.id ? 'bg-glr-green-light border-l-4 border-l-glr-green' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-glr-green-mid flex items-center justify-center text-sm font-bold text-glr-gray-dark">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-glr-gray-dark">{agent.name}</p>
                      <p className="text-xs text-glr-gray">{agent.phone || 'No phone'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Group text */}
          <div className="p-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-glr-gray mb-2 uppercase tracking-wider">Group Text</p>
            <form onSubmit={sendGroupMessage} className="flex flex-col gap-2">
              <textarea
                value={groupMsg}
                onChange={(e) => setGroupMsg(e.target.value)}
                placeholder="Send to all active agents…"
                rows={2}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-glr-green"
              />
              <button
                type="submit"
                disabled={sendingGroup || !groupMsg.trim()}
                className="bg-glr-gray-dark hover:bg-glr-gray text-white text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {sendingGroup ? 'Sending…' : 'Send to All'}
              </button>
            </form>
          </div>
        </div>

        {/* Right panel — message thread */}
        <div className="flex-1 flex flex-col bg-glr-gray-light">
          {!selectedAgent ? (
            <div className="flex-1 flex items-center justify-center text-glr-gray">
              <div className="text-center">
                <div className="text-5xl mb-3">💬</div>
                <p className="font-medium">Select an agent to view messages</p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-glr-green-mid flex items-center justify-center text-sm font-bold text-glr-gray-dark">
                  {selectedAgent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-glr-gray-dark">{selectedAgent.name}</p>
                  <p className="text-xs text-glr-gray">{selectedAgent.phone}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-glr-gray py-8">No messages yet. Send the first one!</p>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from_broker ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                        msg.from_broker
                          ? 'bg-glr-green text-white rounded-br-sm'
                          : 'bg-white text-glr-gray-dark rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p>{msg.body}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.from_broker ? 'text-green-100' : 'text-glr-gray'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Send input */}
              <div className="bg-white border-t border-gray-100 px-6 py-4">
                <form onSubmit={sendMessage} className="flex gap-3">
                  <input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder={`Message ${selectedAgent.name}…`}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-glr-green"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMsg.trim()}
                    className="bg-glr-green hover:bg-glr-green-dark text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    {sending ? '…' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
