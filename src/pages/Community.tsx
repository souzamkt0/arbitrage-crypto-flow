import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Trophy,
  Users,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Search,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UserProfile, { UserProfileData } from "@/components/UserProfile";
import SuggestedUsers from "@/components/SuggestedUsers";
import TwitterPost, { TwitterPostData } from "@/components/TwitterPost";

interface LeaderboardUser {
  name: string;
  earnings: number;
  level: number;
  change: string;
}

const Community = () => {
  const [newPost, setNewPost] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [isAdmin] = useState(true); // Simular admin
  const [currentUser, setCurrentUser] = useState<UserProfileData>({
    id: "current",
    username: "joaosilva",
    displayName: "João Silva",
    bio: "Trader experiente focado em arbitragem de criptomoedas",
    avatar: "/avatars/joao.jpg",
    verified: false,
    followers: 156,
    following: 89,
    posts: 23,
    joinDate: "março de 2024",
    location: "São Paulo, Brasil",
    website: "https://joaotrader.com",
    isFollowing: false,
    isBlocked: false,
    earnings: 12.45,
    level: 5,
    badge: "Trader Expert"
  });
  const [allUsers] = useState<UserProfileData[]>([
    {
      id: "maria",
      username: "mariasantos",
      displayName: "Maria Santos",
      bio: "Especialista em trading de alta frequência",
      avatar: "/avatars/maria.jpg",
      verified: true,
      followers: 342,
      following: 156,
      posts: 89,
      joinDate: "janeiro de 2024",
      location: "Rio de Janeiro, Brasil",
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
      bio: "Analista técnico e educador financeiro",
      avatar: "/avatars/carlos.jpg",
      verified: true,
      followers: 567,
      following: 234,
      posts: 156,
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
      bio: "Jovem trader em ascensão 🚀",
      avatar: "/avatars/ana.jpg",
      verified: false,
      followers: 234,
      following: 89,
      posts: 67,
      joinDate: "abril de 2024",
      location: "Porto Alegre, Brasil",
      isFollowing: false,
      isBlocked: false,
      earnings: 18.90,
      level: 6,
      badge: "Rising Star"
    }
  ]);

  const [posts, setPosts] = useState<TwitterPostData[]>([
    {
      id: "1",
      author: allUsers[0],
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
      author: allUsers[1],
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
      author: allUsers[2],
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
    setSelectedUser(user);
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
      <div className="max-w-7xl mx-auto">
        {/* Header estilo Twitter */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-foreground">Início</h1>
              <Badge variant="outline" className="text-primary border-primary">
                <Users className="h-4 w-4 mr-2" />
                1,247 online
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Aviso Anti-Spam */}
        <div className="bg-warning/10 border-b border-warning/20 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span className="font-medium text-warning">Importante!</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {gamificationSettings.spamWarning}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            <strong>Limite atual:</strong> ${monthlyEarnings.toFixed(2)} de ${gamificationSettings.monthlyLimit} este mês
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Esquerda - Perfil */}
          <div className="lg:col-span-3 p-4">
            <div className="sticky top-32 space-y-4">
              <UserProfile
                user={currentUser}
                isOwnProfile={true}
                isAdmin={isAdmin}
                onEdit={handleUserEdit}
              />
            </div>
          </div>

          {/* Feed Principal */}
          <div className="lg:col-span-6 border-x border-border">
            {/* Criar Post */}
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
                    className="min-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xl placeholder:text-muted-foreground"
                    maxLength={280}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                      {newPost.length}/280
                    </div>
                    <Button 
                      onClick={handlePost}
                      disabled={!newPost.trim()}
                      className="bg-primary hover:bg-primary/90 rounded-full px-6"
                    >
                      Postar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div>
              {posts.map((post) => (
                <div key={post.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
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

          {/* Sidebar Direita - Sugestões e Ranking */}
          <div className="lg:col-span-3 p-4">
            <div className="sticky top-32 space-y-4">
              {/* Sugestões de Usuários */}
              <SuggestedUsers
                users={suggestedUsers}
                onFollow={handleFollow}
                onUserClick={handleUserClick}
              />

              {/* Ranking */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-card-foreground">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Ranking Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-yellow-600 text-white' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="flex items-center space-x-1">
                              <span className={`text-xs ${getLevelColor(user.level)}`}>
                                Lv. {user.level}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm text-primary">
                            ${user.earnings.toFixed(2)}
                          </div>
                          <div className={`text-xs ${
                            user.change.startsWith('+') ? 'text-green-500' :
                            user.change.startsWith('-') ? 'text-red-500' :
                            'text-muted-foreground'
                          }`}>
                            {user.change !== '0' && user.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Conquistas */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-card-foreground text-sm">
                    <Trophy className="h-4 w-4 mr-2 text-primary" />
                    Conquistas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 bg-yellow-500/10 rounded-lg">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="text-xs font-medium">Primeira Semana</div>
                        <div className="text-xs text-muted-foreground">Completou 7 dias</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog para perfil do usuário */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
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