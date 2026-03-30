'use client'

import { useEffect, useState } from 'react'
import Badge from '@/components/Badge'
import { createClient } from '@/lib/supabase'
import { toast } from '@/components/Toast'

type Priority = 'High' | 'Medium' | 'Low'

interface Task {
  id: string
  title: string
  priority: Priority
  due_date: string | null
  done: boolean
  created_at: string
}

const emptyForm = { title: '', priority: 'Medium' as Priority, due_date: '' }

function formatDue(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function TasksPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('done', { ascending: true })
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === '42P01') setNeedsSetup(true)
    } else {
      setTasks(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const overdue = tasks.filter((t) => !t.done && t.due_date && t.due_date < today)
  const upcoming = tasks.filter((t) => !t.done && !(t.due_date && t.due_date < today))
  const done = tasks.filter((t) => t.done)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    const { error } = await supabase.from('tasks').insert({
      title: form.title.trim(),
      priority: form.priority,
      due_date: form.due_date || null,
    })
    if (error) {
      toast(error.message, 'error')
    } else {
      toast('Task added')
      setForm(emptyForm)
      await fetchTasks()
    }
    setSaving(false)
  }

  async function toggleDone(task: Task) {
    await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id)
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
    )
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
    toast('Task removed', 'info')
  }

  if (needsSetup) {
    return (
      <div className="p-8 max-w-xl">
        <h1 className="font-heading text-2xl font-bold text-glr-gray-dark mb-6">Tasks</h1>
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="font-semibold text-glr-gray-dark mb-2">One-time setup required</h2>
          <p className="text-sm text-glr-gray mb-5">
            Run this SQL once in your Supabase dashboard to enable tasks:
          </p>
          <pre className="bg-glr-gray-light text-xs p-4 rounded-xl overflow-x-auto text-glr-gray-dark whitespace-pre font-mono leading-relaxed">
{`CREATE TABLE tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  priority text NOT NULL DEFAULT 'Medium'
    CHECK (priority IN ('High','Medium','Low')),
  due_date date,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "broker tasks"
  ON tasks FOR ALL USING (true);`}
          </pre>
          <p className="text-xs text-glr-gray mt-4">
            Go to{' '}
            <span className="font-mono bg-glr-gray-light px-1 py-0.5 rounded text-glr-gray-dark">
              supabase.com → SQL Editor
            </span>{' '}
            and paste the above.
          </p>
        </div>
      </div>
    )
  }

  function TaskRow({ task, isOverdue = false }: { task: Task; isOverdue?: boolean }) {
    return (
      <div
        className={`flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 table-row-hover transition-opacity ${
          task.done ? 'opacity-40' : ''
        } ${isOverdue ? 'bg-red-50/40' : ''}`}
      >
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => toggleDone(task)}
          className="w-4 h-4 accent-glr-green cursor-pointer flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium text-glr-gray-dark ${
              task.done ? 'line-through' : ''
            }`}
          >
            {task.title}
          </p>
          {task.due_date && (
            <p
              className={`text-xs mt-0.5 font-medium ${
                isOverdue ? 'text-red-500' : 'text-glr-gray'
              }`}
            >
              {isOverdue ? 'Overdue · ' : ''}Due {formatDue(task.due_date)}
            </p>
          )}
        </div>
        <Badge status={task.priority} dot />
        <button
          onClick={() => deleteTask(task.id)}
          className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors p-1"
          title="Remove task"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-glr-gray-dark">Tasks</h1>
        <p className="text-sm text-glr-gray mt-1">
          {tasks.filter((t) => !t.done).length} open task
          {tasks.filter((t) => !t.done).length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Overdue alert banner */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          <p className="text-sm text-red-700 font-semibold">
            {overdue.length} overdue task{overdue.length > 1 ? 's' : ''} — review below
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Add task form ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="font-heading font-bold text-glr-gray-dark mb-5 text-sm uppercase tracking-wider">
              New Task
            </h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-glr-gray uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  required
                  placeholder="e.g. Call back John Smith"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm input-focus"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-glr-gray uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value as Priority })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white input-focus"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-glr-gray uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm input-focus"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-glr-green hover:bg-glr-green-dark text-white font-heading font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 mt-1"
              >
                {saving ? 'Adding…' : 'Add Task'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Task lists ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Overdue */}
          {overdue.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in">
              <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                <h3 className="font-heading font-bold text-sm text-red-700">
                  Overdue ({overdue.length})
                </h3>
              </div>
              {overdue.map((t) => (
                <TaskRow key={t.id} task={t} isOverdue />
              ))}
            </div>
          )}

          {/* Upcoming */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-glr-green-light border-b border-glr-green-mid">
              <h3 className="font-heading font-bold text-sm text-glr-gray-dark">
                Upcoming ({upcoming.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-glr-gray text-sm">Loading…</div>
            ) : upcoming.length === 0 ? (
              <div className="p-10 text-center text-glr-gray flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-glr-green" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-medium text-glr-gray-dark">All caught up!</p>
                <p className="text-xs">Add a task on the left to get started.</p>
              </div>
            ) : (
              upcoming.map((t) => <TaskRow key={t.id} task={t} />)
            )}
          </div>

          {/* Done */}
          {done.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="font-heading font-bold text-sm text-glr-gray">
                  Completed ({done.length})
                </h3>
              </div>
              {done.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
