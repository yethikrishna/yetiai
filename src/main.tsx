
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = "pk_test_ZHJpdmVuLXR1cmtleS00LmNsZXJrLmFjY291bnRzLmRldiQ";

console.log('Clerk Configuration:', {
  keyPresent: !!PUBLISHABLE_KEY,
  keyLength: PUBLISHABLE_KEY?.length || 0,
  keyValue: PUBLISHABLE_KEY?.substring(0, 10) + '...' || 'missing'
});

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

console.log('Creating React root...');
const root = createRoot(rootElement);

console.log('Rendering app...');
root.render(
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    afterSignOutUrl="/"
    appearance={{
      baseTheme: undefined,
      variables: {
        colorPrimary: "#2563eb"
      }
    }}
    localization={{
      signIn: {
        start: {
          title: "Sign in to Yeti",
          subtitle: "Welcome back! Please sign in to continue"
        }
      },
      signUp: {
        start: {
          title: "Create your account", 
          subtitle: "Welcome! Please fill in the details to get started"
        }
      }
    }}
    telemetry={false}
    standardBrowser={true}
  >
    <App />
  </ClerkProvider>
);

console.log('App rendered successfully');
