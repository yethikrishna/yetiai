
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = "pk_test_Y2xlcmsueWV0aS1haS5uZXRsaWZ5LmNvbSQ";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

console.log('Initializing app with Clerk...');

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Error boundary component for Clerk issues
const ClerkErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="error-boundary">
      {children}
    </div>
  );
};

try {
  createRoot(rootElement).render(
    <ClerkErrorBoundary>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          baseTheme: undefined,
          variables: { 
            colorPrimary: '#2563eb',
            colorBackground: '#ffffff',
            colorText: '#1f2937'
          }
        }}
        afterSignOutUrl="/"
      >
        <App />
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
  console.log('App initialized successfully');
} catch (error) {
  console.error('Failed to initialize app:', error);
  
  // Fallback UI if Clerk completely fails
  createRoot(rootElement).render(
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Application Error</h2>
        <p className="text-gray-600 mb-4">
          The application failed to start. Please refresh the page.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
