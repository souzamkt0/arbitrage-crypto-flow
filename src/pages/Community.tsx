import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  Trophy,
  Star,
  Zap,
  Users,
  TrendingUp,
  Gift,
  Crown,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  badge?: string;
}

interface User {
  id: string;
  name: string;
  points: number;
  level: number;
  posts: number;
  likes: number;
  comments: number;
  badge: string;
}

const Community = () => {
  const [newPost, setNewPost] = useState("");
  const [currentUser, setCurrentUser] = useState<User>({
    id: "1",
    name: "João Silva",
    points: 1250,
    level: 5,
    posts: 23,
    likes: 156,
    comments: 89,
    badge: "Trader Expert"
  });
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: "Maria Santos",
      avatar: "/avatars/maria.jpg",
      content: "Acabei de fechar uma operação incrível no BTC/USDT! +15.7% em 2 horas. O bot está funcionando perfeitamente hoje! 🚀",
      timestamp: "2 min atrás",
      likes: 23,
      comments: 8,
      shares: 5,
      liked: false,
      badge: "Pro Trader"
    },
    {
      id: "2",
      author: "Carlos Oliveira",
      avatar: "/avatars/carlos.jpg",
      content: "Pessoal, que acham da estratégia de diversificar em ETH e SOL? Estou vendo boas oportunidades para essa semana.",
      timestamp: "15 min atrás",
      likes: 45,
      comments: 12,
      shares: 3,
      liked: true,
      badge: "Analista"
    },
    {
      id: "3",
      author: "Ana Costa",
      avatar: "/avatars/ana.jpg",
      content: "Gratidão pela comunidade! Aprendi muito com vocês. Já estou no meu 3º mês consecutivo no lucro! 📈",
      timestamp: "1 hora atrás",
      likes: 67,
      comments: 15,
      shares: 8,
      liked: false,
      badge: "Rising Star"
    }
  ]);
  const [leaderboard, setLeaderboard] = useState([
    { name: "Carlos Oliveira", points: 2450, level: 8, change: "+1" },
    { name: "Maria Santos", points: 2180, level: 7, change: "0" },
    { name: "Ana Costa", points: 1890, level: 6, change: "+2" },
    { name: "João Silva", points: 1250, level: 5, change: "-1" },
    { name: "Pedro Lima", points: 980, level: 4, change: "+3" }
  ]);
  const { toast } = useToast();

  const handlePost = () => {
    if (newPost.trim()) {
      const post: Post = {
        id: Date.now().toString(),
        author: currentUser.name,
        avatar: "/avatars/joao.jpg",
        content: newPost,
        timestamp: "agora",
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false,
        badge: currentUser.badge
      };
      
      setPosts([post, ...posts]);
      setNewPost("");
      
      // Gamificação: +10 pontos por post
      const newPoints = currentUser.points + 10;
      setCurrentUser({ ...currentUser, points: newPoints, posts: currentUser.posts + 1 });
      
      toast({
        title: "Post publicado!",
        description: "+10 pontos de gamificação",
      });
    }
  };

  const handleLike = (postId: string) => {
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
    
    // Gamificação: +5 pontos por like
    const newPoints = currentUser.points + 5;
    setCurrentUser({ ...currentUser, points: newPoints, likes: currentUser.likes + 1 });
    
    toast({
      title: "Curtida!",
      description: "+5 pontos de gamificação",
    });
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return "text-yellow-500";
    if (level >= 6) return "text-purple-500";
    if (level >= 4) return "text-blue-500";
    return "text-green-500";
  };

  const getLevelIcon = (level: number) => {
    if (level >= 8) return Crown;
    if (level >= 6) return Trophy;
    if (level >= 4) return Star;
    return Zap;
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Comunidade</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Conecte-se com outros traders da plataforma</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-primary border-primary">
              <Users className="h-4 w-4 mr-2" />
              1,247 membros online
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Criar Post */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Compartilhar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatars/joao.jpg" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Compartilhe sua experiência, estratégias ou resultados..."
                      className="min-h-[100px] resize-none border-border"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs text-muted-foreground">
                        {newPost.length}/500 caracteres
                      </div>
                      <Button 
                        onClick={handlePost}
                        disabled={!newPost.trim()}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Publicar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="bg-card border-border">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.avatar} />
                        <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-foreground">{post.author}</span>
                          <Badge variant="secondary" className="text-xs">
                            {post.badge}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                        </div>
                        
                        <p className="text-sm text-foreground mb-3 leading-relaxed">
                          {post.content}
                        </p>
                        
                        <div className="flex items-center space-x-4 pt-2 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={`text-xs ${post.liked ? 'text-red-500' : 'text-muted-foreground'}`}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${post.liked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments}
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                            <Share2 className="h-4 w-4 mr-1" />
                            {post.shares}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Perfil do Usuário */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <Trophy className="h-5 w-5 mr-2 text-primary" />
                  Meu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatars/joao.jpg" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{currentUser.name}</div>
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const LevelIcon = getLevelIcon(currentUser.level);
                        return <LevelIcon className={`h-4 w-4 ${getLevelColor(currentUser.level)}`} />;
                      })()}
                      <span className={`text-sm font-medium ${getLevelColor(currentUser.level)}`}>
                        Level {currentUser.level}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pontos:</span>
                    <span className="font-medium text-primary">{currentUser.points.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Posts:</span>
                    <span className="font-medium">{currentUser.posts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Curtidas:</span>
                    <span className="font-medium">{currentUser.likes}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Comentários:</span>
                    <span className="font-medium">{currentUser.comments}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Progresso para Level {currentUser.level + 1}</div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-3/4"></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">750 pontos restantes</div>
                </div>
              </CardContent>
            </Card>

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
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
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
                            {(() => {
                              const LevelIcon = getLevelIcon(user.level);
                              return <LevelIcon className={`h-3 w-3 ${getLevelColor(user.level)}`} />;
                            })()}
                            <span className="text-xs text-muted-foreground">{user.points} pts</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        user.change.startsWith('+') ? 'bg-trading-green/20 text-trading-green' :
                        user.change.startsWith('-') ? 'bg-destructive/20 text-destructive' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {user.change !== '0' ? user.change : '='}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conquistas */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-card-foreground">
                  <Gift className="h-5 w-5 mr-2 text-primary" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-2 bg-trading-green/10 rounded-lg">
                    <Trophy className="h-4 w-4 text-trading-green" />
                    <div>
                      <div className="text-sm font-medium">Primeiro Post</div>
                      <div className="text-xs text-muted-foreground">+50 pontos</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-primary/10 rounded-lg">
                    <Heart className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">100 Curtidas</div>
                      <div className="text-xs text-muted-foreground">+100 pontos</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg opacity-50">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Trader do Mês</div>
                      <div className="text-xs text-muted-foreground">+500 pontos</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;