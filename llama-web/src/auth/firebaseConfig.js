import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCD_tHdC1IpE3x6mK8mwUdqet3hJGQZvC0",
  authDomain: "llama-360.firebaseapp.com",
  projectId: "llama-360",
  storageBucket: "llama-360.appspot.com",
  messagingSenderId: "1025388571393",
  appId: "1:1025388571393:web:2d0bb5d87b3cd1c2aec900"
};

// Replace the above values with your actual Firebase credentials
// For example:
// apiKey: "AIzaSyC2abc123def456ghi789jkl",
// authDomain: "your-project-id.firebaseapp.com",
// etc.

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
