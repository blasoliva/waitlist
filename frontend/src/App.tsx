import { Route, Routes } from 'react-router-dom'
import { ErrorBanner } from './components/ErrorBanner'
import { Nav } from './components/Nav'
import { WaitlistProvider } from './context/WaitlistContext'
import { HostDashboard } from './pages/HostDashboard'
import { Kiosk } from './pages/Kiosk'
import { Landing } from './pages/Landing'
import { RemoteJoin } from './pages/RemoteJoin'

function App() {
  return (
    <WaitlistProvider>
      <div className="min-h-screen bg-stone-100">
        <Nav />
        <ErrorBanner />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/join" element={<RemoteJoin />} />
        </Routes>
      </div>
    </WaitlistProvider>
  )
}

export default App
