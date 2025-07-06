
// Shim to redirect use-sync-external-store to React's built-in useSyncExternalStore
// This resolves compatibility issues with packages that depend on the external store shim
import { useSyncExternalStore } from 'react';

// Export all the hooks that the shim package would normally provide
export { useSyncExternalStore };

// Default export for compatibility
export default {
  useSyncExternalStore
};
