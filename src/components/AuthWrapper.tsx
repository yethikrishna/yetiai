
import { SignedIn, SignedOut, SignInButton, UserButton, useClerk } from '@clerk/clerk-react';
import { ReactNode, useEffect, useState } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const clerk = useClerk();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initializeClerk = async () => {
      try {
        console.log('Initializing Clerk...');
        
        // Set a timeout to handle cases where Clerk takes too long
        timeoutId = setTimeout(() => {
          if (!clerk.loaded) {
            console.error('Clerk initialization timeout');
            setError('Authentication service is taking too long to load. Please refresh the page.');
            setIsLoading(false);
          }
        }, 10000); // 10 second timeout

        // Wait for Clerk to be ready
        if (clerk.loaded) {
          console.log('Clerk already loaded');
          clearTimeout(timeoutId);
          setIsLoading(false);
        } else {
          // Clerk will automatically load, we just need to wait
          const checkLoaded = () => {
            if (clerk.loaded) {
              console.log('Clerk loaded successfully');
              clearTimeout(timeoutId);
              setIsLoading(false);
            } else {
              // Check again in a short interval
              setTimeout(checkLoaded, 100);
            }
          };
          checkLoaded();
        }
      } catch (err) {
        console.error('Error during Clerk initialization:', err);
        clearTimeout(timeoutId);
        setError('Failed to initialize authentication. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initializeClerk();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [clerk.loaded]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Initializing authentication system</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Yeti</h1>
              <p className="text-gray-600 mb-6">Sign in to access your AI assistant and platform connections</p>
              <SignInButton mode="modal">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="absolute top-4 right-4 z-50">
          <UserButton afterSignOutUrl="/" />
        </div>
        {children}
      </SignedIn>
    </>
  );
};
