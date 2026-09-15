import type { Party, Table } from '../types'

interface TableGridProps {
  tables: Table[]
  parties: Party[]
  onFreeTable: (tableId: string) => void
}

export function TableGrid({ tables, parties, onFreeTable }: TableGridProps) {
  const partyById = new Map(parties.map((p) => [p.id, p]))

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-stone-900">Tables</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tables.map((table) => {
          const occupant = table.partyId ? partyById.get(table.partyId) : undefined
          const occupied = table.status === 'occupied'
          return (
            <div
              key={table.id}
              className={`rounded-lg border p-3 text-sm ${occupied ? 'border-stone-300 bg-stone-50' : 'border-emerald-200 bg-emerald-50'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900">{table.label}</span>
                <span className="text-xs text-stone-500">seats {table.capacity}</span>
              </div>
              <p className={`mt-1 text-xs font-medium ${occupied ? 'text-stone-500' : 'text-emerald-700'}`}>
                {occupied ? 'Occupied' : 'Available'}
              </p>
              {occupant && <p className="mt-1 truncate text-xs text-stone-400">{occupant.name}</p>}
              {occupied && (
                <button
                  type="button"
                  onClick={() => onFreeTable(table.id)}
                  className="mt-2 w-full rounded bg-white px-2 py-1 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-300 hover:bg-stone-100"
                >
                  Mark free
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
