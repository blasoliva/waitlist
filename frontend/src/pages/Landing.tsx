import { Link } from 'react-router-dom'

const options = [
  {
    to: '/host',
    title: 'Host dashboard',
    description: 'Manage the live queue, assign tables, and track wait times.',
  },
  {
    to: '/kiosk',
    title: 'Kiosk check-in',
    description: 'Simulate a customer checking themselves in at the host stand.',
  },
  {
    to: '/join',
    title: 'Remote join',
    description: 'Simulate a customer joining the waitlist from their phone.',
  },
]

export function Landing() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center gap-8 px-4 text-center">
      <div>
        <h1 className="text-4xl font-semibold text-stone-900">Waitlist</h1>
        <p className="mt-2 text-stone-500">Restaurant waitlist management — frontend prototype</p>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {options.map((option) => (
          <Link
            key={option.to}
            to={option.to}
            className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-5 text-left shadow-sm transition hover:border-stone-400 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-stone-900">{option.title}</h2>
            <p className="text-sm text-stone-500">{option.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
