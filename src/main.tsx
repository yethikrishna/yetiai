import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_ZHJpdmVuLXR1cmtleS00LmNsZXJrLmFjY291bnRzLmRldiQ";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key - Please set VITE_CLERK_PUBLISHABLE_KEY in your environment variables");
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
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
  </StrictMode>
);
