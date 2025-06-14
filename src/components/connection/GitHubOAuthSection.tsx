
import { CheckCircle } from "lucide-react";

export function GitHubOAuthSection() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Connect with OAuth</span>
        </div>
        <p className="text-sm text-blue-700">
          You'll be redirected to GitHub to approve access. When done, Yeti will securely save your tokens using Supabase.
        </p>
      </div>
    </div>
  );
}
