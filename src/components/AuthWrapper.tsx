import { SignedIn, SignedOut, SignInButton, useClerk } from '@clerk/clerk-react';
import { ReactNode, useEffect, useState } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { isLoaded, error: clerkErrorInstance } = useClerk();
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    if (clerkErrorInstance) {
      console.error("Clerk Error:", clerkErrorInstance);
      let message = `Clerk failed to initialize: ${clerkErrorInstance.message}.`;
      // Attempt to provide more specific advice based on common Clerk error types if possible
      // This requires knowledge of clerkErrorInstance structure, assuming a 'meta' or 'code' property might exist
      // For example: if (clerkErrorInstance.meta?.code === 'something_specific') { ... }
      // For now, a generic detailed message:
      message += " Please check your Clerk dashboard configuration (e.g., domain allowlist), publishable key, and your network connection. Also, ensure third-party scripts/cookies are not being aggressively blocked by your browser or extensions.";
      setInitializationError(message);
      return;
    }

    // Fallback timeout if isLoaded remains false and no specific error is caught
    const timer = setTimeout(() => {
      if (!isLoaded) {
        console.warn("Clerk loading timeout: isLoaded is still false after 15 seconds.");
        setInitializationError("Clerk is taking a long time to load. This could be due to a network issue, an ad blocker, or an incorrect domain/instance configuration in your Clerk dashboard. Please verify your setup and ensure Clerk's services are reachable.");
      }
    }, 15000); // 15 seconds timeout

    return () => clearTimeout(timer);
  }, [isLoaded, clerkErrorInstance]);

  if (initializationError) {
    return (
      <div style={{ padding: '20px', margin: '20px auto', maxWidth: '600px', border: '1px solid red', borderRadius: '8px', backgroundColor: '#fff0f0', color: '#a00', textAlign: 'center' }}>
        <h2>Authentication Initialization Error</h2>
        <p>{initializationError}</p>
        <p>Please try refreshing the page. If the problem persists, contact support or check the application's configuration.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#555' }}>
        <p>Loading authentication, please wait...</p>
        {/* You could add a spinner here */}
      </div>
    );
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #eee', margin: '20px auto', maxWidth: '400px', borderRadius: '8px' }}>
          <h2>Welcome</h2>
          <p style={{ marginBottom: '16px' }}>Please sign in to access the application.</p>
          <SignInButton mode="modal">
            {/* You can style the button further if needed or use as-is */}
            <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
};
