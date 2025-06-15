
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = "pk_test_Y2xlcmsueWV0aS1haS5uZXRsaWZ5LmNvbSQ";

console.log('Main.tsx loading...');
console.log('Clerk key exists:', !!PUBLISHABLE_KEY);
console.log('Clerk key value:', PUBLISHABLE_KEY);

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Add error boundary for Clerk
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>Something went wrong with authentication</h2>
    <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
      Error: {error.message}
      {error.stack}
    </details>
    <button onClick={() => window.location.reload()}>Reload page</button>
  </div>
);

console.log('Creating root element...');
const rootElement = document.getElementById("root");
console.log('Root element found:', !!rootElement);

if (rootElement) {
  try {
    createRoot(rootElement).render(
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          baseTheme: undefined,
          variables: { colorPrimary: '#000' }
        }}
        afterSignOutUrl="/"
      >
        <App />
      </ClerkProvider>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    createRoot(rootElement).render(
      <ErrorFallback error={error as Error} />
    );
  }
} else {
  console.error('Root element not found');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h2>Root element not found</h2><p>The application could not start properly.</p></div>';
}
