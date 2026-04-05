import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SimulatorPage from './pages/SimulatorPage'
import Verified from './pages/Verified'  // ✅ 추가

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulator" element={
          <PrivateRoute>
            <SimulatorPage />
          </PrivateRoute>
        } />
        <Route path="/verified" element={<Verified />} />  {/* ✅ 추가 */}
      </Routes>
    </BrowserRouter>
  )
}