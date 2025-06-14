
import { Clock } from "lucide-react";

interface ComingSoonSectionProps {
  platformName: string;
}

export function ComingSoonSection({ platformName }: ComingSoonSectionProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="font-medium text-amber-800">Coming Soon</span>
        </div>
        <p className="text-sm text-amber-700">
          {platformName} integration is currently being developed and will be available in a future release. 
          We're working on bringing you the best possible connection experience.
        </p>
      </div>
    </div>
  );
}
