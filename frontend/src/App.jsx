import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SimulatorPage from './pages/SimulatorPage'

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
      </Routes>
    </BrowserRouter>
  )
}