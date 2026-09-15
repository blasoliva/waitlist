import { useState } from 'react'
import type { Party, Table } from '../types'
import { formatMinutes, minutesSince } from '../utils/time'
import { SourceBadge, StatusBadge } from './Badges'

interface PartyCardProps {
  party: Party
  availableTables: Table[]
  onNotify?: (id: string) => void
  onSeat?: (id: string, tableId: string) => void
  onRemove?: (id: string) => void
  dragHandleProps?: Record<string, unknown>
  isDragging?: boolean
}

export function PartyCard({ party, availableTables, onNotify, onSeat, onRemove, dragHandleProps, isDragging }: PartyCardProps) {
  const [picking, setPicking] = useState(false)
  const [selectedTable, setSelectedTable] = useState('')

  function handleConfirmSeat() {
    if (!selectedTable || !onSeat) return
    onSeat(party.id, selectedTable)
    setPicking(false)
    setSelectedTable('')
  }

  return (
    <div
      className={`rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-stone-300' : ''}`}
    >
      <div className="flex items-start gap-3">
        {dragHandleProps && (
          <button
            type="button"
            {...dragHandleProps}
            className="mt-1 shrink-0 cursor-grab touch-none rounded px-1 py-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            ⠿
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-stone-900">{party.name}</h3>
            <StatusBadge status={party.status} />
            <SourceBadge source={party.source} />
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Party of {party.partySize} · {party.phone} · waiting {formatMinutes(minutesSince(party.createdAt))}
          </p>
          <p className="mt-0.5 text-sm text-stone-500">Quoted wait: {formatMinutes(party.quotedWaitMinutes)}</p>
          {party.notes && <p className="mt-1 text-sm italic text-stone-400">"{party.notes}"</p>}

          {picking && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-stone-50 p-2">
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="rounded border border-stone-300 bg-white px-2 py-1 text-sm"
              >
                <option value="">Select table…</option>
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.label} (seats {table.capacity})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleConfirmSeat}
                disabled={!selectedTable}
                className="rounded bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setPicking(false)}
                className="rounded px-3 py-1 text-sm font-medium text-stone-500 hover:bg-stone-200"
              >
                Cancel
              </button>
            </div>
          )}

          {!picking && (party.status === 'waiting' || party.status === 'notified') && (
            <div className="mt-3 flex flex-wrap gap-2">
              {party.status === 'waiting' && onNotify && (
                <button
                  type="button"
                  onClick={() => onNotify(party.id)}
                  className="rounded bg-sky-600 px-3 py-1 text-sm font-medium text-white hover:bg-sky-700"
                >
                  Notify
                </button>
              )}
              {onSeat && (
                <button
                  type="button"
                  onClick={() => setPicking(true)}
                  disabled={availableTables.length === 0}
                  className="rounded bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Seat
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(party.id)}
                  className="rounded px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
