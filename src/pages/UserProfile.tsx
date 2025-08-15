import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  CheckCircle2, 
  UserPlus, 
  UserCheck, 
  Calendar,
  MapPin,
  Link as LinkIcon,
  MoreHorizontal,
  Shield,
  Ban,
  MessageCircle,
  Settings
} from "lucide-react";
import TwitterPost, { TwitterPostData } from "@/components/TwitterPost";
import { UserProfileData } from "@/components/UserProfile";
import { communityUsers } from "@/data/communityUsers";

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  // Para demonstração, definindo como true - em produção usar: currentUser?.role === 'admin'
  const isAdmin = true;
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<TwitterPostData[]>([]);
  const [activeTab, setActiveTab] = useState("posts");

  // Usar os dados reais da comunidade
  const mockUsers: UserProfileData[] = communityUsers;

  const mockPosts: TwitterPostData[] = [];

  useEffect(() => {
    // Buscar dados do usuário baseado no username
    const foundUser = mockUsers.find(u => u.username === username);
    if (foundUser) {
      setUser(foundUser);
      // Filtrar posts do usuário
      setUserPosts(mockPosts.filter(post => post.author.username === username));
    }
  }, [username]);

  const handleFollow = () => {
    if (user) {
      setUser({
        ...user,
        isFollowing: !user.isFollowing,
        followers: user.isFollowing ? user.followers - 1 : user.followers + 1
      });
    }
  };

  const handleLike = (postId: string) => {
    setUserPosts(posts => posts.map(post => {
      if (post.id === postId) {
        const newLiked = !post.liked;
        return {
          ...post,
          liked: newLiked,
          likes: newLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  const handleRetweet = (postId: string) => {
    setUserPosts(posts => posts.map(post => {
      if (post.id === postId) {
        const newRetweeted = !post.retweeted;
        return {
          ...post,
          retweeted: newRetweeted,
          retweets: newRetweeted ? post.retweets + 1 : post.retweets - 1
        };
      }
      return post;
    }));
  };

  const handleReply = (postId: string, content: string) => {
    // Adicionar reply - em produção seria uma chamada de API
    console.log("Reply:", postId, content);
  };

  const handleEdit = (postId: string, newContent: string) => {
    setUserPosts(posts => posts.map(post => {
      if (post.id === postId) {
        return { ...post, content: newContent };
      }
      return post;
    }));
  };

  const handleDelete = (postId: string) => {
    setUserPosts(posts => posts.filter(post => post.id !== postId));
  };

  const handleDeleteImage = (postId: string) => {
    setUserPosts(posts => posts.map(post => {
      if (post.id === postId) {
        return { ...post, imageUrl: undefined };
      }
      return post;
    }));
  };

  const handleUserClick = (clickedUser: UserProfileData) => {
    navigate(`/community/user/${clickedUser.username}`);
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return "text-yellow-500";
    if (level >= 6) return "text-purple-500";
    if (level >= 4) return "text-blue-500";
    return "text-green-500";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Usuário não encontrado</h2>
          <Button onClick={() => navigate("/community")}>
            Voltar para Comunidade
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-border z-10">
        <div className="flex items-center p-3 sm:p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/community")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold">{user.displayName}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{user.posts} posts</p>
          </div>
          
          {isAdmin && (
            <div className="flex space-x-1">
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Ban className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="border-b border-border">
        {/* Cover Image Placeholder */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-12 sm:-mt-16">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-lg sm:text-2xl">
                {user.displayName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex space-x-2 mt-4">
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4" />
              </Button>
              
              <Button
                variant={user.isFollowing ? "outline" : "default"}
                size="sm"
                onClick={handleFollow}
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
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold">{user.displayName}</h2>
              {user.verified && (
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              )}
              <Badge variant="secondary" className={`${getLevelColor(user.level)}`}>
                {user.badge}
              </Badge>
            </div>
            
            <p className="text-muted-foreground">@{user.username}</p>
            
            {user.bio && (
              <p className="mt-3 text-sm sm:text-base">{user.bio}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Entrou em {user.joinDate}</span>
              </div>
              
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              
              {user.website && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="h-4 w-4" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {user.website.replace('https://', '').replace('http://', '')}
                  </a>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-6 mt-4 text-sm">
              <div className="flex space-x-1">
                <span className="font-bold">{user.following}</span>
                <span className="text-muted-foreground">seguindo</span>
              </div>
              <div className="flex space-x-1">
                <span className="font-bold">{user.followers.toLocaleString()}</span>
                <span className="text-muted-foreground">seguidores</span>
              </div>
              <div className="flex space-x-1">
                <span className="font-bold">${user.earnings.toFixed(2)}</span>
                <span className="text-muted-foreground">ganhos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0 border-b border-border rounded-none">
          <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Posts
          </TabsTrigger>
          <TabsTrigger value="replies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Respostas
          </TabsTrigger>
          <TabsTrigger value="media" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Mídia
          </TabsTrigger>
          <TabsTrigger value="likes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Curtidas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          <div className="pb-16 lg:pb-0">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post.id} className="border-b border-border p-3 sm:p-4">
                  <TwitterPost
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onRetweet={handleRetweet}
                    onReply={handleReply}
                    onUserClick={handleUserClick}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDeleteImage={handleDeleteImage}
                    currentUserId={currentUser?.id || "current"}
                    canEdit={post.author.id === currentUser?.id}
                    canDelete={post.author.id === currentUser?.id || isAdmin}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum post ainda</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="replies" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma resposta ainda</p>
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-0">
          <div className="pb-16 lg:pb-0">
            {userPosts.filter(post => post.imageUrl).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 sm:p-4">
                {userPosts
                  .filter(post => post.imageUrl)
                  .map((post) => (
                    <div key={post.id} className="relative aspect-square group cursor-pointer">
                      <img
                        src={post.imageUrl}
                        alt="Post media"
                        className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                          {post.likes} curtidas
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma mídia ainda</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="likes" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma curtida ainda</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfilePage;