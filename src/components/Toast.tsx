'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  msg: string
  type: ToastType
}

// Module-level singleton — works because all client code runs in one JS context
let _addToast: ((msg: string, type: ToastType) => void) | null = null

export function toast(msg: string, type: ToastType = 'success') {
  _addToast?.(msg, type)
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    _addToast = (msg, type) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((p) => [...p, { id, msg, type }])
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3800)
    }
    return () => {
      _addToast = null
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-toast-in pointer-events-auto flex items-center gap-3 pl-4 pr-5 py-3 rounded-xl shadow-xl text-sm font-semibold min-w-64 ${
            t.type === 'success'
              ? 'bg-glr-green text-white'
              : t.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-glr-gray-dark text-white'
          }`}
        >
          <span className="text-base leading-none">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
