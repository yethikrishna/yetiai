
import { useState } from "react";
import { ConnectionsView } from "./ConnectionsView";
import { PipedreamConnectView } from "./PipedreamConnectView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Zap, Grid3X3 } from "lucide-react";

export function AuthenticatedConnectionsView() {
  const [activeTab, setActiveTab] = useState("platforms");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100">
            <TabsTrigger value="platforms" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Platform Connections
            </TabsTrigger>
            <TabsTrigger value="pipedream" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Pipedream Apps
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                New
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsContent value="platforms" className="mt-0">
          <ConnectionsView />
        </TabsContent>
        
        <TabsContent value="pipedream" className="mt-0">
          <PipedreamConnectView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
