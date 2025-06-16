
import { Platform } from "@/types/platform";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHeaderProps {
  connectedPlatforms: Platform[];
  onToggleSidebar?: () => void;
  onNewSession?: () => void;
}

export function ChatHeader({ connectedPlatforms, onToggleSidebar, onNewSession }: ChatHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {isMobile && onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm sm:text-lg font-bold">
          🧊
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-slate-900 text-sm sm:text-base truncate">Yeti AI Assistant</h2>
          <p className="text-xs sm:text-sm text-slate-600 truncate">
            {connectedPlatforms.length > 0 
              ? `Connected to ${connectedPlatforms.length} platform${connectedPlatforms.length === 1 ? '' : 's'}`
              : 'Ready to help you connect and automate'
            }
          </p>
        </div>
        {onNewSession && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNewSession}
            className="text-xs"
          >
            New Session
          </Button>
        )}
      </div>
    </div>
  );
}
