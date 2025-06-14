
import { PlatformGrid } from "./PlatformGrid";
import { usePlatforms } from "@/hooks/usePlatforms";

export function ConnectionsView() {
  const {
    platforms,
    selectedCategory,
    setSelectedCategory,
    connectPlatform,
    disconnectPlatform
  } = usePlatforms();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Platform Connections</h1>
        <p className="text-slate-600 mt-2">
          Connect your favorite apps and services to unlock powerful automation capabilities.
        </p>
      </div>

      <PlatformGrid
        platforms={platforms}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onConnect={connectPlatform}
        onDisconnect={disconnectPlatform}
      />
    </div>
  );
}
