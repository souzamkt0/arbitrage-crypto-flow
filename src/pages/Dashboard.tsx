import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Clock, 
  Play, 
  Pause,
  ArrowUpDown,
  Zap,
  BarChart3,
  Settings,
  Newspaper,
  ExternalLink,
  Users,
  Copy,
  Link,
  Bot,
  RefreshCw,
  Heart,
  Image,
  MoreHorizontal,
  Trash2,
  Edit,
  Check,
  X,
  Crown,
  CheckCircle,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import axios from "axios";
import { realCoinMarketCapService, AlphaBotUpdate } from "@/services/realCoinMarketCapService";
import { executeSupabaseOperation, connectionMonitor } from "@/services/connectionMonitor";
import { PartnerStatusBanner } from "@/components/PartnerStatusBanner";
import ResidualBalanceBox from "@/components/ResidualBalanceBox";
import { TradingHeader } from "@/components/TradingHeader";
import { TradingStats } from "@/components/TradingStats";
import { TradingChart } from "@/components/TradingChart";
import { MarketOverview } from "@/components/MarketOverview";
import { TradingBot } from "@/components/TradingBot";
import { CommunityFeed } from "@/components/CommunityFeed";

const Dashboard = () => {
  const [botActive, setBotActive] = useState(false);
  const [balance, setBalance] = useState(0);
  const [dailyProfit, setDailyProfit] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [referralLink, setReferralLink] = useState("");
  const [referralBalance, setReferralBalance] = useState(0);
  const [residualBalance, setResidualBalance] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [tradingBalance, setTradingBalance] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [partnerData, setPartnerData] = useState(null);
  const [partnerStats, setPartnerStats] = useState({
    totalEarnings: 0,
    totalDeposits: 0,
    commission: 1.00,
    monthlyEarnings: 0
  });
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [cryptoNews, setCryptoNews] = useState([]);
  const [performance24h, setPerformance24h] = useState({ percentage: 2.34, symbol: 'BTC', price: 43250 });
  const [lastPerformanceUpdate, setLastPerformanceUpdate] = useState(null);
  const [alphabotData, setAlphabotData] = useState<AlphaBotUpdate | null>(null);
   const [isUpdatingAlphabot, setIsUpdatingAlphabot] = useState(false);
   const [timeUntilUpdate, setTimeUntilUpdate] = useState({ hours: 24, minutes: 0 });
  const [communityMessages, setCommunityMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({ isOnline: true, consecutiveFailures: 0 });
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [deletedCommunityPosts, setDeletedCommunityPosts] = useState<string[]>([]);
  const [editingUserName, setEditingUserName] = useState<string | null>(null);
  const [editingUserNameValue, setEditingUserNameValue] = useState("");

  // ... keep existing code (all utility functions and effects)

  // Carregar posts excluídos do localStorage ao inicializar
  useEffect(() => {
    const deletedPosts = localStorage.getItem('deletedCommunityPosts');
    if (deletedPosts) {
      setDeletedCommunityPosts(JSON.parse(deletedPosts));
    }
  }, []);

  // Função para deletar post da comunidade
  const handleDeleteCommunityPost = (postId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este post?')) {
      const newDeletedPosts = [...deletedCommunityPosts, postId];
      setDeletedCommunityPosts(newDeletedPosts);
      localStorage.setItem('deletedCommunityPosts', JSON.stringify(newDeletedPosts));
      
      // Recarregar mensagens para aplicar o filtro
      loadCommunityMessages();
    }
  };

  // Função para remover imagem de um post da comunidade
  const handleDeleteCommunityImage = (postId: string) => {
    if (window.confirm('Tem certeza que deseja remover a imagem deste post?')) {
      // Salvar IDs de posts com imagens removidas
      const deletedImages = localStorage.getItem('deletedCommunityImages');
      const deletedImagesIds = deletedImages ? JSON.parse(deletedImages) : [];
      const newDeletedImages = [...deletedImagesIds, postId];
      localStorage.setItem('deletedCommunityImages', JSON.stringify(newDeletedImages));
      
      // Atualizar posts atuais removendo a imagem
      setCommunityMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === postId ? { ...msg, imageUrl: null } : msg
        )
      );
    }
  };

  // Função para editar nome de usuário
  const handleEditCommunityUserName = (postId: string, newName: string) => {
    if (newName.trim()) {
      // Salvar nomes editados no localStorage
      const editedNames = localStorage.getItem('editedCommunityNames');
      const editedNamesObj = editedNames ? JSON.parse(editedNames) : {};
      editedNamesObj[postId] = newName.trim();
      localStorage.setItem('editedCommunityNames', JSON.stringify(editedNamesObj));
      
      // Atualizar posts atuais
      setCommunityMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === postId ? { ...msg, user: newName.trim() } : msg
        )
      );
    }
  };

  // Carregar mensagens da comunidade
  const loadCommunityMessages = async () => {
    console.log('🔄 Carregando mensagens da comunidade...');
    
    // Carregar posts excluídos
    const deletedPosts = localStorage.getItem('deletedCommunityPosts');
    const deletedPostsIds = deletedPosts ? JSON.parse(deletedPosts) : [];
    
    // Carregar imagens removidas
    const deletedImages = localStorage.getItem('deletedCommunityImages');
    const deletedImagesIds = deletedImages ? JSON.parse(deletedImages) : [];
    
    // Carregar nomes editados
    const editedNames = localStorage.getItem('editedCommunityNames');
    const editedNamesObj = editedNames ? JSON.parse(editedNames) : {};
    
    // Para demonstração, vamos usar sempre os dados padrão primeiro
    // Isso garante que sempre mostre usuários interessantes
    const allDefaultMessages = [
      {
        id: 'live-1',
        user: 'Hugo Master',
        avatar: 'H',
        message: '🚀 Bitcoin rompendo resistência! Operação de arbitragem ativa entre exchanges. Lucro de 0.3% garantido! #Bitcoin #Arbitragem',
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=400&fit=crop',
        time: new Date().toLocaleString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        }),
        likes: 87,
        isVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'live-2',
        user: 'Carla Oliveira',
        avatar: 'C',
        message: '📊 Análise técnica BTC/USDT: Triângulo ascendente formado. Alvos: $44,200 e $45,000. Stop: $42,800 💪',
        imageUrl: null,
        time: new Date(Date.now() - 1800000).toLocaleString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        }),
        likes: 42,
        isVerified: true,
        createdAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'live-3',
        user: 'Bruno Silva',
        avatar: 'B',
        message: '💎 HODLing forte! ETH está preparando para uma explosão. Acumulando mais na dip. #HODL #Ethereum',
        imageUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=500&h=400&fit=crop',
        time: new Date(Date.now() - 3600000).toLocaleString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        }),
        likes: 65,
        isVerified: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'live-4',
        user: 'Daniela Costa',
        avatar: 'D',
        message: '🏦 Novo protocolo DeFi com APY de 15%! Fiz minha análise de riscos e parece promissor. Link nos comentários 📈',
        imageUrl: null,
        time: new Date(Date.now() - 7200000).toLocaleString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        }),
        likes: 28,
        isVerified: false,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'live-5',
        user: 'André Ferreira',
        avatar: 'A',
        message: '⚡ Setup completo para scalping: RSI divergente + volume aumentando. Entrada em $43,100, alvo $43,800!',
        imageUrl: null,
        time: new Date(Date.now() - 10800000).toLocaleString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        }),
        likes: 33,
        isVerified: true,
        createdAt: new Date(Date.now() - 10800000).toISOString()
      }
    ];

    // Filtrar mensagens padrão removendo as excluídas e aplicar modificações
    const defaultMessages = allDefaultMessages
      .filter(msg => !deletedPostsIds.includes(msg.id))
      .map(msg => ({
        ...msg,
        imageUrl: deletedImagesIds.includes(msg.id) ? null : msg.imageUrl,
        user: editedNamesObj[msg.id] || msg.user,
        avatar: (editedNamesObj[msg.id] || msg.user).charAt(0).toUpperCase()
      }));

    try {
      // Tentar carregar dados do banco em background
      const result = await executeSupabaseOperation(async () => {
        const { data, error } = await supabase
          .from('community_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        return data;
      });

      // Sempre dar prioridade aos dados padrão para ter usuários interessantes
      // Apenas usar dados do banco como último recurso se não há dados padrão
      if (defaultMessages.length >= 2) {
        // Temos dados padrão suficientes, usar apenas eles
        setCommunityMessages(defaultMessages);
      } else if (result && result.length > 0) {
        // Dados padrão insuficientes, complementar com dados do banco
        const dbMessages = result.map(post => ({
        id: post.id,
        user: post.author_name || 'Trader Experiente',
        avatar: post.author_name ? post.author_name.charAt(0).toUpperCase() : 'T',
        message: post.content,
          imageUrl: post.image_url || null,
        time: new Date(post.created_at).toLocaleString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        }),
        likes: post.likes_count || Math.floor(Math.random() * 50) + 10,
          isVerified: Math.random() > 0.7,
          createdAt: post.created_at
        }));
        
        // Combinar dados padrão com dados do banco
        const combinedMessages = [...defaultMessages, ...dbMessages].slice(0, 5);
        setCommunityMessages(combinedMessages);
      } else {
        // Fallback para dados padrão mesmo que poucos
        setCommunityMessages(defaultMessages);
      }
      
      // Cache dos dados para uso offline
      localStorage.setItem('community_messages_cache', JSON.stringify(defaultMessages));

      // Verificar se há novas mensagens
      const currentMessages = communityMessages;
      const currentDisplayMessages = [...defaultMessages].slice(0, 5);
      const hasNewMessagesCheck = currentDisplayMessages.length > 0 && 
        (currentMessages.length === 0 || 
         currentDisplayMessages[0].createdAt !== currentMessages[0]?.createdAt);

      setHasNewMessages(hasNewMessagesCheck);
      setLastMessageCount(currentDisplayMessages.length);
      
      // Notificar sobre novas mensagens (apenas se realmente há mudança)
      if (hasNewMessagesCheck && currentDisplayMessages.length > 0 && currentMessages.length > 0) {
        const newMessage = currentDisplayMessages[0];
        toast({
          title: "Nova Mensagem na Comunidade",
          description: `${newMessage.user}: ${newMessage.message.substring(0, 50)}${newMessage.message.length > 50 ? '...' : ''}`,
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Erro ao carregar mensagens da comunidade:', error);
      
      // Usar dados em cache quando houver erro
      console.log('🔄 Usando dados em cache devido a problema de conexão');
      const cachedMessages = localStorage.getItem('community_messages_cache');
      if (cachedMessages) {
        setCommunityMessages(JSON.parse(cachedMessages));
        toast({
          title: "Modo Offline",
          description: "Exibindo dados em cache. Tentando reconectar...",
          variant: "default"
        });
      } else {
        // Dados padrão sempre ativos para demonstração
        const allFallbackMessages = [
          {
            id: 'default-1',
            user: 'Hugo Master',
            avatar: 'H',
            message: '🚀 Bitcoin rompendo resistência! Operação de arbitragem ativa entre exchanges. Lucro de 0.3% garantido! #Bitcoin #Arbitragem',
            imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=400&fit=crop',
            time: new Date().toLocaleString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            }),
            likes: 87,
            isVerified: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'default-2',
            user: 'Carla Oliveira',
            avatar: 'C',
            message: '📊 Análise técnica BTC/USDT: Triângulo ascendente formado. Alvos: $44,200 e $45,000. Stop: $42,800 💪',
            imageUrl: null,
            time: new Date(Date.now() - 1800000).toLocaleString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            }),
            likes: 42,
            isVerified: true,
            createdAt: new Date(Date.now() - 1800000).toISOString()
          },
          {
            id: 'default-3',
            user: 'Bruno Silva',
            avatar: 'B',
            message: '💎 HODLing forte! ETH está preparando para uma explosão. Acumulando mais na dip. #HODL #Ethereum',
            imageUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=500&h=400&fit=crop',
            time: new Date(Date.now() - 3600000).toLocaleString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            }),
            likes: 65,
            isVerified: false,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'default-4',
            user: 'Daniela Costa',
            avatar: 'D',
            message: '🏦 Novo protocolo DeFi com APY de 15%! Fiz minha análise de riscos e parece promissor. Link nos comentários 📈',
            imageUrl: null,
            time: new Date(Date.now() - 7200000).toLocaleString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            }),
            likes: 28,
            isVerified: false,
            createdAt: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: 'default-5',
            user: 'André Ferreira',
            avatar: 'A',
            message: '⚡ Setup completo para scalping: RSI divergente + volume aumentando. Entrada em $43,100, alvo $43,800!',
            imageUrl: null,
            time: new Date(Date.now() - 10800000).toLocaleString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit'
            }),
            likes: 33,
            isVerified: true,
            createdAt: new Date(Date.now() - 10800000).toISOString()
          }
        ];
        
        // Filtrar mensagens removendo as excluídas e aplicar modificações
        const defaultMessages = allFallbackMessages
          .filter(msg => !deletedPostsIds.includes(msg.id))
          .map(msg => ({
            ...msg,
            imageUrl: deletedImagesIds.includes(msg.id) ? null : msg.imageUrl,
            user: editedNamesObj[msg.id] || msg.user,
            avatar: (editedNamesObj[msg.id] || msg.user).charAt(0).toUpperCase()
          }));
        
        setCommunityMessages(defaultMessages);
        
        toast({
          title: "Problema de Conexão",
          description: "Tentando reconectar com o servidor...",
          variant: "destructive"
        });
      }
      
      // Tentar reconectar após 5 segundos
      setTimeout(() => {
        connectionMonitor.forceCheck().then(isOnline => {
          if (isOnline) {
            loadCommunityMessages();
          }
        });
      }, 5000);
    }
  };

  // Função para atualizar o AlphaBot usando dados reais da CoinMarketCap
  const updateAlphaBot = async () => {
    setIsUpdatingAlphabot(true);
    try {
      const data = await realCoinMarketCapService.updateAlphaBot();
      setAlphabotData(data);
      toast({
        title: "AlphaBot Atualizado",
        description: `Dados atualizados com sucesso. Total de operações: ${data.trades.length}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao atualizar AlphaBot:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados do AlphaBot",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingAlphabot(false);
    }
  };

  // ... keep existing code (all other functions)

  // Handle user click for community navigation
  const handleUserClick = (userName: string) => {
    const userMapping: Record<string, string> = {
      'Hugo Master': 'cryptomaster',
      'Carla Oliveira': 'carlaoliveira',
      'Bruno Silva': 'brunosilva',
      'Daniela Costa': 'danielacosta',
      'André Ferreira': 'andreferreira',
      'Sistema': 'sistema'
    };
    const username = userMapping[userName] || userName.toLowerCase().replace(/\s+/g, '');
    navigate(`/community/user/${username}`);
  };

  // ... keep existing code (all useEffects)

  useEffect(() => {
    loadUserData();
    loadCommunityMessages();
    
    // Simular dados iniciais para demonstração
    setBalance(15420.50);
    setDailyProfit(287.30);
    setTotalProfit(8942.15);
    setActiveOrders(5);
    setTradingBalance(12000.00);
    setMonthlyEarnings(2847.90);
    
    // Atualizar dados periodicamente
    const interval = setInterval(() => {
      setBalance(prev => prev + (Math.random() - 0.5) * 50);
      setDailyProfit(prev => prev + (Math.random() - 0.5) * 10);
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Carregar dados do usuário
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setBalance(data.balance || 0);
        setTotalDeposits(data.total_deposits || 0);
        setReferralBalance(data.referral_balance || 0);
        setResidualBalance(data.residual_balance || 0);
        setReferralLink(`${window.location.origin}/register?ref=${data.referral_code || user.id}`);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Trading Header */}
      <TradingHeader />
      
      {/* Partner Status Banner */}
      {partnerData && <PartnerStatusBanner />}
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Trading Stats */}
        <TradingStats
          balance={balance}
          dailyProfit={dailyProfit}
          totalProfit={totalProfit}
          activeOrders={activeOrders}
          tradingBalance={tradingBalance}
          monthlyEarnings={monthlyEarnings}
          botActive={botActive}
        />

        {/* Main Trading Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Market Overview */}
          <div className="lg:col-span-1 space-y-6">
            <MarketOverview />
            
            {/* Residual Balance */}
            <ResidualBalanceBox />
          </div>

          {/* Center Column - Trading Chart */}
          <div className="lg:col-span-1">
            <TradingChart />
          </div>

          {/* Right Column - Bot & Community */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trading Bot */}
            <TradingBot
              botActive={botActive}
              setBotActive={setBotActive}
              alphabotData={alphabotData}
              isUpdatingAlphabot={isUpdatingAlphabot}
              updateAlphaBot={updateAlphaBot}
            />

            {/* Community Feed */}
            <CommunityFeed
              communityMessages={communityMessages}
              hasNewMessages={hasNewMessages}
              editingUserName={editingUserName}
              editingUserNameValue={editingUserNameValue}
              setEditingUserName={setEditingUserName}
              setEditingUserNameValue={setEditingUserNameValue}
              handleEditCommunityUserName={handleEditCommunityUserName}
              handleDeleteCommunityPost={handleDeleteCommunityPost}
              handleDeleteCommunityImage={handleDeleteCommunityImage}
              loadCommunityMessages={loadCommunityMessages}
              onUserClick={handleUserClick}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            onClick={() => navigate('/deposit')}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-6"
          >
            <DollarSign className="mr-2 h-5 w-5" />
            Depositar
          </Button>
          
          <Button
            onClick={() => navigate('/withdrawal')}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 font-medium py-6"
          >
            <ArrowUpDown className="mr-2 h-5 w-5" />
            Sacar
          </Button>
          
          <Button
            onClick={() => navigate('/investments')}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20 font-medium py-6"
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            Investimentos
          </Button>
          
          <Button
            onClick={() => navigate('/referrals')}
            variant="outline"
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20 font-medium py-6"
          >
            <Users className="mr-2 h-5 w-5" />
            Indicações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;