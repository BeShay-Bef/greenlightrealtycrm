'use client'

import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard':  { title: 'Dashboard',  sub: 'Team overview and key metrics'        },
  '/pipeline':   { title: 'Pipeline',   sub: 'Visual lead pipeline by status'       },
  '/agents':     { title: 'Agents',     sub: 'Manage your agent roster and access'  },
  '/leads':      { title: 'Leads',      sub: 'Track and manage your lead pipeline'  },
  '/tasks':      { title: 'Tasks',      sub: 'To-dos and follow-ups'               },
  '/messages':   { title: 'Messages',   sub: 'Agent communications'                },
  '/documents':  { title: 'Documents',  sub: 'Upload and scan with AI'             },
}

export default function TopBar() {
  const pathname = usePathname()
  const page = PAGE_TITLES[pathname] ?? { title: 'CRM', sub: '' }
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
      <div>
        <h2 className="font-heading text-lg font-bold text-glr-gray-dark leading-tight">
          {page.title}
        </h2>
        <p className="text-xs text-glr-gray leading-tight">{page.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-glr-gray hidden sm:block">{today}</span>
        <div className="w-px h-5 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-glr-green flex items-center justify-center text-white text-xs font-heading font-bold select-none">
            GL
          </div>
          <span className="text-sm font-medium text-glr-gray-dark hidden sm:block">Broker</span>
        </div>
      </div>
    </header>
  )
}
