import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200'}`

export function Nav() {
  return (
    <nav className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
      <span className="text-sm font-semibold text-stone-900">Waitlist prototype</span>
      <div className="flex gap-2">
        <NavLink to="/host" className={linkClass}>
          Host dashboard
        </NavLink>
        <NavLink to="/kiosk" className={linkClass}>
          Kiosk check-in
        </NavLink>
        <NavLink to="/join" className={linkClass}>
          Remote join
        </NavLink>
      </div>
    </nav>
  )
}
