import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { UserPlus, CheckCircle2, Users } from "lucide-react";
import { UserProfileData } from "./UserProfile";
import AvatarSVG from "@/components/AvatarSVG";

interface SuggestedUsersProps {
  users: UserProfileData[];
  onFollow: (userId: string) => void;
  onUserClick: (user: UserProfileData) => void;
}

const SuggestedUsers = ({ users, onFollow, onUserClick }: SuggestedUsersProps) => {
  const navigate = useNavigate();
  
  const getLevelColor = (level: number) => {
    if (level >= 8) return "text-yellow-500";
    if (level >= 6) return "text-purple-500";
    if (level >= 4) return "text-blue-500";
    return "text-green-500";
  };

  // Validação de segurança para o array de usuários
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        Nenhuma sugestão disponível no momento
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users
        .filter(user => user && user.id && user.displayName) // Filtrar usuários inválidos
        .map((user) => (
        <div key={user.id} className="flex items-center justify-between hover:bg-secondary/50 p-3 rounded-lg transition-colors">
          <div 
            className="flex items-center space-x-3 flex-1 cursor-pointer"
            onClick={() => {
              onUserClick(user);
              navigate(`/profile/${user.username || 'usuario'}`);
            }}
          >
            <div className="h-10 w-10 rounded-full overflow-hidden bg-background hover-scale animate-fade-in">
              <AvatarSVG type={user.avatar || 'default'} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-foreground truncate text-sm">{user.displayName || 'Usuário'}</span>
                {user.verified && (
                  <CheckCircle2 className="h-3 w-3 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">@{user.username || 'usuario'}</div>
              <div className="text-xs text-muted-foreground">
                {(user.followers || 0).toLocaleString()} seguidores
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