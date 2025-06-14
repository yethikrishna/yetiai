
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Zap, Users, Bell, Shield } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your Yeti preferences and account settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3">
            <Button variant="ghost" className="justify-start h-12 px-4">
              <div className="flex items-center gap-3 w-full">
                <Zap className="h-4 w-4 text-blue-600" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Automations</div>
                  <div className="text-xs text-muted-foreground">Manage your workflows</div>
                </div>
                <Badge variant="secondary">3</Badge>
              </div>
            </Button>

            <Button variant="ghost" className="justify-start h-12 px-4">
              <div className="flex items-center gap-3 w-full">
                <Users className="h-4 w-4 text-green-600" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Team</div>
                  <div className="text-xs text-muted-foreground">Collaborate with others</div>
                </div>
                <Badge variant="secondary">Pro</Badge>
              </div>
            </Button>

            <Button variant="ghost" className="justify-start h-12 px-4">
              <div className="flex items-center gap-3 w-full">
                <Bell className="h-4 w-4 text-yellow-600" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Notifications</div>
                  <div className="text-xs text-muted-foreground">Email and push settings</div>
                </div>
              </div>
            </Button>

            <Button variant="ghost" className="justify-start h-12 px-4">
              <div className="flex items-center gap-3 w-full">
                <Shield className="h-4 w-4 text-red-600" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Security</div>
                  <div className="text-xs text-muted-foreground">Privacy and data settings</div>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
