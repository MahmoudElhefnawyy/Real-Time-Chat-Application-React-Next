import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Search,
  UserCircle2,
  Users2,
  Plus,
  Menu,
  MessageSquare,
  Settings,
  LogOut
} from "lucide-react";
import { mockUsers } from "@/lib/mockData";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import AddGroupMemberDialog from "./AddGroupMemberDialog";

interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  isOnline: boolean;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  avatarUrl?: string;
  memberCount?: number;
  members: string[];
  ownerId: string;
  createdAt: string;
}

interface SidebarProps {
  onSelectUser?: (user: User) => void;
  onSelectGroup?: (group: Group) => void;
  onCreateGroup?: (name: string, description: string) => void;
  groups: Group[];
}

function UserList({ search, onSelect }: { search: string; onSelect: (userId: string) => void }) {
  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) =>
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-2 p-4">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground p-4">
            No users found
          </p>
        ) : (
          filteredUsers.map((user) => (
            <Button
              key={user.id}
              variant="ghost"
              className="w-full justify-start gap-3 h-16 hover:bg-muted/60 transition-colors"
              onClick={() => onSelect(user.id)}
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <div className="flex flex-col items-start overflow-hidden">
                <span className="font-medium truncate">{user.username}</span>
                <span className={`text-xs ${user.isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {user.isOnline ? "Active now" : "Offline"}
                </span>
              </div>
            </Button>
          ))
        )}
      </div>
    </ScrollArea>
  );
}

function GroupList({ groups, onSelect }: { groups: Group[]; onSelect: (group: Group) => void }) {
  const { updateGroup } = useAppStore();
  const { toast } = useToast();

  const handleAddMember = async (groupId: number, userId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: 'member'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add member');
      }

      const data = await response.json();

      // Update the group in the store with the latest data
      if (data.group) {
        updateGroup(groupId, data.group);

        toast({
          title: "Member added",
          description: "New member has been added to the group successfully.",
        });
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member to the group.",
        variant: "destructive"
      });
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-4 p-4">
        {groups.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground p-4">
            No groups yet
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-16 hover:bg-muted/60 transition-colors"
                onClick={() => onSelect(group)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={group.avatarUrl} alt={group.name} />
                  <AvatarFallback>{group.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="font-medium truncate">{group.name}</span>
                  {group.description && (
                    <span className="text-xs text-muted-foreground truncate">
                      {group.description}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {group.memberCount || group.members.length} members
                  </span>
                </div>
              </Button>
              <AddGroupMemberDialog
                groupId={group.id}
                onAddMember={(userId) => handleAddMember(group.id, userId)}
              />
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}

export default function Sidebar({
  onSelectUser,
  onSelectGroup,
  onCreateGroup,
  groups
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("contacts");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { user, logout } = useAppStore();

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive"
      });
      return;
    }

    if (onCreateGroup) {
      onCreateGroup(newGroupName.trim(), newGroupDescription.trim());
      setNewGroupName("");
      setNewGroupDescription("");
      setIsCreateGroupOpen(false);
    }
  };

  const handleSelect = (userId: string) => {
    const selectedUser = mockUsers.find(user => user.id === userId);
    if (selectedUser && onSelectUser) {
      onSelectUser(selectedUser);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-80 border-r bg-card">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">LiveChat</h1>
          </div>
          {!user && (
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80"
              onClick={() => setLocation("/")}
            >
              Get Started
            </Button>
          )}
        </div>
      </div>

      {/* User Profile */}
      {user ? (
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-2 items-center px-3 h-10 rounded-md bg-muted/50">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            />
          </div>
        </div>
      ) : (
        <div className="p-4 text-center border-b">
          <p className="text-muted-foreground">Sign in to start chatting</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-2 p-2">
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <UserCircle2 className="h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="flex-1">
          <UserList search={search} onSelect={handleSelect} />
        </TabsContent>

        <TabsContent value="groups" className="flex-1">
          <div className="p-2">
            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create a new group chat and invite your friends.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Group Name</Label>
                    <Input
                      placeholder="Enter group name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input
                      placeholder="Enter group description"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGroup}>Create Group</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <GroupList groups={groups} onSelect={onSelectGroup || (() => {})} />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => setLocation("/settings")}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          onClick={() => {
            logout();
            setLocation("/");
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-10">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}