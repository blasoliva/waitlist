import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { waitlistApi, type AddPartyInput } from '../api/waitlistApi'
import type { Party, Table } from '../types'

interface WaitlistContextValue {
  parties: Party[]
  tables: Table[]
  loading: boolean
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

  const refresh = useCallback(async () => {
    const [nextParties, nextTables] = await Promise.all([waitlistApi.listParties(), waitlistApi.listTables()])
    setParties(nextParties)
    setTables(nextTables)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    return waitlistApi.subscribe(() => {
      refresh()
    })
  }, [refresh])

  const addParty = useCallback(async (input: AddPartyInput) => waitlistApi.addParty(input), [])
  const notifyParty = useCallback(async (id: string) => {
    await waitlistApi.notifyParty(id)
  }, [])
  const seatParty = useCallback(async (id: string, tableId: string) => {
    await waitlistApi.seatParty(id, tableId)
  }, [])
  const removeParty = useCallback(async (id: string) => {
    await waitlistApi.removeParty(id)
  }, [])
  const freeTable = useCallback(async (tableId: string) => {
    await waitlistApi.freeTable(tableId)
  }, [])
  const reorderQueue = useCallback(async (orderedIds: string[]) => {
    await waitlistApi.reorderQueue(orderedIds)
  }, [])

  const value = useMemo(
    () => ({ parties, tables, loading, addParty, notifyParty, seatParty, removeParty, freeTable, reorderQueue }),
    [parties, tables, loading, addParty, notifyParty, seatParty, removeParty, freeTable, reorderQueue],
  )

  return <WaitlistContext.Provider value={value}>{children}</WaitlistContext.Provider>
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext)
  if (!ctx) throw new Error('useWaitlist must be used within a WaitlistProvider')
  return ctx
}
