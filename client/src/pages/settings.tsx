import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [_, setLocation] = useLocation();
  const { user, settings, updateUserProfile, updateSettings } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLocation("/");
      return;
    }
  }, [user, setLocation]);

  if (!user) return null;

  const handleUpdateProfile = (updates: Partial<typeof user>) => {
    updateUserProfile(updates);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleUpdateSettings = (updates: Partial<typeof settings>) => {
    updateSettings(updates);
    toast({
      title: "Settings updated",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your profile information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                alt={user.name}
              />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={user.name}
              onChange={(e) => handleUpdateProfile({ name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status Message</Label>
            <Input
              id="status"
              value={user.status || ""}
              onChange={(e) => handleUpdateProfile({ status: e.target.value })}
              placeholder="What's on your mind?"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
          <CardDescription>
            Customize your app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about new messages
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) =>
                handleUpdateSettings({ notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sound Effects</Label>
              <p className="text-sm text-muted-foreground">
                Play sounds for new messages
              </p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) =>
                handleUpdateSettings({ soundEnabled: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') =>
                handleUpdateSettings({ theme: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={settings.language}
              onValueChange={(value) =>
                handleUpdateSettings({ language: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
