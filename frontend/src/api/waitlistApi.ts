import { estimateWaitMinutes, mockStore, type AddPartyInput } from './mockStore'
import type { Party, Table } from '../types'

// Single point of contact for every "backend" call the app makes.
// Every function here is mocked against the in-memory/localStorage store in
// ./mockStore and returns a Promise, so pages never know the difference.
// To wire up a real backend later, replace the bodies below with fetch()
// calls against real endpoints — the exported signatures (and therefore
// every caller) can stay the same.

const LATENCY_MS = 350

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export type { AddPartyInput }

export const waitlistApi = {
  listParties(): Promise<Party[]> {
    return delay(mockStore.getParties())
  },

  listTables(): Promise<Table[]> {
    return delay(mockStore.getTables())
  },

  addParty(input: AddPartyInput): Promise<Party> {
    return delay(mockStore.addParty(input))
  },

  notifyParty(id: string): Promise<Party> {
    return delay(mockStore.updateStatus(id, 'notified'))
  },

  seatParty(id: string, tableId: string): Promise<Party> {
    return delay(mockStore.seatParty(id, tableId))
  },

  removeParty(id: string): Promise<Party> {
    return delay(mockStore.removeParty(id))
  },

  freeTable(tableId: string): Promise<void> {
    mockStore.freeTable(tableId)
    return delay(undefined)
  },

  reorderQueue(orderedIds: string[]): Promise<Party[]> {
    return delay(mockStore.reorder(orderedIds))
  },

  estimateWait(partySize: number): Promise<number> {
    const waitingAhead = mockStore.getParties().filter((p) => p.status === 'waiting').length
    return delay(estimateWaitMinutes(partySize, waitingAhead), 150)
  },

  // Lets the UI react to changes made from other tabs/components without polling.
  subscribe(listener: () => void): () => void {
    return mockStore.subscribe(listener)
  },
}
