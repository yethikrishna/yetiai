
import { Platform, PlatformCategory } from "@/types/platform";
import { PlatformCard } from "./PlatformCard";
import { Badge } from "@/components/ui/badge";
import { platformCategories } from "@/data/platforms";

interface PlatformGridProps {
  platforms: Platform[];
  selectedCategory: PlatformCategory | 'all';
  onCategoryChange: (category: PlatformCategory | 'all') => void;
  onConnect: (platform: Platform) => void;
  onDisconnect: (platformId: string) => void;
}

export function PlatformGrid({ 
  platforms, 
  selectedCategory, 
  onCategoryChange, 
  onConnect, 
  onDisconnect 
}: PlatformGridProps) {
  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === 'all' ? 'default' : 'secondary'}
          className="cursor-pointer hover:bg-blue-100"
          onClick={() => onCategoryChange('all')}
        >
          All Platforms ({platforms.length})
        </Badge>
        {platformCategories.map(category => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'secondary'}
            className="cursor-pointer hover:bg-blue-100"
            onClick={() => onCategoryChange(category.id as PlatformCategory)}
          >
            {category.name} ({category.count})
          </Badge>
        ))}
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map(platform => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            onConnect={() => onConnect(platform)}
            onDisconnect={() => onDisconnect(platform.id)}
          />
        ))}
      </div>

      {platforms.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No platforms found in this category.
        </div>
      )}
    </div>
  );
}
