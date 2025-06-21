
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

// For now, we'll need the user to provide their Clerk publishable key directly
// In a production environment, this would come from environment variables
const PUBLISHABLE_KEY = "pk_test_placeholder"; // User will need to replace this

// Enhanced logging for debugging
console.log('Clerk Configuration:', {
  keyPresent: !!PUBLISHABLE_KEY,
  keyLength: PUBLISHABLE_KEY?.length || 0,
  keyValue: PUBLISHABLE_KEY?.substring(0, 10) + '...' || 'missing'
});

// For development purposes, we'll show a setup message instead of crashing
if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "pk_test_placeholder") {
  const setupMessage = `
    <div style="
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white; 
        padding: 40px; 
        border-radius: 12px; 
        box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
        max-width: 500px; 
        text-align: center;
      ">
        <h1 style="color: #2563eb; margin-bottom: 20px; font-size: 28px;">🔧 Setup Required</h1>
        <p style="color: #6b7280; margin-bottom: 20px; line-height: 1.6;">
          To continue, please get your Clerk Publishable Key:
        </p>
        <ol style="text-align: left; color: #374151; margin-bottom: 30px; line-height: 1.8;">
          <li>Visit <a href="https://go.clerk.com/lovable" target="_blank" style="color: #2563eb;">https://go.clerk.com/lovable</a></li>
          <li>Create a new application</li>
          <li>Copy your publishable key (starts with pk_test_)</li>
          <li>Replace the placeholder key in main.tsx</li>
        </ol>
        <div style="
          background: #f3f4f6; 
          padding: 15px; 
          border-radius: 8px; 
          font-family: monospace; 
          font-size: 14px; 
          color: #374151;
          margin-bottom: 20px;
        ">
          const PUBLISHABLE_KEY = "your_key_here";
        </div>
        <p style="color: #9ca3af; font-size: 14px;">
          Once you've updated the key, the app will automatically reload.
        </p>
      </div>
    </div>
  `;
  
  document.body.innerHTML = setupMessage;
  
  // Don't throw an error, just stop here
  console.log("Waiting for Clerk publishable key to be configured...");
} else {
  // Proceed with normal app initialization
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
}
