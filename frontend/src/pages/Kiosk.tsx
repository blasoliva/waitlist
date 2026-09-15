import { useState } from 'react'
import { JoinForm } from '../components/JoinForm'
import { StatusBadge } from '../components/Badges'
import { useWaitlist } from '../context/WaitlistContext'
import { formatMinutes } from '../utils/time'

export function Kiosk() {
  const { parties, addParty } = useWaitlist()
  const [joinedId, setJoinedId] = useState<string | null>(null)

  const joinedParty = joinedId ? parties.find((p) => p.id === joinedId) : undefined

  async function handleSubmit(input: { name: string; phone: string; partySize: number; notes?: string }) {
    const party = await addParty({ ...input, source: 'kiosk' })
    setJoinedId(party.id)
  }

  if (joinedParty) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-5xl">🎉</span>
        <h1 className="text-3xl font-semibold text-stone-900">You're on the list, {joinedParty.name}!</h1>
        <p className="text-lg text-stone-600">
          Party of {joinedParty.partySize} · Estimated wait: {formatMinutes(joinedParty.quotedWaitMinutes)}
        </p>
        <StatusBadge status={joinedParty.status} />
        <p className="max-w-sm text-sm text-stone-500">We'll text {joinedParty.phone} when your table is ready. Please stay nearby.</p>
        <button
          type="button"
          onClick={() => setJoinedId(null)}
          className="mt-4 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
        >
          Check in another party
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-stone-900">Welcome — check in here</h1>
        <p className="mt-1 text-stone-500">Enter your info and we'll text you when your table is ready.</p>
      </div>
      <JoinForm submitLabel="Join the waitlist" onSubmit={handleSubmit} />
    </div>
  )
}
