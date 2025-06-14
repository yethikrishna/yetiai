
import { useState } from "react";
import { Platform, PlatformCategory } from "@/types/platform";
import { PlatformCard } from "./PlatformCard";
import { ConnectionDialog } from "./ConnectionDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { platformCategories } from "@/data/platforms";

interface PlatformGridProps {
  platforms: Platform[];
  selectedCategory: PlatformCategory | 'all';
  onCategoryChange: (category: PlatformCategory | 'all') => void;
  onConnect: (platformId: string, credentials: Record<string, string>) => Promise<boolean>;
  onDisconnect: (platformId: string) => void;
}

export function PlatformGrid({ 
  platforms, 
  selectedCategory, 
  onCategoryChange, 
  onConnect, 
  onDisconnect 
}: PlatformGridProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConnect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setDialogOpen(true);
  };

  const handleDialogConnect = async (platformId: string, credentials: Record<string, string>) => {
    return await onConnect(platformId, credentials);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange('all')}
        >
          All Platforms
          <Badge variant="secondary" className="ml-2">
            {platforms.length}
          </Badge>
        </Button>
        {platformCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category.id as PlatformCategory)}
          >
            {category.name}
            <Badge variant="secondary" className="ml-2">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            onConnect={() => handleConnect(platform)}
            onDisconnect={() => onDisconnect(platform.id)}
          />
        ))}
      </div>

      {/* Connection Dialog */}
      <ConnectionDialog
        platform={selectedPlatform}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConnect={handleDialogConnect}
      />
    </div>
  );
}
