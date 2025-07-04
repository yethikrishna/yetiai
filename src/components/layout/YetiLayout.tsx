
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface YetiLayoutProps {
  children: ReactNode;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  showBackButton?: boolean;
}

export function YetiLayout({ children, title, icon: Icon, showBackButton = true }: YetiLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4">
          {showBackButton && (
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Chat</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Icon className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm sm:text-base">{title}</h1>
              <p className="text-xs sm:text-sm text-gray-500">Yeti AI v18.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
