
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight, Plus, GitBranch, Timer, Webhook } from "lucide-react";

interface AutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AutomationDialog({ open, onOpenChange }: AutomationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Create Automation
          </DialogTitle>
          <DialogDescription>
            Connect your platforms and automate workflows between them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4">
            <h4 className="font-medium text-sm">Quick Templates</h4>
            
            <Button variant="outline" className="justify-start h-16 px-4">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    📧
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    💬
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Email to Slack</div>
                  <div className="text-xs text-muted-foreground">Send important emails to Slack channels</div>
                </div>
                <Badge variant="secondary">Popular</Badge>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-16 px-4">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    🤖
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    📝
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">AI Content Generator</div>
                  <div className="text-xs text-muted-foreground">Generate content with AI and save to Notion</div>
                </div>
                <Badge variant="secondary">New</Badge>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-16 px-4">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    ⚡
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    📊
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">GitHub to Analytics</div>
                  <div className="text-xs text-muted-foreground">Track code commits and generate reports</div>
                </div>
              </div>
            </Button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-4">Advanced Options</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" className="justify-start h-12">
                <GitBranch className="h-4 w-4 mr-2" />
                Multi-step Workflow
              </Button>
              
              <Button variant="ghost" className="justify-start h-12">
                <Timer className="h-4 w-4 mr-2" />
                Scheduled Automation
              </Button>
              
              <Button variant="ghost" className="justify-start h-12">
                <Webhook className="h-4 w-4 mr-2" />
                Webhook Trigger
              </Button>
              
              <Button variant="ghost" className="justify-start h-12">
                <Plus className="h-4 w-4 mr-2" />
                Custom Builder
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
