import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Load environment variables using Vite's import.meta.env
// All Vite environment variables must be prefixed with VITE_
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCD_tHdC1IpE3x6mK8mwUdqet3hJGQZvC0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "llama-360.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "llama-360",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "llama-360.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1025388571393",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1025388571393:web:2d0bb5d87b3cd1c2aec900"
};

// Log warning if using fallback values
Object.entries(firebaseConfig).forEach(([key, value]) => {
  const envKey = `VITE_FIREBASE_${key.toUpperCase().replace(/([A-Z])/g, '_$1')}`;
  if (!import.meta.env[envKey] && key !== 'apiKey') {
    console.warn(`Using fallback value for ${envKey}. Consider setting up proper environment variables.`);
  }
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Add scopes to request user profile information
provider.addScope('profile');
provider.addScope('email');
provider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, provider }; 