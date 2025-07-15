import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [isAdmin] = useState(true);
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<TwitterPostData[]>([]);
  const [activeTab, setActiveTab] = useState("posts");

  // Dados mockados - em produção viriam de uma API
  const mockUsers: UserProfileData[] = [
    {
      id: "maria",
      username: "mariasantos",
      displayName: "Maria Santos",
      bio: "Especialista em trading de alta frequência 📈 | Educadora financeira | Mentora de traders iniciantes",
      avatar: "/avatars/maria.jpg",
      verified: true,
      followers: 2847,
      following: 156,
      posts: 289,
      joinDate: "janeiro de 2024",
      location: "Rio de Janeiro, Brasil",
      website: "https://mariasantos-trader.com",
      isFollowing: false,
      isBlocked: false,
      earnings: 24.50,
      level: 8,
      badge: "Pro Trader"
    },
    {
      id: "carlos",
      username: "carlosoliveira",
      displayName: "Carlos Oliveira",
      bio: "Analista técnico e educador financeiro 🚀 | 10+ anos no mercado | Criador do curso TradePro",
      avatar: "/avatars/carlos.jpg",
      verified: true,
      followers: 5672,
      following: 234,
      posts: 456,
      joinDate: "dezembro de 2023",
      location: "Belo Horizonte, Brasil",
      website: "https://carlosanalise.com",
      isFollowing: true,
      isBlocked: false,
      earnings: 21.80,
      level: 7,
      badge: "Analista Expert"
    },
    {
      id: "ana",
      username: "anacosta",
      displayName: "Ana Costa",
      bio: "Jovem trader em ascensão 🚀 | DeFi enthusiast | Criptomoedas e NFTs",
      avatar: "/avatars/ana.jpg",
      verified: false,
      followers: 1234,
      following: 89,
      posts: 167,
      joinDate: "abril de 2024",
      location: "Porto Alegre, Brasil",
      isFollowing: false,
      isBlocked: false,
      earnings: 18.90,
      level: 6,
      badge: "Rising Star"
    }
  ];

  const mockPosts: TwitterPostData[] = [
    {
      id: "p1",
      author: mockUsers[0],
      content: "Análise do BTC/USDT: Rompimento da resistência em $45.2k! 📈 Próximo alvo: $48k. Stop em $44k. #Bitcoin #TradingTips",
      timestamp: "2h",
      likes: 156,
      retweets: 45,
      replies: 28,
      shares: 12,
      liked: false,
      retweeted: false,
      hashtags: ["Bitcoin", "TradingTips"]
    },
    {
      id: "p2",
      author: mockUsers[0],
      content: "Pessoal, acabei de publicar um novo tutorial sobre análise de candlesticks! Link na bio. Quem quiser, postem suas dúvidas nos comentários 👇",
      timestamp: "1d",
      likes: 234,
      retweets: 67,
      replies: 45,
      shares: 23,
      liked: true,
      retweeted: false
    },
    {
      id: "p3",
      author: mockUsers[0],
      content: "Lembrete importante: NUNCA invistam mais do que podem perder! Risk management é a base de tudo no trading. 💡",
      timestamp: "2d",
      likes: 89,
      retweets: 34,
      replies: 15,
      shares: 8,
      liked: false,
      retweeted: false
    }
  ];

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
                    post={post}
                    onLike={handleLike}
                    onRetweet={handleRetweet}
                    onReply={handleReply}
                    onUserClick={handleUserClick}
                    currentUserId="current"
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma mídia ainda</p>
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