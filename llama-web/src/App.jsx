import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './auth/firebaseConfig'
import Login from './pages/Login'
import Welcome from './pages/Welcome'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log("App mounting...")
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log("Auth state changed:", currentUser ? "User logged in" : "No user")
        setUser(currentUser)
        setLoading(false)
      }, (authError) => {
        console.error("Auth error:", authError)
        setError("Authentication error: " + authError.message)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (e) {
      console.error("Error in auth setup:", e)
      setError("Error setting up authentication: " + e.message)
      setLoading(false)
    }
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-700">{error}</p>
          <p className="mt-4 text-sm text-gray-500">
            Check console for more details and make sure your Firebase config is correct.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/welcome" /> : <Login />} 
      />
      <Route 
        path="/welcome" 
        element={user ? <Welcome user={user} /> : <Navigate to="/" />} 
      />
    </Routes>
  )
}

export default App
