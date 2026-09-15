export type PartyStatus = 'waiting' | 'notified' | 'seated' | 'removed'

export type JoinSource = 'host' | 'kiosk' | 'remote'

export interface Party {
  id: string
  name: string
  phone: string
  partySize: number
  status: PartyStatus
  source: JoinSource
  notes?: string
  createdAt: string
  quotedWaitMinutes: number
  tableId?: string
  position: number
}

export type TableStatus = 'available' | 'occupied'

export interface Table {
  id: string
  label: string
  capacity: number
  status: TableStatus
  partyId?: string
}
