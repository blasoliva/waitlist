import type { JoinSource, PartyStatus } from '../types'

const statusStyles: Record<PartyStatus, string> = {
  waiting: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  notified: 'bg-sky-100 text-sky-800 ring-sky-600/20',
  seated: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  removed: 'bg-stone-100 text-stone-600 ring-stone-500/20',
}

const statusLabels: Record<PartyStatus, string> = {
  waiting: 'Waiting',
  notified: 'Notified',
  seated: 'Seated',
  removed: 'Removed',
}

export function StatusBadge({ status }: { status: PartyStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  )
}

const sourceLabels: Record<JoinSource, string> = {
  host: 'Host stand',
  kiosk: 'Kiosk check-in',
  remote: 'Remote join',
}

export function SourceBadge({ source }: { source: JoinSource }) {
  return (
    <span className="inline-flex items-center rounded-full bg-stone-50 px-2.5 py-0.5 text-xs font-medium text-stone-500 ring-1 ring-inset ring-stone-400/20">
      {sourceLabels[source]}
    </span>
  )
}
