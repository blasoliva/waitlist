import type { JoinSource, Party, PartyStatus, Table } from '../types'

// In-memory "database" for the mocked backend. Persists to localStorage so a
// page refresh doesn't lose state, and broadcasts changes across browser tabs
// via BroadcastChannel so e.g. a kiosk tab and a host dashboard tab stay in
// sync, the way a real client-server setup would.

const STORAGE_KEY = 'waitlist:v1'
const CHANNEL_NAME = 'waitlist-sync'

interface StoreShape {
  parties: Party[]
  tables: Table[]
}

function seed(): StoreShape {
  const now = Date.now()
  const tables: Table[] = [
    { id: 't1', label: 'T1', capacity: 2, status: 'available' },
    { id: 't2', label: 'T2', capacity: 2, status: 'occupied', partyId: 'seed-occupied' },
    { id: 't3', label: 'T3', capacity: 4, status: 'available' },
    { id: 't4', label: 'T4', capacity: 4, status: 'available' },
    { id: 't5', label: 'T5', capacity: 6, status: 'occupied', partyId: 'seed-occupied' },
    { id: 't6', label: 'T6', capacity: 8, status: 'available' },
  ]
  const parties: Party[] = [
    {
      id: 'p1',
      name: 'Garcia',
      phone: '555-0101',
      partySize: 2,
      status: 'waiting',
      source: 'host',
      createdAt: new Date(now - 12 * 60_000).toISOString(),
      quotedWaitMinutes: 15,
      position: 0,
    },
    {
      id: 'p2',
      name: 'Chen',
      phone: '555-0102',
      partySize: 4,
      status: 'waiting',
      source: 'remote',
      createdAt: new Date(now - 8 * 60_000).toISOString(),
      quotedWaitMinutes: 25,
      position: 1,
    },
    {
      id: 'p3',
      name: 'Patel',
      phone: '555-0103',
      partySize: 3,
      status: 'notified',
      source: 'kiosk',
      createdAt: new Date(now - 20 * 60_000).toISOString(),
      quotedWaitMinutes: 10,
      position: 2,
    },
  ]
  return { parties, tables }
}

function load(): StoreShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as StoreShape
  } catch {
    // corrupt storage, fall through to reseed
  }
  const initial = seed()
  save(initial)
  return initial
}

function save(next: StoreShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable (e.g. private mode quota) — state stays in-memory only
  }
}

let state: StoreShape = typeof window !== 'undefined' ? load() : seed()

const listeners = new Set<() => void>()
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null

channel?.addEventListener('message', (event) => {
  if (event.data === 'sync') {
    state = load()
    listeners.forEach((listener) => listener())
  }
})

function commit() {
  save(state)
  listeners.forEach((listener) => listener())
  channel?.postMessage('sync')
}

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function estimateWaitMinutes(partySize: number, waitingAhead: number): number {
  const base = partySize <= 2 ? 10 : partySize <= 4 ? 18 : 28
  return base + waitingAhead * 6
}

export interface AddPartyInput {
  name: string
  phone: string
  partySize: number
  source: JoinSource
  notes?: string
}

export const mockStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getParties(): Party[] {
    return [...state.parties]
  },

  getTables(): Table[] {
    return [...state.tables]
  },

  addParty(input: AddPartyInput): Party {
    const waitingAhead = state.parties.filter((p) => p.status === 'waiting').length
    const maxPosition = state.parties.reduce((max, p) => Math.max(max, p.position), -1)
    const party: Party = {
      id: genId('p'),
      name: input.name,
      phone: input.phone,
      partySize: input.partySize,
      status: 'waiting',
      source: input.source,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      quotedWaitMinutes: estimateWaitMinutes(input.partySize, waitingAhead),
      position: maxPosition + 1,
    }
    state = { ...state, parties: [...state.parties, party] }
    commit()
    return party
  },

  updateStatus(id: string, status: PartyStatus): Party {
    let updated: Party | undefined
    state = {
      ...state,
      parties: state.parties.map((p) => {
        if (p.id !== id) return p
        updated = { ...p, status }
        return updated
      }),
    }
    commit()
    if (!updated) throw new Error(`Party not found: ${id}`)
    return updated
  },

  seatParty(id: string, tableId: string): Party {
    let updated: Party | undefined
    state = {
      ...state,
      tables: state.tables.map((t) => (t.id === tableId ? { ...t, status: 'occupied', partyId: id } : t)),
      parties: state.parties.map((p) => {
        if (p.id !== id) return p
        updated = { ...p, status: 'seated', tableId }
        return updated
      }),
    }
    commit()
    if (!updated) throw new Error(`Party not found: ${id}`)
    return updated
  },

  freeTable(tableId: string): void {
    state = {
      ...state,
      tables: state.tables.map((t) => (t.id === tableId ? { ...t, status: 'available', partyId: undefined } : t)),
    }
    commit()
  },

  removeParty(id: string): Party {
    let updated: Party | undefined
    state = {
      ...state,
      parties: state.parties.map((p) => {
        if (p.id !== id) return p
        updated = { ...p, status: 'removed' }
        return updated
      }),
    }
    commit()
    if (!updated) throw new Error(`Party not found: ${id}`)
    return updated
  },

  reorder(orderedIds: string[]): Party[] {
    const positionById = new Map(orderedIds.map((id, index) => [id, index]))
    state = {
      ...state,
      parties: state.parties.map((p) => (positionById.has(p.id) ? { ...p, position: positionById.get(p.id)! } : p)),
    }
    commit()
    return [...state.parties]
  },
}
