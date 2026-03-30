import clsx from 'clsx'

type BadgeStatus =
  | 'Hot' | 'Warm' | 'Cold'
  | 'active' | 'inactive'
  | 'Scanned' | 'Processing' | 'Pending'
  | 'High' | 'Medium' | 'Low'

interface BadgeProps {
  status: BadgeStatus
  className?: string
  dot?: boolean
}

const badgeConfig: Record<BadgeStatus, { bg: string; text: string; border: string; dot: string }> = {
  Hot:        { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    dot: 'bg-red-500'    },
  Warm:       { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  Cold:       { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  active:     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
  inactive:   { bg: 'bg-gray-100',  text: 'text-gray-500',   border: 'border-gray-200',   dot: 'bg-gray-400'   },
  Scanned:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
  Processing: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  Pending:    { bg: 'bg-gray-100',  text: 'text-gray-500',   border: 'border-gray-200',   dot: 'bg-gray-400'   },
  High:       { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    dot: 'bg-red-500'    },
  Medium:     { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  Low:        { bg: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-200',    dot: 'bg-sky-400'    },
}

const labels: Record<BadgeStatus, string> = {
  Hot: 'Hot', Warm: 'Warm', Cold: 'Cold',
  active: 'Active', inactive: 'Inactive',
  Scanned: 'Scanned', Processing: 'Processing', Pending: 'Pending',
  High: 'High', Medium: 'Medium', Low: 'Low',
}

export default function Badge({ status, className, dot = true }: BadgeProps) {
  const c = badgeConfig[status]
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border tracking-wide',
        c.bg, c.text, c.border, className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', c.dot)} />}
      {labels[status]}
    </span>
  )
}
