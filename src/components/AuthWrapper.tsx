
import { SignedIn, SignedOut, SignInButton, UserButton, useClerk } from '@clerk/clerk-react';
import { ReactNode, useEffect, useState } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  console.log('AuthWrapper loading...');
  const clerk = useClerk();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const checkClerkStatus = async () => {
      try {
        console.log('Checking Clerk status...');
        console.log('Clerk loaded:', clerk.loaded);
        
        if (clerk.loaded) {
          setIsLoading(false);
          console.log('Clerk is ready');
        } else {
          // Wait for clerk to load
          setTimeout(() => {
            if (!clerk.loaded) {
              console.error('Clerk failed to load after timeout');
              setHasError(true);
            }
            setIsLoading(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Error checking Clerk status:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    checkClerkStatus();
  }, [clerk.loaded]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-4">
            There was a problem loading the authentication system.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Reload Page
          </button>
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
