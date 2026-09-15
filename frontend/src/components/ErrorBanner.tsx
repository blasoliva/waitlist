import { useWaitlist } from '../context/WaitlistContext'

export function ErrorBanner() {
  const { error } = useWaitlist()
  if (!error) return null

  return (
    <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-700">
      {error}
    </div>
  )
}
