
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

console.log('React versions check:', {
  reactVersion: '19.1.0',
  reactDomVersion: '19.1.0'
});

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Check if root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  console.log('Attempting to create React root...');
  const root = createRoot(rootElement);
  
  console.log('React root created successfully, rendering app...');
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
} catch (error) {
  console.error("Failed to initialize application:", error);
  console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
  
  // Fallback error display
  if (rootElement) {
    rootElement.innerHTML = `<div style="color:red;padding:20px;font-family:sans-serif;text-align:center;">
      <h1>Application Error</h1>
      <p>Failed to initialize the application. Please try refreshing the page.</p>
      <p>Error details: ${error instanceof Error ? error.message : String(error)}</p>
      <details style="margin-top:20px;text-align:left;">
        <summary>Technical Details</summary>
        <pre style="background:#f5f5f5;padding:10px;border-radius:4px;overflow:auto;">
          ${error instanceof Error ? error.stack || error.message : String(error)}
        </pre>
      </details>
    </div>`;
  }
}
