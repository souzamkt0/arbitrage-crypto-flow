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
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Mini Header/Cover */}
      <div className="h-16 bg-gradient-to-r from-primary/20 to-accent/20"></div>
      
      <div className="p-3 -mt-8">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-16 w-16 border-4 border-background">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback>{user.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        </div>
        
        {/* User Info */}
        <div className="mt-3">
          <div className="flex items-center space-x-1">
            <h3 className="font-bold text-foreground text-sm truncate">{user.displayName}</h3>
            {user.verified && (
              <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          <p className="text-muted-foreground text-sm">@{user.username}</p>
          
          {user.bio && (
            <p className="text-sm text-foreground mt-2 line-clamp-2">{user.bio}</p>
          )}
          
          {/* Stats */}
          <div className="flex items-center space-x-4 mt-3 text-sm">
            <div className="flex space-x-1">
              <span className="font-bold text-foreground">{user.following}</span>
              <span className="text-muted-foreground">seguindo</span>
            </div>
            <div className="flex space-x-1">
              <span className="font-bold text-foreground">{user.followers}</span>
              <span className="text-muted-foreground">seguidores</span>
            </div>
          </div>
          
          {/* Edit Profile Button */}
          {isOwnProfile && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/edit-profile'}
                className="w-full rounded-full border-muted-foreground/20"
              >
                Editar perfil
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;