
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    userName: "User",
    email: "",
    notifications: true,
    autoConnect: false,
    dataRetention: 30,
    theme: "light"
  });

  const handleSave = () => {
    localStorage.setItem('yeti-settings', JSON.stringify(settings));
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultSettings = {
      userName: "User",
      email: "",
      notifications: true,
      autoConnect: false,
      dataRetention: 30,
      theme: "light"
    };
    setSettings(defaultSettings);
    toast({
      title: "Settings reset",
      description: "All settings have been restored to defaults.",
    });
  };

  const clearAllData = () => {
    localStorage.removeItem('yeti-connections');
    localStorage.removeItem('yeti-settings');
    localStorage.removeItem('yeti-chat-history');
    toast({
      title: "Data cleared",
      description: "All stored data has been removed.",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your Yeti preferences and account settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <User className="w-4 h-4" />
              Profile
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userName">Display Name</Label>
                <Input
                  id="userName"
                  value={settings.userName}
                  onChange={(e) => setSettings({...settings, userName: e.target.value})}
                  placeholder="Enter your display name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notifications Section */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-slate-600">Receive alerts for automation events</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoConnect">Auto-connect platforms</Label>
                  <p className="text-sm text-slate-600">Automatically reconnect when credentials are available</p>
                </div>
                <Switch
                  id="autoConnect"
                  checked={settings.autoConnect}
                  onCheckedChange={(checked) => setSettings({...settings, autoConnect: checked})}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Privacy & Security Section */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4" />
              Privacy & Security
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dataRetention">Data Retention (days)</Label>
                <Input
                  id="dataRetention"
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => setSettings({...settings, dataRetention: parseInt(e.target.value) || 30})}
                  min="1"
                  max="365"
                />
                <p className="text-sm text-slate-600">How long to keep automation logs and data</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-red-600">
              <Trash2 className="w-4 h-4" />
              Danger Zone
            </h3>
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <p className="text-sm text-red-700 mb-3">
                This will permanently delete all your connections, automations, and chat history.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAllData}
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
