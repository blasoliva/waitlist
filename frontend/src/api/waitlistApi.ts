import type { JoinSource, Party, Table } from '../types'

// Single point of contact for every backend call the app makes.
// Talks to the FastAPI service in ../../../backend (contract: ../../../_docs/openapi.yaml).
// Every page/component goes through this module — never fetch() directly
// elsewhere — so the API base URL, error handling, and (de)serialization
// only need to be right in one place.

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

export interface AddPartyInput {
  name: string
  phone: string
  partySize: number
  source: JoinSource
  notes?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new Error('Could not reach the Waitlist server. Is the backend running?')
  }

  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      if (body?.detail) detail = body.detail
    } catch {
      // response body wasn't JSON — fall back to statusText
    }
    throw new Error(detail)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const waitlistApi = {
  listParties(): Promise<Party[]> {
    return request('/parties')
  },

  listTables(): Promise<Table[]> {
    return request('/tables')
  },

  addParty(input: AddPartyInput): Promise<Party> {
    return request('/parties', { method: 'POST', body: JSON.stringify(input) })
  },

  notifyParty(id: string): Promise<Party> {
    return request(`/parties/${id}/notify`, { method: 'POST' })
  },

  seatParty(id: string, tableId: string): Promise<Party> {
    return request(`/parties/${id}/seat`, { method: 'POST', body: JSON.stringify({ tableId }) })
  },

  removeParty(id: string): Promise<Party> {
    return request(`/parties/${id}/remove`, { method: 'POST' })
  },

  async freeTable(tableId: string): Promise<void> {
    await request(`/tables/${tableId}/free`, { method: 'POST' })
  },

  reorderQueue(orderedIds: string[]): Promise<Party[]> {
    return request('/parties/reorder', { method: 'POST', body: JSON.stringify({ orderedIds }) })
  },

  async estimateWait(partySize: number): Promise<number> {
    const { minutes } = await request<{ minutes: number }>(`/parties/estimate-wait?partySize=${partySize}`)
    return minutes
  },
}
