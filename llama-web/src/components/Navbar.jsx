import { signOut } from 'firebase/auth'
import { auth } from '../auth/firebaseConfig'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

function Navbar({ user }) {
  const navigate = useNavigate()
  const [userPhoto, setUserPhoto] = useState(null)
  
  useEffect(() => {
    console.log('User data:', user)
    if (user && user.photoURL) {
      console.log('User photo URL:', user.photoURL)
      // Create a new Image to test if the URL loads properly
      const img = new Image()
      img.onload = () => {
        console.log('Image loaded successfully')
        setUserPhoto(user.photoURL)
      }
      img.onerror = (e) => {
        console.error('Error loading user image:', e)
        // Fall back to default avatar
        setUserPhoto(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`)
      }
      img.src = user.photoURL
    } else {
      // Fall back to default avatar if no photoURL
      setUserPhoto(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`)
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/images/logohome.png" 
              alt="Llama 360 Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-poppins font-bold text-white">Llama 360</span>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {userPhoto ? (
                  <img 
                    src={userPhoto}
                    alt="User avatar" 
                    className="h-8 w-8 rounded-full ring-2 ring-white/20"
                    onError={(e) => {
                      console.error('Image failed to load in DOM')
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-500/50 ring-2 ring-white/20 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
                <span className="font-medium text-gray-200">{user.displayName || 'User'}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="glass-hover rounded-md bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-200 hover:bg-red-500/30 focus:outline-none"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
