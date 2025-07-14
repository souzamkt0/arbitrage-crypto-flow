import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  UserPlus, 
  UserCheck, 
  Calendar,
  MapPin,
  Link as LinkIcon,
  MoreHorizontal,
  Shield,
  Ban
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface UserProfileData {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar: string;
  verified: boolean;
  followers: number;
  following: number;
  posts: number;
  joinDate: string;
  location?: string;
  website?: string;
  isFollowing: boolean;
  isBlocked: boolean;
  earnings: number;
  level: number;
  badge: string;
}

interface UserProfileProps {
  user: UserProfileData;
  isOwnProfile?: boolean;
  isAdmin?: boolean;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onUnblock?: (userId: string) => void;
  onVerify?: (userId: string) => void;
  onUnverify?: (userId: string) => void;
  onEdit?: (userId: string, data: Partial<UserProfileData>) => void;
}

const UserProfile = ({ 
  user, 
  isOwnProfile = false, 
  isAdmin = false,
  onFollow,
  onUnfollow,
  onBlock,
  onUnblock,
  onVerify,
  onUnverify,
  onEdit
}: UserProfileProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    displayName: user.displayName,
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || ""
  });

  const handleFollowToggle = () => {
    if (user.isFollowing) {
      onUnfollow?.(user.id);
    } else {
      onFollow?.(user.id);
    }
  };

  const handleBlockToggle = () => {
    if (user.isBlocked) {
      onUnblock?.(user.id);
    } else {
      onBlock?.(user.id);
    }
  };

  const handleVerifyToggle = () => {
    if (user.verified) {
      onUnverify?.(user.id);
    } else {
      onVerify?.(user.id);
    }
  };

  const handleSaveEdit = () => {
    onEdit?.(user.id, editData);
    setIsEditDialogOpen(false);
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return "text-yellow-500";
    if (level >= 6) return "text-purple-500";
    if (level >= 4) return "text-blue-500";
    return "text-green-500";
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>{user.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-foreground">{user.displayName}</h2>
                {user.verified && (
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                )}
                <Badge variant="secondary" className={`text-xs ${getLevelColor(user.level)}`}>
                  {user.badge}
                </Badge>
              </div>
              
              <p className="text-muted-foreground text-sm">@{user.username}</p>
              
              {user.bio && (
                <p className="text-sm text-foreground mt-2">{user.bio}</p>
              )}
              
              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Entrou em {user.joinDate}</span>
                </div>
                
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.website && (
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="h-3 w-3" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {user.website.replace('https://', '').replace('http://', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isOwnProfile && (
              <Button
                variant={user.isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollowToggle}
                className={user.isFollowing ? "hover:bg-red-50 hover:text-red-600 hover:border-red-300" : ""}
              >
                {user.isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Seguindo
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Seguir
                  </>
                )}
              </Button>
            )}
            
            {isAdmin && !isOwnProfile && (
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVerifyToggle}
                  className={user.verified ? "text-blue-600 border-blue-300" : ""}
                >
                  <Shield className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBlockToggle}
                  className={user.isBlocked ? "text-red-600 border-red-300" : ""}
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {(isOwnProfile || isAdmin) && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="displayName">Nome</Label>
                      <Input
                        id="displayName"
                        value={editData.displayName}
                        onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        value={editData.bio}
                        onChange={(e) => setEditData({...editData, bio: e.target.value})}
                        placeholder="Conte um pouco sobre você..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={editData.location}
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                        placeholder="São Paulo, Brasil"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={editData.website}
                        onChange={(e) => setEditData({...editData, website: e.target.value})}
                        placeholder="https://meusite.com"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveEdit}>
                      Salvar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex space-x-1">
            <span className="font-bold text-foreground">{user.following}</span>
            <span className="text-muted-foreground">seguindo</span>
          </div>
          <div className="flex space-x-1">
            <span className="font-bold text-foreground">{user.followers}</span>
            <span className="text-muted-foreground">seguidores</span>
          </div>
          <div className="flex space-x-1">
            <span className="font-bold text-foreground">{user.posts}</span>
            <span className="text-muted-foreground">posts</span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Ganhos:</span>
            <span className="font-medium text-primary ml-2">${user.earnings.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Level:</span>
            <span className={`font-medium ml-2 ${getLevelColor(user.level)}`}>
              {user.level}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;