
import { useState } from "react";

export function useConnectionState() {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);

  const resetCredentials = () => {
    setCredentials({});
  };

  return {
    credentials,
    setCredentials,
    isConnecting,
    setIsConnecting,
    resetCredentials,
  };
}
