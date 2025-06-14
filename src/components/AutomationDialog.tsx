
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, Plus, X, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlatforms } from "@/hooks/usePlatforms";

interface AutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AutomationStep {
  id: string;
  platform: string;
  action: string;
  parameters: Record<string, string>;
}

export function AutomationDialog({ open, onOpenChange }: AutomationDialogProps) {
  const { toast } = useToast();
  const { connectedPlatforms } = usePlatforms();
  const [automation, setAutomation] = useState({
    name: "",
    description: "",
    trigger: "",
    triggerPlatform: "",
    schedule: "manual",
    isActive: true
  });
  const [steps, setSteps] = useState<AutomationStep[]>([]);

  const handleSave = () => {
    if (!automation.name || !automation.trigger || steps.length === 0) {
      toast({
        title: "Incomplete automation",
        description: "Please fill in all required fields and add at least one action step.",
        variant: "destructive",
      });
      return;
    }

    // Save automation to localStorage
    const savedAutomations = JSON.parse(localStorage.getItem('yeti-automations') || '[]');
    const newAutomation = {
      id: Date.now().toString(),
      ...automation,
      steps,
      createdAt: new Date().toISOString(),
      lastRun: null,
      runCount: 0
    };

    savedAutomations.push(newAutomation);
    localStorage.setItem('yeti-automations', JSON.stringify(savedAutomations));

    toast({
      title: "Automation created",
      description: `"${automation.name}" has been created successfully.`,
    });

    // Reset form
    setAutomation({
      name: "",
      description: "",
      trigger: "",
      triggerPlatform: "",
      schedule: "manual",
      isActive: true
    });
    setSteps([]);
    onOpenChange(false);
  };

  const addStep = () => {
    const newStep: AutomationStep = {
      id: Date.now().toString(),
      platform: "",
      action: "",
      parameters: {}
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const updateStep = (stepId: string, field: string, value: string) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ));
  };

  const commonActions = [
    "Send message", "Create post", "Upload file", "Send email", 
    "Create task", "Add to calendar", "Generate report", "Sync data"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Create Automation
          </DialogTitle>
          <DialogDescription>
            Build automated workflows to connect your platforms and streamline tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="automationName">Automation Name *</Label>
                <Input
                  id="automationName"
                  value={automation.name}
                  onChange={(e) => setAutomation({...automation, name: e.target.value})}
                  placeholder="e.g., Tweet to Slack notification"
                />
              </div>
              <div>
                <Label htmlFor="schedule">Schedule</Label>
                <Select value={automation.schedule} onValueChange={(value) => setAutomation({...automation, schedule: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual trigger</SelectItem>
                    <SelectItem value="hourly">Every hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="realtime">Real-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={automation.description}
                onChange={(e) => setAutomation({...automation, description: e.target.value})}
                placeholder="Describe what this automation does..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Trigger Setup */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Trigger</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="triggerPlatform">Trigger Platform *</Label>
                <Select value={automation.triggerPlatform} onValueChange={(value) => setAutomation({...automation, triggerPlatform: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {connectedPlatforms.map(platform => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trigger">Trigger Event *</Label>
                <Input
                  id="trigger"
                  value={automation.trigger}
                  onChange={(e) => setAutomation({...automation, trigger: e.target.value})}
                  placeholder="e.g., New message received, File uploaded"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Action Steps</h3>
              <Button onClick={addStep} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Step
              </Button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg">
                <Zap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No action steps yet. Add your first step to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="p-4 border border-slate-200 rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Step {index + 1}</Badge>
                        {index > 0 && <ArrowRight className="w-4 h-4 text-slate-400" />}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Platform</Label>
                        <Select value={step.platform} onValueChange={(value) => updateStep(step.id, 'platform', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {connectedPlatforms.map(platform => (
                              <SelectItem key={platform.id} value={platform.id}>
                                {platform.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Action</Label>
                        <Select value={step.action} onValueChange={(value) => updateStep(step.id, 'action', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            {commonActions.map(action => (
                              <SelectItem key={action} value={action}>
                                {action}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>Automation will be saved as {automation.schedule}</span>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Create Automation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
