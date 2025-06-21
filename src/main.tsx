
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

// Get the publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Enhanced logging for API key diagnostics
console.log('Clerk Publishable Key Status:', {
  keyPresent: !!PUBLISHABLE_KEY,
  keyLength: PUBLISHABLE_KEY?.length || 0,
  envVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
  finalKeyUsed: PUBLISHABLE_KEY ? `${PUBLISHABLE_KEY.substring(0, 5)}...` : 'missing'
});

// Improved error handling for Clerk API key
if (!PUBLISHABLE_KEY) {
  const errorMsg = "Critical Error: Missing Clerk Publishable Key. Please check your .env file and ensure VITE_CLERK_PUBLISHABLE_KEY is properly set. The application cannot function without authentication.";
  console.error(errorMsg);
  console.error("Environment loading status:", {
    mode: import.meta.env.MODE,
    base: import.meta.env.BASE_URL,
    availableEnvVars: Object.keys(import.meta.env).length
  });
  
  // Display error visually on the page as well
  document.body.innerHTML = `<div style="color:red;padding:20px;font-family:sans-serif;text-align:center;max-width:800px;margin:100px auto;">
    <h1>Configuration Error</h1>
    <p>${errorMsg}</p>
    <p>This error typically occurs when:</p>
    <ul style="text-align:left;display:inline-block;">
      <li>The .env file is missing or not loaded properly</li>
      <li>The environment variable name is incorrect</li>
      <li>The build process isn't properly accessing environment variables</li>
    </ul>
    <p>Please check the browser console for detailed debugging information.</p>
    <p><strong>To fix this:</strong> Create a .env file in your project root and add your Clerk publishable key.</p>
  </div>`;
  throw new Error(errorMsg);
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
      // Latest Clerk features
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
