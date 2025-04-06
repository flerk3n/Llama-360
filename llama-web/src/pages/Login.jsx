import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../auth/firebaseConfig'

function Login() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Ensure we're requesting proper scopes for Google profile
      provider.setCustomParameters({
        prompt: 'select_account',
        access_type: 'offline'
      })
      
      const result = await signInWithPopup(auth, provider)
      console.log("Sign-in successful", result)
      console.log("User profile photo:", result.user.photoURL)
      
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setError('Failed to sign in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img 
              src="/images/logohome.png" 
              alt="Llama 360 Logo" 
              className="h-32 w-32 object-contain filter drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-poppins font-bold text-white">Welcome to Llama 360</h1>
          <p className="mt-2 text-gray-300">Sign in to continue</p>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-900/50 p-4 backdrop-blur-sm">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="glass-hover mt-6 flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm"
        >
          {loading ? (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : (
            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
          )}
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

export default Login
