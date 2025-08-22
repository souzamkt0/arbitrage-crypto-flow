import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  Settings,
  Camera,
  Upload,
  Edit,
  Check,
  X,
  RotateCcw
} from "lucide-react";
import TwitterPost from "@/components/TwitterPost";
import { UserProfileData } from "@/components/UserProfile";

// Interface local para TwitterPost
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
  imageUrl?: string;
}

import ProfileImageUpload from "@/components/ProfileImageUpload";

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  // Para demonstração, definindo como true - em produção usar: currentUser?.role === 'admin'
  const isAdmin = true;
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<TwitterPostData[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [deletedPosts, setDeletedPosts] = useState<string[]>([]);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");

  // Mock data local
  const mockUsers: UserProfileData[] = [
    {
      id: "user-1",
      username: "cryptomaster",
      displayName: "Crypto Master",
      bio: "Especialista em trading de criptomoedas e arbitragem",
      avatar: "avatar1",
      verified: true,
      followers: 1520,
      following: 340,
      posts: 89,
      joinDate: "Janeiro 2023",
      city: "São Paulo",
      state: "SP",
      location: "São Paulo, SP",
      isFollowing: false,
      isBlocked: false,
      earnings: 3200.50,
      level: 8,
      badge: "Master"
    }
  ];

  const mockPosts: TwitterPostData[] = [
    {
      id: "post-crypto-1",
      author: {
        id: "user-1",
        username: "cryptomaster",
        displayName: "Crypto Master",
        bio: "Especialista em trading de criptomoedas e arbitragem",
        avatar: "avatar1",
        verified: true,
        followers: 1520,
        following: 340,
        posts: 89,
        joinDate: "Janeiro 2023",
        city: "São Paulo",
        state: "SP",
        location: "São Paulo, SP",
        isFollowing: false,
        isBlocked: false,
        earnings: 3200.50,
        level: 8,
        badge: "Master"
      },
      content: "🚀 Bitcoin rompendo resistência dos $43,500! Operação de arbitragem em andamento entre Binance e Coinbase. Lucro de 0.3% já garantido! #Bitcoin #Arbitragem #CryptoTrading",
      timestamp: "2h",
      likes: 87,
      retweets: 23,
      replies: 15,
      shares: 12,
      liked: false,
      retweeted: false,
      hashtags: ["Bitcoin", "Arbitragem", "CryptoTrading"],
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=400&fit=crop"
    },
    {
      id: "post-crypto-2",
      author: {
        id: "user-1",
        username: "cryptomaster",
        displayName: "Crypto Master",
        bio: "Especialista em trading de criptomoedas e arbitragem",
        avatar: "avatar1",
        verified: true,
        followers: 1520,
        following: 340,
        posts: 89,
        joinDate: "Janeiro 2023",
        city: "São Paulo",
        state: "SP",
        location: "São Paulo, SP",
        isFollowing: false,
        isBlocked: false,
        earnings: 3200.50,
        level: 8,
        badge: "Master"
      },
      content: "📊 Análise técnica do BTC/USDT: Formação de triângulo ascendente no gráfico de 4h. Alvos: $44,200 e $45,000. Stop loss: $42,800. Gestão de risco é fundamental! 💪",
      timestamp: "5h",
      likes: 142,
      retweets: 38,
      replies: 27,
      shares: 19,
      liked: false,
      retweeted: false,
      hashtags: ["AnaliseĺTécnica", "BTC", "Trading"]
    },
    {
      id: "post-crypto-3",
      author: {
        id: "user-1",
        username: "cryptomaster",
        displayName: "Crypto Master",
        bio: "Especialista em trading de criptomoedas e arbitragem",
        avatar: "avatar1",
        verified: true,
        followers: 1520,
        following: 340,
        posts: 89,
        joinDate: "Janeiro 2023",
        city: "São Paulo",
        state: "SP",
        location: "São Paulo, SP",
        isFollowing: false,
        isBlocked: false,
        earnings: 3200.50,
        level: 8,
        badge: "Master"
      },
      content: "💎 HODLers vs Traders: Ambas estratégias têm seu lugar no mercado cripto. HODLing para ganhos de longo prazo, trading para lucros consistentes. A chave é diversificar! #HODL #Trading",
      timestamp: "1d",
      likes: 95,
      retweets: 41,
      replies: 33,
      shares: 8,
      liked: false,
      retweeted: false,
      hashtags: ["HODL", "Trading", "Crypto"],
      imageUrl: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=500&h=400&fit=crop"
    }
  ];

  useEffect(() => {
    // Buscar dados do usuário baseado no username
    const foundUser = mockUsers.find(u => u.username === username);
    if (foundUser) {
      // Carregar nome editado do localStorage
      const editedUserNames = localStorage.getItem('editedUserNames');
      const editedNamesObj = editedUserNames ? JSON.parse(editedUserNames) : {};
      const customDisplayName = editedNamesObj[username] || foundUser.displayName;
      
      const userWithCustomName = { ...foundUser, displayName: customDisplayName };
      
      setUser(userWithCustomName);
      setEditedName(customDisplayName);
      
      // Carregar username editado do localStorage
      const editedUsernames = localStorage.getItem('editedUsernames');
      const editedUsernamesObj = editedUsernames ? JSON.parse(editedUsernames) : {};
      const customUsername = editedUsernamesObj[username] || foundUser.username;
      setEditedUsername(customUsername);
      
      // Carregar posts excluídos do localStorage
      const deletedPostsStorage = localStorage.getItem(`deletedPosts_${username}`);
      const deletedPostsIds = deletedPostsStorage ? JSON.parse(deletedPostsStorage) : [];
      setDeletedPosts(deletedPostsIds);
      
      // Filtrar posts do usuário (excluindo os deletados) e atualizar nome do autor
      const userPostsFiltered = mockPosts
        .filter(post => post.author.username === username && !deletedPostsIds.includes(post.id))
        .map(post => ({
          ...post,
          author: {
            ...post.author,
            displayName: customDisplayName
          }
        }));
      setUserPosts(userPostsFiltered);
      
      console.log('Usuário carregado:', { username, originalName: foundUser.displayName, customName: customDisplayName });
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
    // Atualizar lista de posts excluídos
    const newDeletedPosts = [...deletedPosts, postId];
    setDeletedPosts(newDeletedPosts);
    
    // Salvar no localStorage
    localStorage.setItem(`deletedPosts_${username}`, JSON.stringify(newDeletedPosts));
    
    // Remover da lista atual
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

  // Verificar se o usuário atual pode editar este perfil
  const canEditProfile = currentUser?.id === user?.id || isAdmin;
  
  // Para demonstração, sempre permitir editar posts do cryptomaster
  const canEditPosts = username === 'cryptomaster' || isAdmin;

  // Handlers para upload de imagens
  const handleProfileImageUploaded = (url: string) => {
    setProfileImage(url);
    if (user) {
      setUser({ ...user, avatar: url });
    }
  };

  const handleCoverImageUploaded = (url: string) => {
    setCoverImage(url);
  };

  // Handlers para edição do nome
  const handleSaveName = () => {
    if (user && editedName.trim() && username) {
      const newDisplayName = editedName.trim();
      
      // Atualizar o estado local
      setUser({ ...user, displayName: newDisplayName });
      setIsEditingName(false);
      
      // Persistir no localStorage
      const editedUserNames = localStorage.getItem('editedUserNames');
      const editedNamesObj = editedUserNames ? JSON.parse(editedUserNames) : {};
      editedNamesObj[username] = newDisplayName;
      localStorage.setItem('editedUserNames', JSON.stringify(editedNamesObj));
      
      // Mostrar confirmação
      toast({
        title: "Nome atualizado!",
        description: `O nome foi alterado para "${newDisplayName}" com sucesso.`,
      });
      
      console.log('Nome salvo:', { username, newDisplayName, stored: editedNamesObj });
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.displayName || "");
    setIsEditingName(false);
  };

  // Função para resetar nome para o original
  const handleResetName = () => {
    if (username) {
      const foundUser = mockUsers.find(u => u.username === username);
      if (foundUser) {
        const editedUserNames = localStorage.getItem('editedUserNames');
        const editedNamesObj = editedUserNames ? JSON.parse(editedUserNames) : {};
        delete editedNamesObj[username];
        localStorage.setItem('editedUserNames', JSON.stringify(editedNamesObj));
        
        setUser({ ...user!, displayName: foundUser.displayName });
        setEditedName(foundUser.displayName);
        
        toast({
          title: "Nome resetado!",
          description: `O nome foi restaurado para "${foundUser.displayName}".`,
        });
      }
    }
  };

  // Handlers para edição do username
  const handleSaveUsername = () => {
    if (user && editedUsername.trim() && username) {
      const newUsername = editedUsername.trim().toLowerCase().replace(/\s+/g, '');
      
      // Validar formato do username
      if (!/^[a-z0-9_]+$/.test(newUsername)) {
        toast({
          title: "Username inválido!",
          description: "Use apenas letras minúsculas, números e underscore (_).",
          variant: "destructive"
        });
        return;
      }
      
      // Atualizar o estado local
      setUser({ ...user, username: newUsername });
      setIsEditingUsername(false);
      
      // Persistir no localStorage
      const editedUsernames = localStorage.getItem('editedUsernames');
      const editedUsernamesObj = editedUsernames ? JSON.parse(editedUsernames) : {};
      editedUsernamesObj[username] = newUsername;
      localStorage.setItem('editedUsernames', JSON.stringify(editedUsernamesObj));
      
      // Mostrar confirmação
      toast({
        title: "Username atualizado!",
        description: `O username foi alterado para "@${newUsername}" com sucesso.`,
      });
      
      console.log('Username salvo:', { original: username, new: newUsername });
    }
  };

  const handleCancelUsernameEdit = () => {
    setEditedUsername(user?.username || "");
    setIsEditingUsername(false);
  };

  const handleResetUsername = () => {
    if (username) {
      const foundUser = mockUsers.find(u => u.username === username);
      if (foundUser) {
        const editedUsernames = localStorage.getItem('editedUsernames');
        const editedUsernamesObj = editedUsernames ? JSON.parse(editedUsernames) : {};
        delete editedUsernamesObj[username];
        localStorage.setItem('editedUsernames', JSON.stringify(editedUsernamesObj));
        
        setUser({ ...user!, username: foundUser.username });
        setEditedUsername(foundUser.username);
        
        toast({
          title: "Username resetado!",
          description: `O username foi restaurado para "@${foundUser.username}".`,
        });
      }
    }
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
        {/* Cover Image */}
        <div className="relative h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden">
          {coverImage && (
            <img 
              src={coverImage} 
              alt="Foto de capa" 
              className="w-full h-full object-cover"
            />
          )}
          {canEditProfile && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-none"
              onClick={() => setShowImageUpload(true)}
            >
              <Camera className="h-4 w-4 mr-2" />
              Editar capa
            </Button>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-12 sm:-mt-16">
            <div className="relative">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
                <AvatarImage src={profileImage || user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-lg sm:text-2xl">
                {user.displayName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
              {canEditProfile && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-0 right-0 w-8 h-8 p-0 rounded-full bg-primary hover:bg-primary/90 text-white border-2 border-background"
                  onClick={() => setShowImageUpload(true)}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
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
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-xl sm:text-2xl font-bold bg-transparent border-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <Button size="sm" onClick={handleSaveName} className="p-1">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit} className="p-1">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
              <h2 className="text-xl sm:text-2xl font-bold">{user.displayName}</h2>
                  {canEditProfile && (
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingName(true)}
                        className="p-1"
                        title="Editar nome"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleResetName}
                        className="p-1 text-muted-foreground hover:text-orange-500"
                        title="Resetar para nome original"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
              {user.verified && (
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              )}
              <Badge variant="secondary" className={`${getLevelColor(user.level)}`}>
                {user.badge}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              {isEditingUsername ? (
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">@</span>
                  <Input
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    className="text-sm h-6 px-2 w-40 text-muted-foreground"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveUsername();
                      }
                    }}
                    placeholder="username"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleSaveUsername}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={handleCancelUsernameEdit}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <p className="text-muted-foreground">@{user.username}</p>
                  {canEditProfile && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setIsEditingUsername(true);
                          setEditedUsername(user.username);
                        }}
                        title="Editar username"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-orange-500"
                        onClick={handleResetUsername}
                        title="Resetar username original"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
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
                    canEdit={canEditPosts}
                    canDelete={canEditPosts}
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

      {/* Profile Image Upload Modal */}
      {showImageUpload && (
        <ProfileImageUpload
          currentProfileImage={profileImage || user?.avatar}
          currentCoverImage={coverImage}
          onProfileImageUpdate={handleProfileImageUploaded}
          onCoverImageUpdate={handleCoverImageUploaded}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </div>
  );
};

export default UserProfilePage;