
import { Platform } from "@/types/platform";

interface ChatHeaderProps {
  connectedPlatforms: Platform[];
}

export function ChatHeader({ connectedPlatforms }: ChatHeaderProps) {
  return (
    <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
          🧊
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Yeti AI Assistant</h2>
          <p className="text-sm text-slate-600">
            {connectedPlatforms.length > 0 
              ? `Connected to ${connectedPlatforms.length} platform${connectedPlatforms.length === 1 ? '' : 's'}`
              : 'Ready to help you connect and automate'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
