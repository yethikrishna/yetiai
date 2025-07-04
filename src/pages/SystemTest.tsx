import { YetiSystemTest } from "@/components/YetiSystemTest";
import { YetiSystemStatus } from "@/components/YetiSystemStatus";
import { YetiDebugPanel } from "@/components/YetiDebugPanel";

export default function SystemTest() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">🧊 Yeti AI System Diagnostics</h1>
      
      <div className="grid gap-6">
        <YetiSystemStatus />
        <YetiDebugPanel />
        <YetiSystemTest />
      </div>
    </div>
  );
}