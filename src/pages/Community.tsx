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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  CheckCircle2,
  Image,
  X,
  Smile,
  Trash2
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
  imageUrl?: string;
}

interface LeaderboardUser {
  name: string;
  earnings: number;
  level: number;
  change: string;
}

const Community = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [feeling, setFeeling] = useState<string>("");
  const [isAdmin] = useState(true); // Simular admin
const [users] = useState<UserProfileData[]>(communityUsers);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const { toast } = useToast();

  // Current user data - load from localStorage if exists
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUsers = JSON.parse(localStorage.getItem("alphabit_users") || "[]");
    const lastUser = savedUsers[savedUsers.length - 1];
    
    // Função para gerar UUID válido
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    // Usar o ID do usuário autenticado se disponível, senão gerar UUID
    const userId = user?.id || lastUser?.id || generateUUID();
    
    if (lastUser) {
      return {
        id: userId,
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
      id: userId,
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

  const [posts, setPosts] = useState<TwitterPostData[]>([]);

  // Função para carregar posts do banco de dados
  const loadPosts = async () => {
    try {
      // Adicionar timeout para evitar travamentos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const { data: postsData, error } = await supabase
        .from('community_posts')
        .select(`
          id,
          content,
          image_url,
          likes_count,
          retweets_count,
          replies_count,
          shares_count,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(20)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error('Erro ao carregar posts:', error);
        // Em caso de erro, usar posts de exemplo como fallback
        setPosts(examplePosts);
        return;
      }

      // Validação de segurança: garantir que temos dados válidos
      if (!Array.isArray(postsData)) {
        console.warn('Dados de posts inválidos recebidos:', postsData);
        setPosts([]);
        return;
      }

      // Garantir que temos um autor válido
      const getValidAuthor = () => {
        // Verificar se users existe e tem pelo menos um elemento válido
        if (Array.isArray(users) && users.length > 0 && users[0]?.id) {
          return users[0];
        }
        // Verificar se currentUser é válido
        if (currentUser?.id) {
          return currentUser;
        }
        // Fallback para um autor padrão
        return {
          id: 'default-author',
          username: 'usuario',
          displayName: 'Usuário',
          bio: 'Usuário da comunidade',
          avatar: 'avatar1',
          verified: false,
          followers: 0,
          following: 0,
          posts: 0,
          joinDate: 'Hoje',
          city: 'Cidade',
          state: 'Estado',
          location: 'Cidade, Estado',
          isFollowing: false,
          isBlocked: false,
          earnings: 0,
          level: 1,
          badge: 'Iniciante'
        };
      };

      const validAuthor = getValidAuthor();

      // Converter posts do banco para o formato do componente com validação
      const formattedPosts: TwitterPostData[] = postsData
        .filter(post => post && post.id && post.content) // Filtrar posts inválidos
        .map(post => ({
          id: post.id,
          author: validAuthor,
          content: post.content || '',
          timestamp: post.created_at ? new Date(post.created_at).toLocaleString('pt-BR') : 'Agora',
          likes: Math.max(0, post.likes_count || 0),
          retweets: Math.max(0, post.retweets_count || 0),
          replies: Math.max(0, post.replies_count || 0),
          shares: Math.max(0, post.shares_count || 0),
          liked: false,
          retweeted: false,
          imageUrl: post.image_url || undefined
        }));

      setPosts(formattedPosts);
      setIsOfflineMode(false); // Desativar modo offline quando dados são carregados com sucesso
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      
      // Verificar se é erro de conectividade
      if (error.name === 'AbortError') {
        console.warn('Timeout na conexão com o banco de dados');
        setIsOfflineMode(true);
        toast({
          title: "Conexão lenta",
          description: "A conexão está lenta. Usando dados locais.",
          variant: "default"
        });
      } else {
        console.warn('Erro de conectividade:', error.message);
        setIsOfflineMode(true);
        toast({
          title: "Problema de conexão",
          description: "Verifique sua conexão com a internet.",
          variant: "destructive"
        });
      }
      
      // Em caso de erro, usar posts de exemplo como fallback
      setPosts(examplePosts);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Carregar posts ao montar o componente
  useEffect(() => {
    loadPosts();
  }, []);

  // Posts de exemplo para fallback
  const examplePosts: TwitterPostData[] = [
    {
      id: "example-1",
      author: currentUser,
      content: "🚀 Bem-vindos à comunidade ALPHABIT! Aqui você pode compartilhar suas experiências com arbitragem de criptomoedas. #ALPHABIT #Crypto",
      timestamp: "há 2 horas",
      likes: 15,
      retweets: 3,
      replies: 7,
      shares: 2,
      liked: false,
      retweeted: false,
      hashtags: ["ALPHABIT", "Crypto"]
    },
    {
      id: "example-2",
      author: {
        ...currentUser,
        id: "system",
        username: "alphabit_oficial",
        displayName: "ALPHABIT Oficial",
        verified: true,
        bio: "Plataforma oficial de arbitragem de criptomoedas"
      },
      content: "💡 Dica do dia: Sempre monitore as diferenças de preços entre exchanges para identificar oportunidades de arbitragem. A velocidade é fundamental! ⚡",
      timestamp: "há 4 horas",
      likes: 28,
      retweets: 12,
      replies: 5,
      shares: 8,
      liked: true,
      retweeted: false
    }
  ];

  const [leaderboard] = useState<LeaderboardUser[]>([
    { name: "CryptoMaster", earnings: 2450.75, level: 8, change: "+12%" },
    { name: "TraderPro", earnings: 1890.32, level: 7, change: "+8%" },
    { name: "BitcoinBull", earnings: 1654.21, level: 6, change: "+5%" },
    { name: "EthereumExpert", earnings: 1432.18, level: 5, change: "+3%" },
    { name: "AltcoinAce", earnings: 1298.45, level: 4, change: "+1%" }
  ]);

  const [suggestedUsers] = useState<UserProfileData[]>([
    {
      id: "suggested-1",
      username: "cryptoanalyst",
      displayName: "Crypto Analyst",
      bio: "Especialista em análise técnica de criptomoedas",
      avatar: "avatar2",
      verified: true,
      followers: 1250,
      following: 340,
      posts: 89,
      joinDate: "Janeiro 2023",
      city: "Rio de Janeiro",
      state: "RJ",
      location: "Rio de Janeiro, RJ",
      isFollowing: false,
      isBlocked: false,
      earnings: 3200.50,
      level: 6,
      badge: "Expert"
    },
    {
      id: "suggested-2",
      username: "blockchaindev",
      displayName: "Blockchain Dev",
      bio: "Desenvolvedor blockchain e entusiasta DeFi",
      avatar: "avatar3",
      verified: false,
      followers: 890,
      following: 210,
      posts: 156,
      joinDate: "Março 2023",
      city: "São Paulo",
      state: "SP",
      location: "São Paulo, SP",
      isFollowing: false,
      isBlocked: false,
      earnings: 2100.25,
      level: 5,
      badge: "Avançado"
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

  // Função para lidar com upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro!",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro!",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      // Salvar o arquivo para upload posterior
      setSelectedImageFile(file);
      
      // Converter para base64 para preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para remover imagem selecionada
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setSelectedImageFile(null);
  };

  // Função para deletar foto permanentemente
  const deleteSelectedImage = async () => {
    if (selectedImageFile && user) {
      try {
        // Se a imagem já foi enviada para o Supabase, deletar do storage
        const fileExt = selectedImageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        await supabase.storage
          .from('post-images')
          .remove([fileName]);
        
        toast({
          title: "Foto deletada!",
          description: "A foto foi removida com sucesso.",
        });
      } catch (error) {
        console.error('Erro ao deletar foto:', error);
      }
    }
    
    // Remover da interface
    setSelectedImage(null);
    setSelectedImageFile(null);
  };

  // Função para deletar post
  const handleDeletePost = async (postId: string) => {
    if (!currentUser?.id) {
      toast({
        title: "Erro!",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Primeiro tentar deletar do banco de dados
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', currentUser.id);

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      // Se não encontrou no banco, deletar dos posts locais (posts de exemplo)
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      toast({
        title: "Post deletado!",
        description: "O post foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      toast({
        title: "Erro!",
        description: "Não foi possível deletar o post.",
        variant: "destructive"
      });
    }
  };

  // Função para deletar apenas a imagem do post
  const handleDeleteImage = async (postId: string) => {
    if (!currentUser?.id) {
      toast({
        title: "Erro!",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Primeiro tentar atualizar no banco de dados removendo a imagem
      const { error } = await supabase
        .from('community_posts')
        .update({ image_url: null })
        .eq('id', postId)
        .eq('user_id', currentUser.id);

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      // Se não encontrou no banco, atualizar nos posts locais (posts de exemplo)
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId ? { ...post, imageUrl: undefined } : post
        )
      );
      
      toast({
        title: "Foto excluída!",
        description: "A foto foi removida do post com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir foto:', error);
      toast({
        title: "Erro!",
        description: "Não foi possível excluir a foto.",
        variant: "destructive"
      });
    }
  };

  // Função para editar post
  const handleEditPost = async (postId: string, newContent: string) => {
    if (!currentUser?.id) {
      toast({
        title: "Erro!",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Primeiro tentar atualizar no banco de dados
      const { error } = await supabase
        .from('community_posts')
        .update({ content: newContent })
        .eq('id', postId)
        .eq('user_id', currentUser.id);

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      // Se não encontrou no banco, atualizar nos posts locais (posts de exemplo)
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId ? { ...post, content: newContent } : post
        )
      );
      
      toast({
        title: "Post editado!",
        description: "O post foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao editar post:', error);
      toast({
        title: "Erro!",
        description: "Não foi possível editar o post.",
        variant: "destructive"
      });
    }
  };

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

  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    if (!currentUser?.id) {
      toast({
        title: "Erro!",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar limite mensal
    if (monthlyEarnings >= gamificationSettings.monthlyLimit) {
      toast({
        title: "Limite atingido!",
        description: `Você já atingiu o limite mensal de $${gamificationSettings.monthlyLimit}`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    let imageUrl = null;

    try {
      // Upload da imagem se existir
      if (selectedImageFile && currentUser) {
        const fileExt = selectedImageFile.name.split('.').pop();
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
        
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(fileName, selectedImageFile);

          if (uploadError) {
            console.error('Erro no upload:', uploadError);
            
            // Verificar se é erro de bucket não encontrado
            if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('The resource was not found')) {
              // Fallback: converter imagem para base64 e salvar localmente
              console.log('Usando fallback base64 para imagem');
              
              const reader = new FileReader();
              const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(selectedImageFile);
              });
              
              imageUrl = await base64Promise;
              
              toast({
                title: "Aviso",
                description: "Imagem salva temporariamente. Configure o storage para melhor performance.",
                variant: "default"
              });
            } else {
              throw uploadError;
            }
          } else {
            // Upload bem-sucedido - obter URL pública
            const { data: { publicUrl } } = supabase.storage
              .from('post-images')
              .getPublicUrl(fileName);
            
            imageUrl = publicUrl;
          }
        } catch (error) {
          console.error('Erro inesperado no upload:', error);
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer upload da imagem. Tente novamente.",
            variant: "destructive"
          });
          setIsUploading(false);
          return;
        }
      }

      // Preparar conteúdo do post com sentimento se preenchido
      let postContent = newPost;
      if (feeling.trim()) {
        postContent = `${feeling} ${newPost}`;
      }

      // Salvar post no banco de dados
       const { data: postData, error: postError } = await supabase
         .from('community_posts')
         .insert({
           user_id: user?.id || currentUser.id,
           content: postContent,
           image_url: imageUrl,
           likes_count: 0,
           retweets_count: 0,
           replies_count: 0,
           shares_count: 0
         })
         .select()
         .single();

      if (postError) {
        throw postError;
      }

      // Recarregar posts do banco de dados
      await loadPosts();
      setNewPost("");
      setFeeling("");
      setSelectedImage(null);
      setSelectedImageFile(null);
      
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
    } catch (error) {
      console.error('Erro ao publicar post:', error);
      toast({
        title: "Erro!",
        description: "Não foi possível publicar o post. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
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
    <div className="min-h-screen bg-black w-full overflow-x-hidden">
      {/* Header estilo Facebook - Tema Escuro */}
      <header className="bg-black border-b border-gray-800 px-2 sm:px-4 py-3 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-xl sm:text-2xl font-bold text-yellow-500">alphabit</h1>
            <div className="hidden sm:flex bg-gray-800 rounded-full px-3 sm:px-4 py-2 w-48 sm:w-64">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Pesquisar no Alphabit" 
                className="bg-transparent outline-none flex-1 text-sm text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
             <Button 
               variant="ghost" 
               size="sm" 
               className="p-1.5 sm:p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white"
               onClick={() => navigate("/dashboard")}
             >
               <Home className="h-5 w-5 sm:h-6 sm:w-6" />
             </Button>
             <Button 
               variant="ghost" 
               size="sm" 
               className="p-1.5 sm:p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white hidden sm:flex"
             >
               <Users className="h-5 w-5 sm:h-6 sm:w-6" />
             </Button>
             <Button 
               variant="ghost" 
               size="sm" 
               className="p-1.5 sm:p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white hidden sm:flex"
             >
               <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
             </Button>
             <Button 
               variant="ghost" 
               size="sm" 
               className="p-1.5 sm:p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white"
             >
               <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
             </Button>
             <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
               <AvatarImage src={currentUser.avatar} />
               <AvatarFallback className="bg-gray-700 text-white text-xs sm:text-sm">{currentUser.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
             </Avatar>
           </div>
        </div>
      </header>
      
      {/* Indicador de Modo Offline */}
      {isOfflineMode && (
        <div className="bg-yellow-900/20 border-b border-yellow-500/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-200">
              Modo offline ativo - Exibindo dados locais
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setIsOfflineMode(false);
                loadPosts();
              }}
              className="text-yellow-500 hover:text-yellow-400 text-xs px-2 py-1 h-auto"
            >
              Tentar reconectar
            </Button>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-7xl mx-auto flex gap-0 sm:gap-2 lg:gap-4 pt-2 sm:pt-4 px-2 sm:px-4 lg:px-6 overflow-x-hidden min-h-screen">
        {/* Sidebar Esquerda - Hidden on Mobile */}
        <div className="hidden lg:flex lg:w-64 xl:w-80 flex-col sticky top-20 h-fit">
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-gray-700 text-white">{currentUser.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-white">{currentUser.displayName}</div>
                  <div className="text-sm text-gray-400">@{currentUser.username}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-300">{currentUser.bio}</div>
              <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
                <span>{currentUser.followers} seguidores</span>
                <span>Level {currentUser.level}</span>
                <span className="text-yellow-500 font-semibold">${currentUser.earnings.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-4">
              <h3 className="font-semibold text-white mb-3">Ações Rápidas</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm hover:bg-gray-800 text-gray-300 hover:text-white">
                  <TrendingUp className="h-4 w-4 mr-3" />
                  Ver Trending
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm hover:bg-gray-800 text-gray-300 hover:text-white">
                  <Users className="h-4 w-4 mr-3" />
                  Encontrar Pessoas
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full min-h-screen">
          {/* Mobile Header */}
          <div className="lg:hidden bg-black border-b border-gray-800 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Início</h1>
                <p className="text-xs sm:text-sm text-gray-400">O que está acontecendo</p>
              </div>
              <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500">
                <Users className="h-3 w-3 mr-1" />
                1.2k online
              </Badge>
            </div>
          </div>

          {/* Aviso Anti-Spam */}
          <div className="bg-gray-900 border-b border-gray-800 p-3 sm:p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-yellow-500 block">Importante!</span>
                <p className="text-xs text-gray-300 mt-1">
                  {gamificationSettings.spamWarning}
                </p>
                <div className="text-xs text-gray-300 mt-2">
                  <strong>Limite:</strong> ${monthlyEarnings.toFixed(2)}/${gamificationSettings.monthlyLimit}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Profile Summary */}
          <div className="lg:hidden bg-black border-b border-gray-800 p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-gray-700 text-white">{currentUser.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-white">{currentUser.displayName}</span>
                  {currentUser.verified && <CheckCircle2 className="h-3 w-3 text-yellow-500" />}
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <span>{currentUser.followers} seguidores</span>
                  <span>Level {currentUser.level}</span>
                  <span className="text-yellow-500 font-semibold">${currentUser.earnings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Criar Post - Facebook Style */}
          <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 mb-4 p-3 sm:p-4">
            <div className="flex space-x-2 sm:space-x-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-gray-700 text-white">{currentUser.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {/* Campo de sentimento */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Smile className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Como você está se sentindo?</span>
                  </div>
                  <select
                    value={feeling}
                    onChange={(e) => setFeeling(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Selecione um sentimento...</option>
                    <option value="😊 Feliz -">😊 Feliz</option>
                    <option value="😎 Confiante -">😎 Confiante</option>
                    <option value="🚀 Animado -">🚀 Animado</option>
                    <option value="💪 Motivado -">💪 Motivado</option>
                    <option value="🤔 Pensativo -">🤔 Pensativo</option>
                    <option value="😌 Relaxado -">😌 Relaxado</option>
                    <option value="🔥 Empolgado -">🔥 Empolgado</option>
                    <option value="💰 Rico -">💰 Rico</option>
                    <option value="📈 Otimista -">📈 Otimista</option>
                    <option value="⚡ Energizado -">⚡ Energizado</option>
                  </select>
                </div>
                
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="No que você está pensando?"
                  className="min-h-[80px] sm:min-h-[100px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-800 text-white placeholder-gray-400 rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-sm sm:text-base"
                  maxLength={500}
                />
                
                {/* Preview da imagem selecionada */}
                {selectedImage && (
                  <div className="mt-3 relative inline-block group">
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className="max-w-full max-h-48 sm:max-h-64 rounded-lg border border-gray-600 transition-all duration-200 group-hover:brightness-75"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deleteSelectedImage}
                        className="bg-red-600/90 hover:bg-red-700 text-white rounded-full p-1.5 h-8 w-8 sm:h-10 sm:w-10 shadow-lg border-2 border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-110"
                        title="Deletar foto"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      Clique no X para remover
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 sm:mt-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image-upload">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-white hover:bg-gray-800 p-1.5 sm:p-2 text-xs sm:text-sm"
                        asChild
                      >
                        <span className="cursor-pointer flex items-center space-x-1">
                          <Image className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">Foto</span>
                        </span>
                      </Button>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                    <span className="text-xs sm:text-sm text-gray-400">{newPost.length}/500</span>
                    <Button 
                      onClick={handlePost} 
                      disabled={!newPost.trim() || isUploading}
                      className="bg-yellow-600 hover:bg-yellow-700 text-black px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-semibold text-sm sm:text-base"
                    >
                      {isUploading ? "Publicando..." : "Publicar"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="pb-16 lg:pb-0">
            {loadingPosts ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando posts...</p>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post, index) => (
                <div key={post.id} className="bg-gray-900 rounded-xl shadow-lg border border-gray-700 mb-4 sm:mb-6 hover:border-gray-600 transition-all duration-200 hover:shadow-xl">
                  <TwitterPost
              post={post}
              onLike={handleLike}
              onRetweet={handleRetweet}
              onReply={handleReply}
              onUserClick={handleUserClick}
              onEdit={post.author.id === currentUser.id ? handleEditPost : undefined}
              onDelete={post.author.id === currentUser.id || isAdmin ? handleDeletePost : undefined}
              onDeleteImage={post.author.id === currentUser.id || isAdmin ? handleDeleteImage : undefined}
              currentUserId={currentUser.id}
              canEdit={post.author.id === currentUser.id}
              canDelete={post.author.id === currentUser.id || isAdmin}
            />
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Nenhum post ainda</p>
                <p className="text-gray-400 text-sm">Seja o primeiro a compartilhar algo com a comunidade!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Direita - Hidden on Mobile */}
        <div className="hidden xl:flex xl:w-80 flex-col sticky top-20 h-fit">
          <div className="space-y-4 px-4">
            {/* Mobile Search - Only show on smaller screens */}
            <div className="md:hidden bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-3">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar na Alphabit" 
                  className="bg-transparent border-0 outline-0 flex-1 text-sm placeholder:text-gray-400 text-white"
                />
              </div>
            </div>

            {/* Sugestões de Usuários */}
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">Sugestões para você</h2>
              </div>
              <div className="p-4">
                {Array.isArray(suggestedUsers) && suggestedUsers.length > 0 ? (
                  <SuggestedUsers
                    users={suggestedUsers}
                    onFollow={handleFollow}
                    onUserClick={handleUserClick}
                  />
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Nenhuma sugestão disponível
                  </div>
                )}
              </div>
            </div>

            {/* Trending/Ranking */}
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">Ranking Semanal</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {Array.isArray(leaderboard) && leaderboard.length > 0 ? (
                    leaderboard.slice(0, 5).map((user, index) => {
                      // Validação de segurança para cada usuário do leaderboard
                      if (!user || typeof user !== 'object' || !user.name) {
                        return null;
                      }
                      return (
                        <div key={user.name || index} className="flex items-center justify-between hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-black' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-yellow-600 text-black' :
                              'bg-gray-700 text-gray-300'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-sm text-white">{user.name}</div>
                              <div className="text-xs text-gray-400">
                                Lv. {user.level || 1} • ${(user.earnings || 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            (user.change || '').startsWith('+') ? 'text-green-400' :
                            (user.change || '').startsWith('-') ? 'text-red-400' :
                            'text-gray-400'
                          }`}>
                            {user.change !== '0' && (user.change || '0%')}
                          </div>
                        </div>
                      );
                    }).filter(Boolean)
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Nenhum dado de ranking disponível
                    </div>
                  )}
                </div>
                <Button variant="ghost" className="w-full mt-3 text-yellow-500 hover:bg-gray-800">
                  Ver mais
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
        <div className="flex justify-around p-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-col h-auto py-2 text-yellow-500 hover:bg-gray-900"
            onClick={() => navigate("/community")}
          >
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Início</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-col h-auto py-2 text-gray-400 hover:bg-gray-900"
          >
            <TrendingUp className="h-5 w-5 mb-1" />
            <span className="text-xs">Ranking</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-col h-auto py-2 text-gray-400 hover:bg-gray-900"
            onClick={() => navigate("/edit-profile")}
          >
            <Trophy className="h-5 w-5 mb-1" />
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
