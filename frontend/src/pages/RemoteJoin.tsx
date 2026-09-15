import { useMemo, useState } from 'react'
import { JoinForm } from '../components/JoinForm'
import { StatusBadge } from '../components/Badges'
import { useWaitlist } from '../context/WaitlistContext'
import { formatMinutes } from '../utils/time'

export function RemoteJoin() {
  const { parties, addParty } = useWaitlist()
  const [joinedId, setJoinedId] = useState<string | null>(null)

  const joinedParty = joinedId ? parties.find((p) => p.id === joinedId) : undefined

  const waiting = useMemo(
    () => parties.filter((p) => p.status === 'waiting').sort((a, b) => a.position - b.position),
    [parties],
  )
  const positionInLine = joinedParty ? waiting.findIndex((p) => p.id === joinedParty.id) + 1 : 0

  async function handleSubmit(input: { name: string; phone: string; partySize: number; notes?: string }) {
    const party = await addParty({ ...input, source: 'remote' })
    setJoinedId(party.id)
  }

  if (joinedParty) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold text-stone-900">You're in line, {joinedParty.name}</h1>
        <StatusBadge status={joinedParty.status} />
        {joinedParty.status === 'waiting' && positionInLine > 0 && (
          <p className="text-stone-600">
            You're <span className="font-semibold">#{positionInLine}</span> in line
          </p>
        )}
        {joinedParty.status === 'notified' && (
          <p className="font-medium text-sky-700">Your table is ready — please head to the host stand.</p>
        )}
        {joinedParty.status === 'seated' && <p className="font-medium text-emerald-700">Enjoy your meal!</p>}
        <p className="text-stone-500">Estimated wait when you joined: {formatMinutes(joinedParty.quotedWaitMinutes)}</p>
        <p className="text-sm text-stone-400">This page updates automatically — no need to refresh.</p>
        <button
          type="button"
          onClick={() => setJoinedId(null)}
          className="mt-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
        >
          Join another party
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-stone-900">Join the waitlist remotely</h1>
        <p className="mt-1 text-stone-500">Get in line before you arrive at the restaurant.</p>
      </div>
      <JoinForm submitLabel="Join remotely" onSubmit={handleSubmit} />
    </div>
  )
}
