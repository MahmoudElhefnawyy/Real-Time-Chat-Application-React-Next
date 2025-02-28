import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { mockUsers } from "@/lib/mockData";

interface AddGroupMemberDialogProps {
  groupId: number;
  onAddMember: (userId: string) => void;
}

export default function AddGroupMemberDialog({ groupId, onAddMember }: AddGroupMemberDialogProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMember = (userId: string) => {
    onAddMember(userId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Group Member</DialogTitle>
          <DialogDescription>
            Search and select a user to add to the group.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Search Users</Label>
            <Input
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => handleAddMember(user.id)}
              >
                {user.username}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}