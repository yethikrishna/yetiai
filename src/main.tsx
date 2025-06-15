
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = "pk_live_Y2xlcmsueWV0aS1haS5uZXRsaWZ5LmNvbSQ";

console.log('Main.tsx loading...');
console.log('Clerk key exists:', !!PUBLISHABLE_KEY);

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

console.log('Creating root element...');
const rootElement = document.getElementById("root");
console.log('Root element found:', !!rootElement);

if (rootElement) {
  createRoot(rootElement).render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  );
  console.log('App rendered successfully');
} else {
  console.error('Root element not found');
}
