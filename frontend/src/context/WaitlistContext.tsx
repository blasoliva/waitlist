import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { waitlistApi, type AddPartyInput } from '../api/waitlistApi'
import type { Party, Table } from '../types'

const POLL_INTERVAL_MS = 4000

interface WaitlistContextValue {
  parties: Party[]
  tables: Table[]
  loading: boolean
  error: string | null
  addParty: (input: AddPartyInput) => Promise<Party>
  notifyParty: (id: string) => Promise<void>
  seatParty: (id: string, tableId: string) => Promise<void>
  removeParty: (id: string) => Promise<void>
  freeTable: (tableId: string) => Promise<void>
  reorderQueue: (orderedIds: string[]) => Promise<void>
}

const WaitlistContext = createContext<WaitlistContextValue | null>(null)

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [parties, setParties] = useState<Party[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [nextParties, nextTables] = await Promise.all([waitlistApi.listParties(), waitlistApi.listTables()])
      setParties(nextParties)
      setTables(nextTables)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the waitlist.')
    } finally {
      setLoading(false)
    }
  }, [])

  // The backend is a plain REST API with no push channel, so poll for
  // changes made from other tabs/devices (e.g. a kiosk check-in showing up
  // on the host dashboard).
  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  const addParty = useCallback(
    async (input: AddPartyInput) => {
      const party = await waitlistApi.addParty(input)
      await refresh()
      return party
    },
    [refresh],
  )
  const notifyParty = useCallback(
    async (id: string) => {
      await waitlistApi.notifyParty(id)
      await refresh()
    },
    [refresh],
  )
  const seatParty = useCallback(
    async (id: string, tableId: string) => {
      await waitlistApi.seatParty(id, tableId)
      await refresh()
    },
    [refresh],
  )
  const removeParty = useCallback(
    async (id: string) => {
      await waitlistApi.removeParty(id)
      await refresh()
    },
    [refresh],
  )
  const freeTable = useCallback(
    async (tableId: string) => {
      await waitlistApi.freeTable(tableId)
      await refresh()
    },
    [refresh],
  )
  const reorderQueue = useCallback(
    async (orderedIds: string[]) => {
      await waitlistApi.reorderQueue(orderedIds)
      await refresh()
    },
    [refresh],
  )

  const value = useMemo(
    () => ({ parties, tables, loading, error, addParty, notifyParty, seatParty, removeParty, freeTable, reorderQueue }),
    [parties, tables, loading, error, addParty, notifyParty, seatParty, removeParty, freeTable, reorderQueue],
  )

  return <WaitlistContext.Provider value={value}>{children}</WaitlistContext.Provider>
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext)
  if (!ctx) throw new Error('useWaitlist must be used within a WaitlistProvider')
  return ctx
}
