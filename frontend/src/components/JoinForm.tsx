import { useEffect, useState, type FormEvent } from 'react'
import { waitlistApi } from '../api/waitlistApi'
import { formatMinutes } from '../utils/time'

interface JoinFormProps {
  submitLabel: string
  onSubmit: (input: { name: string; phone: string; partySize: number; notes?: string }) => Promise<void>
}

export function JoinForm({ submitLabel, onSubmit }: JoinFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    waitlistApi.estimateWait(partySize).then((minutes) => {
      if (!cancelled) setEstimatedWait(minutes)
    })
    return () => {
      cancelled = true
    }
  }, [partySize])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), phone: phone.trim(), partySize, notes: notes.trim() || undefined })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-left">
        <span className="text-sm font-medium text-stone-700">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
          className="rounded-lg border border-stone-300 px-4 py-3 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-left">
        <span className="text-sm font-medium text-stone-700">Phone</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          type="tel"
          placeholder="For a text when your table is ready"
          className="rounded-lg border border-stone-300 px-4 py-3 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-left">
        <span className="text-sm font-medium text-stone-700">Party size</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPartySize((n) => Math.max(1, n - 1))}
            className="h-11 w-11 rounded-lg border border-stone-300 text-lg font-semibold text-stone-600 hover:bg-stone-100"
            aria-label="Decrease party size"
          >
            −
          </button>
          <span className="w-10 text-center text-lg font-semibold text-stone-900">{partySize}</span>
          <button
            type="button"
            onClick={() => setPartySize((n) => Math.min(20, n + 1))}
            className="h-11 w-11 rounded-lg border border-stone-300 text-lg font-semibold text-stone-600 hover:bg-stone-100"
            aria-label="Increase party size"
          >
            +
          </button>
        </div>
      </label>
      <label className="flex flex-col gap-1 text-left">
        <span className="text-sm font-medium text-stone-700">Notes (optional)</span>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="High chair, outdoor seating, etc."
          className="rounded-lg border border-stone-300 px-4 py-3 text-base"
        />
      </label>

      {estimatedWait !== null && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
          Current estimated wait: {formatMinutes(estimatedWait)}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !name.trim() || !phone.trim()}
        className="rounded-lg bg-stone-900 px-4 py-3 text-base font-semibold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Joining…' : submitLabel}
      </button>
    </form>
  )
}
