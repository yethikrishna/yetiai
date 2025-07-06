import { useState } from "react";
import { YetiSystemTest } from "@/components/YetiSystemTest";
import { YetiSystemStatus } from "@/components/YetiSystemStatus";
import { YetiDebugPanel } from "@/components/YetiDebugPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function SystemTest() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "ramankulam") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
      setPassword("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-3 sm:p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              System Test Access
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 text-base"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base">
                Access System Test
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left">
        🧊 Yeti AI System Diagnostics
      </h1>
      
      <div className="grid gap-4 sm:gap-6">
        <YetiSystemStatus />
        <YetiDebugPanel />
        <YetiSystemTest />
      </div>
    </div>
  );
}