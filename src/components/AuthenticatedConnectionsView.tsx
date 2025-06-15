
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { ConnectionsView } from './ConnectionsView';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function AuthenticatedConnectionsView() {
  return (
    <>
      <SignedIn>
        <ConnectionsView />
      </SignedIn>
      <SignedOut>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Platform Connections</h1>
            <p className="text-slate-600 mt-2">
              Connect your favorite apps and services to unlock powerful automation capabilities.
            </p>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please sign in to manage your platform connections. Your connections will be securely stored and synced across all your devices.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-50 pointer-events-none">
            {/* Show preview of platforms but disabled */}
            <div className="bg-white rounded-lg border p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4"></div>
              <h3 className="font-semibold text-gray-900 mb-2">GitHub</h3>
              <p className="text-sm text-gray-600 mb-4">Connect your GitHub repositories</p>
              <button disabled className="w-full bg-gray-200 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed">
                Sign in to Connect
              </button>
            </div>
            <div className="bg-white rounded-lg border p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4"></div>
              <h3 className="font-semibold text-gray-900 mb-2">Gmail</h3>
              <p className="text-sm text-gray-600 mb-4">Access your Gmail account</p>
              <button disabled className="w-full bg-gray-200 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed">
                Sign in to Connect
              </button>
            </div>
            <div className="bg-white rounded-lg border p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4"></div>
              <h3 className="font-semibold text-gray-900 mb-2">More Platforms</h3>
              <p className="text-sm text-gray-600 mb-4">Connect to dozens of platforms</p>
              <button disabled className="w-full bg-gray-200 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed">
                Sign in to Connect
              </button>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
