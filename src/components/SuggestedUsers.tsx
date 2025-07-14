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
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-card-foreground">
          <Users className="h-5 w-5 mr-2 text-primary" />
          Sugestões para você
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-3 flex-1 cursor-pointer hover:bg-secondary/50 p-2 rounded-lg transition-colors"
                onClick={() => onUserClick(user)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.displayName} />
                  <AvatarFallback>{user.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground truncate">{user.displayName}</span>
                    {user.verified && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                    <Badge variant="outline" className={`text-xs ${getLevelColor(user.level)}`}>
                      Lv. {user.level}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.followers} seguidores
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
                className="ml-2"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <Button variant="ghost" className="w-full mt-4 text-primary">
          Ver mais sugestões
        </Button>
      </CardContent>
    </Card>
  );
};

export default SuggestedUsers;