import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TwitterPost from "@/components/TwitterPost";
import SuggestedUsers from "@/components/SuggestedUsers";
import UserProfile, { UserProfileData } from "@/components/UserProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  TrendingUp, 
  Settings, 
  Menu, 
  MoreHorizontal, 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share, 
  Home, 
  User, 
  Bell, 
  Mail,
  Users,
  Trophy,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { communityUsers } from "@/data/communityUsers";

interface TwitterPostData {
  id: string;
  author: UserProfileData;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  shares: number;
  liked: boolean;
  retweeted: boolean;
  hashtags?: string[];
  mentions?: string[];
  replyTo?: string;
}

interface LeaderboardUser {
  name: string;
  earnings: number;
  level: number;
  change: string;
}

const Community = () => {
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [isAdmin] = useState(true); // Simular admin
  const [users] = useState<UserProfileData[]>(communityUsers);

  // Current user data - load from localStorage if exists
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUsers = JSON.parse(localStorage.getItem("alphabit_users") || "[]");
    const lastUser = savedUsers[savedUsers.length - 1];
    
    if (lastUser) {
      return {
        id: lastUser.id || "current",
        username: lastUser.username || "voce",
        displayName: lastUser.displayName || "Você", 
        bio: lastUser.bio || "Trader iniciante aprendendo sobre arbitragem de criptomoedas.",
        avatar: lastUser.avatar || "avatar1",
        verified: lastUser.verified || false,
        followers: lastUser.followers || 42,
        following: lastUser.following || 128,
        posts: lastUser.posts || 15,
        joinDate: lastUser.joinDate || "Outubro 2023",
        city: lastUser.city || "São Paulo",
        state: lastUser.state || "SP",
        location: `${lastUser.city || "São Paulo"}, ${lastUser.state || "SP"}`,
        isFollowing: false,
        isBlocked: false,
        earnings: lastUser.earnings || 1250.75,
        level: lastUser.level || 3,
        badge: lastUser.badge || "Iniciante"
      };
    }
    
    return {
      id: "current",
      username: "voce",
      displayName: "Você",
      bio: "Trader iniciante aprendendo sobre arbitragem de criptomoedas.",
      avatar: "avatar1",
      verified: false,
      followers: 42,
      following: 128,
      posts: 15,
      joinDate: "Outubro 2023",
      city: "São Paulo",
      state: "SP", 
      location: "São Paulo, SP",
      isFollowing: false,
      isBlocked: false,
      earnings: 1250.75,
      level: 3,
      badge: "Iniciante"
    };
  });

  const [posts, setPosts] = useState<TwitterPostData[]>([
    {
      id: "1",
      author: users[0],
      content: "Acabei de fechar uma operação incrível no BTC/USDT! +15.7% em 2 horas. O bot está funcionando perfeitamente hoje! 🚀 #crypto #trading",
      timestamp: "2 min atrás",
      likes: 23,
      retweets: 5,
      replies: 8,
      shares: 3,
      liked: false,
      retweeted: false,
      hashtags: ["crypto", "trading"]
    },
    {
      id: "2",
      author: users[1],
      content: "Pessoal, que acham da estratégia de diversificar em ETH e SOL? Estou vendo boas oportunidades para essa semana. @mariasantos o que acha?",
      timestamp: "15 min atrás",
      likes: 45,
      retweets: 12,
      replies: 18,
      shares: 7,
      liked: true,
      retweeted: false,
      mentions: ["mariasantos"]
    },
    {
      id: "3",
      author: users[2],
      content: "Gratidão pela comunidade! Aprendi muito com vocês. Já estou no meu 3º mês consecutivo no lucro! 📈 #grateful #crypto",
      timestamp: "1 hora atrás",
      likes: 67,
      retweets: 15,
      replies: 23,
      shares: 8,
      liked: false,
      retweeted: false,
      hashtags: ["grateful", "crypto"]
    }
  ]);
  const [leaderboard] = useState<LeaderboardUser[]>([
    { name: "Carlos Oliveira", earnings: 24.50, level: 8, change: "+1" },
    { name: "Maria Santos", earnings: 21.80, level: 7, change: "0" },
    { name: "Ana Costa", earnings: 18.90, level: 6, change: "+2" },
    { name: "João Silva", earnings: 12.45, level: 5, change: "-1" },
    { name: "Pedro Lima", earnings: 9.80, level: 4, change: "+3" }
  ]);

  const [suggestedUsers] = useState<UserProfileData[]>([
    {
      id: "pedro",
      username: "pedrolima",
      displayName: "Pedro Lima",
      bio: "DeFi enthusiast",
      avatar: "/avatars/pedro.jpg",
      verified: false,
      followers: 89,
      following: 234,
      posts: 45,
      joinDate: "maio de 2024",
      isFollowing: false,
      isBlocked: false,
      earnings: 9.80,
      level: 4,
      badge: "Iniciante"
    },
    {
      id: "lucas",
      username: "lucasferreira",
      displayName: "Lucas Ferreira",
      bio: "NFT collector & crypto trader",
      avatar: "/avatars/lucas.jpg",
      verified: false,
      followers: 156,
      following: 78,
      posts: 67,
      joinDate: "março de 2024",
      isFollowing: false,
      isBlocked: false,
      earnings: 15.30,
      level: 5,
      badge: "Trader"
    }
  ]);

  const [gamificationSettings, setGamificationSettings] = useState({
    postReward: 0.003,
    likeReward: 0.001,
    commentReward: 0.002,
    monthlyLimit: 50,
    spamWarning: "⚠️ AVISO: Spam será banido! Mantenha-se ativo de forma natural para ganhar recompensas."
  });

  const [monthlyEarnings, setMonthlyEarnings] = useState(8.32);
  const { toast } = useToast();

  // Carregar configurações de gamificação do admin
  useEffect(() => {
    const savedSettings = localStorage.getItem("alphabit_admin_settings");
    if (savedSettings) {
      const adminSettings = JSON.parse(savedSettings);
      setGamificationSettings({
        postReward: adminSettings.postReward || 0.003,
        likeReward: adminSettings.likeReward || 0.001,
        commentReward: adminSettings.commentReward || 0.002,
        monthlyLimit: adminSettings.monthlyLimit || 50,
        spamWarning: adminSettings.spamWarning || "⚠️ AVISO: Spam será banido! Mantenha-se ativo de forma natural para ganhar recompensas."
      });
    }
  }, []);

  const handlePost = () => {
    if (newPost.trim()) {
      // Verificar limite mensal
      if (monthlyEarnings >= gamificationSettings.monthlyLimit) {
        toast({
          title: "Limite atingido!",
          description: `Você já atingiu o limite mensal de $${gamificationSettings.monthlyLimit}`,
          variant: "destructive"
        });
        return;
      }

      const post: TwitterPostData = {
        id: Date.now().toString(),
        author: currentUser,
        content: newPost,
        timestamp: "agora",
        likes: 0,
        retweets: 0,
        replies: 0,
        shares: 0,
        liked: false,
        retweeted: false
      };
      
      setPosts([post, ...posts]);
      setNewPost("");
      
      // Gamificação: +$0.003 por post (ou valor configurado)
      const newEarnings = currentUser.earnings + gamificationSettings.postReward;
      const newMonthlyEarnings = Math.min(monthlyEarnings + gamificationSettings.postReward, gamificationSettings.monthlyLimit);
      
      setCurrentUser({ 
        ...currentUser, 
        earnings: newEarnings, 
        posts: currentUser.posts + 1
      });
      setMonthlyEarnings(newMonthlyEarnings);
      
      toast({
        title: "Post publicado!",
        description: `+$${gamificationSettings.postReward.toFixed(3)} adicionados à sua conta`,
      });
    }
  };

  const handleLike = (postId: string) => {
    // Verificar limite mensal
    if (monthlyEarnings >= gamificationSettings.monthlyLimit) {
      toast({
        title: "Limite atingido!",
        description: `Você já atingiu o limite mensal de $${gamificationSettings.monthlyLimit}`,
        variant: "destructive"
      });
      return;
    }

    setPosts(posts.map(post => {
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
    
    // Gamificação: +$0.001 por like (ou valor configurado)
    const newEarnings = currentUser.earnings + gamificationSettings.likeReward;
    const newMonthlyEarnings = Math.min(monthlyEarnings + gamificationSettings.likeReward, gamificationSettings.monthlyLimit);
    
    setCurrentUser({ 
      ...currentUser, 
      earnings: newEarnings
    });
    setMonthlyEarnings(newMonthlyEarnings);
    
    toast({
      title: "Curtida!",
      description: `+$${gamificationSettings.likeReward.toFixed(3)} adicionados à sua conta`,
    });
  };

  const handleRetweet = (postId: string) => {
    setPosts(posts.map(post => {
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
    // Adicionar reply como novo post
    const originalPost = posts.find(p => p.id === postId);
    if (originalPost) {
      const replyPost: TwitterPostData = {
        id: Date.now().toString(),
        author: currentUser,
        content: content,
        timestamp: "agora",
        likes: 0,
        retweets: 0,
        replies: 0,
        shares: 0,
        liked: false,
        retweeted: false,
        replyTo: originalPost.author.username
      };
      
      setPosts([replyPost, ...posts]);
      
      // Incrementar contador de replies no post original
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, replies: post.replies + 1 }
          : post
      ));
    }
  };

  const handleFollow = (userId: string) => {
    toast({
      title: "Seguindo!",
      description: "Você agora está seguindo este usuário",
    });
  };

  const handleUserClick = (user: UserProfileData) => {
    navigate(`/community/user/${user.username}`);
  };

  const handleUserEdit = (userId: string, data: Partial<UserProfileData>) => {
    if (userId === currentUser.id) {
      setCurrentUser({ ...currentUser, ...data });
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso",
      });
    }
  };

  const handleUserVerify = (userId: string) => {
    toast({
      title: "Usuário verificado!",
      description: "O selo de verificação foi adicionado",
    });
  };

  const handleUserBlock = (userId: string) => {
    toast({
      title: "Usuário bloqueado!",
      description: "O usuário foi bloqueado da comunidade",
      variant: "destructive"
    });
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return "text-yellow-500";
    if (level >= 6) return "text-purple-500";
    if (level >= 4) return "text-blue-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar Esquerda - Hidden on Mobile */}
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-4">
            {/* Profile Card */}
            <UserProfile
              user={currentUser}
              isOwnProfile={true}
              isAdmin={isAdmin}
              onEdit={handleUserEdit}
            />
            
            {/* Quick Actions */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-bold text-foreground mb-3">Ações Rápidas</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <TrendingUp className="h-4 w-4 mr-3" />
                  Ver Trending
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <Users className="h-4 w-4 mr-3" />
                  Encontrar Pessoas
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 max-w-2xl border-x border-border min-h-screen">
          {/* Header Sticky */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border z-10">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-xl font-bold text-foreground">Início</h1>
                <p className="text-sm text-muted-foreground lg:hidden">O que está acontecendo</p>
              </div>
              <Badge variant="outline" className="text-xs text-primary border-primary lg:hidden">
                <Users className="h-3 w-3 mr-1" />
                1.2k online
              </Badge>
            </div>
          </div>

          {/* Aviso Anti-Spam */}
          <div className="bg-warning/10 border-b border-warning/20 p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-warning block">Importante!</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {gamificationSettings.spamWarning}
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  <strong>Limite:</strong> ${monthlyEarnings.toFixed(2)}/${gamificationSettings.monthlyLimit}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Profile Summary */}
          <div className="lg:hidden border-b border-border p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{currentUser.displayName}</span>
                  {currentUser.verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                </div>
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <span>{currentUser.followers} seguidores</span>
                  <span>Level {currentUser.level}</span>
                  <span>${currentUser.earnings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Criar Post - Twitter Style */}
          <div className="border-b border-border p-4">
            <div className="flex space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="O que está acontecendo?"
                  className="min-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xl placeholder:text-muted-foreground bg-transparent"
                  maxLength={280}
                />
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    {newPost.length}/280
                  </div>
                  <Button 
                    onClick={handlePost}
                    disabled={!newPost.trim()}
                    className="bg-primary hover:bg-primary/90 rounded-full px-8 py-2 font-bold"
                  >
                    Postar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="pb-16 lg:pb-0">
            {posts.map((post, index) => (
              <div key={post.id} className="border-b border-border p-4 hover:bg-secondary/30 transition-colors cursor-pointer">
                <TwitterPost
                  post={post}
                  onLike={handleLike}
                  onRetweet={handleRetweet}
                  onReply={handleReply}
                  onUserClick={handleUserClick}
                  currentUserId={currentUser.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Direita - Hidden on Mobile */}
        <div className="hidden xl:flex xl:w-80 flex-col p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-4">
            {/* Search */}
            <div className="bg-secondary rounded-full p-3">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Buscar na Alphabit" 
                  className="bg-transparent border-0 outline-0 flex-1 text-sm placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Sugestões de Usuários */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Sugestões para você</h2>
              </div>
              <div className="p-4">
                <SuggestedUsers
                  users={suggestedUsers}
                  onFollow={handleFollow}
                  onUserClick={handleUserClick}
                />
              </div>
            </div>

            {/* Trending/Ranking */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Ranking Semanal</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((user, index) => (
                    <div key={index} className="flex items-center justify-between hover:bg-secondary/50 p-2 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-yellow-600 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Lv. {user.level} • ${user.earnings.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        user.change.startsWith('+') ? 'text-green-500' :
                        user.change.startsWith('-') ? 'text-red-500' :
                        'text-muted-foreground'
                      }`}>
                        {user.change !== '0' && user.change}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-3 text-primary">
                  Ver mais
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50">
        <div className="flex justify-around p-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-col h-auto py-2 text-muted-foreground"
            onClick={() => navigate("/community")}
          >
            <Users className="h-4 w-4 mb-1" />
            <span className="text-xs">Início</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-col h-auto py-2 text-muted-foreground"
          >
            <TrendingUp className="h-4 w-4 mb-1" />
            <span className="text-xs">Ranking</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-col h-auto py-2 text-muted-foreground"
            onClick={() => navigate("/edit-profile")}
          >
            <Trophy className="h-4 w-4 mb-1" />
            <span className="text-xs">Perfil</span>
          </Button>
        </div>
      </div>

      {/* Dialog para perfil - Mobile Friendly */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perfil</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserProfile
              user={selectedUser}
              isOwnProfile={false}
              isAdmin={isAdmin}
              onFollow={handleFollow}
              onBlock={handleUserBlock}
              onVerify={handleUserVerify}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
