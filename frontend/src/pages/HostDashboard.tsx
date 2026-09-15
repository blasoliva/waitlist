import { useMemo } from 'react'
import { AddWalkInForm } from '../components/AddWalkInForm'
import { PartyCard } from '../components/PartyCard'
import { QueueList } from '../components/QueueList'
import { TableGrid } from '../components/TableGrid'
import { useWaitlist } from '../context/WaitlistContext'
import { formatMinutes } from '../utils/time'

export function HostDashboard() {
  const { parties, tables, loading, addParty, notifyParty, seatParty, removeParty, freeTable, reorderQueue } = useWaitlist()

  const waiting = useMemo(
    () => parties.filter((p) => p.status === 'waiting').sort((a, b) => a.position - b.position),
    [parties],
  )
  const notified = useMemo(() => parties.filter((p) => p.status === 'notified'), [parties])
  const history = useMemo(
    () =>
      parties
        .filter((p) => p.status === 'seated' || p.status === 'removed')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [parties],
  )
  const availableTables = useMemo(() => tables.filter((t) => t.status === 'available'), [tables])

  const avgQuotedWait = waiting.length
    ? Math.round(waiting.reduce((sum, p) => sum + p.quotedWaitMinutes, 0) / waiting.length)
    : 0

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
        <StatCard label="Waiting" value={String(waiting.length)} />
        <StatCard label="Notified" value={String(notified.length)} />
        <StatCard label="Avg. quoted wait" value={formatMinutes(avgQuotedWait)} />
      </div>

      <AddWalkInForm onAdd={(input) => addParty({ ...input, source: 'host' }).then(() => undefined)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section>
            <h2 className="mb-2 text-sm font-semibold text-stone-900">Waiting queue · drag to reorder</h2>
            {loading ? (
              <p className="text-sm text-stone-400">Loading…</p>
            ) : (
              <QueueList
                parties={waiting}
                availableTables={availableTables}
                onReorder={reorderQueue}
                onNotify={notifyParty}
                onSeat={seatParty}
                onRemove={removeParty}
              />
            )}
          </section>

          {notified.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-stone-900">Notified · ready to seat</h2>
              <div className="flex flex-col gap-3">
                {notified.map((party) => (
                  <PartyCard
                    key={party.id}
                    party={party}
                    availableTables={availableTables}
                    onSeat={seatParty}
                    onRemove={removeParty}
                  />
                ))}
              </div>
            </section>
          )}

          {history.length > 0 && (
            <details className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <summary className="cursor-pointer text-sm font-semibold text-stone-900">History ({history.length})</summary>
              <div className="mt-3 flex flex-col gap-3">
                {history.map((party) => (
                  <PartyCard key={party.id} party={party} availableTables={[]} />
                ))}
              </div>
            </details>
          )}
        </div>

        <div>
          <TableGrid tables={tables} parties={parties} onFreeTable={freeTable} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 text-center shadow-sm">
      <p className="text-2xl font-semibold text-stone-900">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
    </div>
  )
}
