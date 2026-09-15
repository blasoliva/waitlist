import { useState, type FormEvent } from 'react'

interface AddWalkInFormProps {
  onAdd: (input: { name: string; phone: string; partySize: number; notes?: string }) => Promise<void>
}

export function AddWalkInForm({ onAdd }: AddWalkInFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || submitting) return
    setSubmitting(true)
    try {
      await onAdd({ name: name.trim(), phone: phone.trim(), partySize, notes: notes.trim() || undefined })
      setName('')
      setPhone('')
      setPartySize(2)
      setNotes('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-stone-900">Add walk-in</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="rounded border border-stone-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className="rounded border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={1}
          max={20}
          value={partySize}
          onChange={(e) => setPartySize(Number(e.target.value) || 1)}
          className="rounded border border-stone-300 px-3 py-2 text-sm"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="rounded border border-stone-300 px-3 py-2 text-sm sm:col-span-3"
        />
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="rounded bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add to queue'}
        </button>
      </div>
    </form>
  )
}
