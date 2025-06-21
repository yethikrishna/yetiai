
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = "pk_test_ZHJpdmVuLXR1cmtleS00LmNsZXJrLmFjY291bnRzLmRldiQ";

// Enhanced logging for debugging
console.log('Clerk Configuration:', {
  keyPresent: !!PUBLISHABLE_KEY,
  keyLength: PUBLISHABLE_KEY?.length || 0,
  keyValue: PUBLISHABLE_KEY?.substring(0, 10) + '...' || 'missing'
});

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

try {
  createRoot(document.getElementById("root")!).render(
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
} catch (error) {
  console.error("Failed to initialize application:", error);
  document.body.innerHTML = `<div style="color:red;padding:20px;font-family:sans-serif;text-align:center;">
    <h1>Application Error</h1>
    <p>Failed to initialize the application. Please try refreshing the page.</p>
    <p>Error details: ${error instanceof Error ? error.message : String(error)}</p>
  </div>`;
}
