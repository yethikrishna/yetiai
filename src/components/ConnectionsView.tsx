
import { useState } from "react";
import { usePlatforms } from "@/hooks/usePlatforms";
import { PlatformGrid } from "./PlatformGrid";
import { ConnectionDialog } from "./ConnectionDialog";
import { Platform } from "@/types/platform";

export function ConnectionsView() {
  const {
    platforms,
    selectedCategory,
    setSelectedCategory,
    connectPlatform,
    disconnectPlatform
  } = usePlatforms();

  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsDialogOpen(true);
  };

  const handleConnectionComplete = async (platformId: string, credentials: Record<string, string>) => {
    return await connectPlatform(platformId, credentials);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Platform Connections</h1>
        <p className="text-gray-600 mt-2">
          Connect Yeti to your favorite platforms and unlock powerful automation capabilities.
        </p>
      </div>

      <PlatformGrid
        platforms={platforms}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onConnect={handleConnect}
        onDisconnect={disconnectPlatform}
      />

      <ConnectionDialog
        platform={selectedPlatform}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConnect={handleConnectionComplete}
      />
    </div>
  );
}
