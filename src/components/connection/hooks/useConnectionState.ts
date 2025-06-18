
import { useState } from "react";
import { Platform } from "@/types/platform";

export function useConnectionState(platform: Platform | null) {
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
