import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, CheckCircle2, Users } from "lucide-react";
import { UserProfileData } from "./UserProfile";

interface SuggestedUsersProps {
  users: UserProfileData[];
  onFollow: (userId: string) => void;
  onUserClick: (user: UserProfileData) => void;
}

const SuggestedUsers = ({ users, onFollow, onUserClick }: SuggestedUsersProps) => {
  const getLevelColor = (level: number) => {
    if (level >= 8) return "text-yellow-500";
    if (level >= 6) return "text-purple-500";
    if (level >= 4) return "text-blue-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between hover:bg-secondary/50 p-3 rounded-lg transition-colors">
          <div 
            className="flex items-center space-x-3 flex-1 cursor-pointer"
            onClick={() => onUserClick(user)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>{user.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-foreground truncate text-sm">{user.displayName}</span>
                {user.verified && (
                  <CheckCircle2 className="h-3 w-3 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">@{user.username}</div>
              <div className="text-xs text-muted-foreground">
                {user.followers.toLocaleString()} seguidores
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFollow(user.id);
            }}
            className="ml-2 rounded-full px-4 py-1 text-xs font-bold hover:bg-primary hover:text-primary-foreground border-muted-foreground/20"
          >
            Seguir
          </Button>
        </div>
      ))}
      
      <Button variant="ghost" className="w-full text-primary text-sm">
        Mostrar mais
      </Button>
    </div>
  );
};

export default SuggestedUsers;