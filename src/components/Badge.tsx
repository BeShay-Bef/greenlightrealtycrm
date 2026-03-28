import clsx from 'clsx'

type BadgeStatus =
  | 'Hot'
  | 'Warm'
  | 'Cold'
  | 'active'
  | 'inactive'
  | 'Scanned'
  | 'Processing'
  | 'Pending'

interface BadgeProps {
  status: BadgeStatus
  className?: string
}

const badgeStyles: Record<BadgeStatus, string> = {
  Hot: 'bg-red-100 text-red-700 border border-red-200',
  Warm: 'bg-amber-100 text-amber-700 border border-amber-200',
  Cold: 'bg-blue-100 text-blue-700 border border-blue-200',
  active: 'bg-green-100 text-green-700 border border-green-200',
  inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
  Scanned: 'bg-green-100 text-green-700 border border-green-200',
  Processing: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Pending: 'bg-gray-100 text-gray-500 border border-gray-200',
}

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        badgeStyles[status],
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
