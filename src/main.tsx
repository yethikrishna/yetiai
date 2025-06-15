
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

// Get the publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_ZHJpdmVuLXR1cmtleS00LmNsZXJrLmFjY291bnRzLmRldiQ";

console.log('Clerk Publishable Key:', PUBLISHABLE_KEY ? 'Key is present' : 'Key is missing');

if (!PUBLISHABLE_KEY) {
  console.error("Missing Clerk Publishable Key");
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    afterSignOutUrl="/"
  >
    <App />
  </ClerkProvider>
);
