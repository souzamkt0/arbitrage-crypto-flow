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
import { EthereumChart } from "@/components/EthereumChart";
import { SolanaChart } from "@/components/SolanaChart";
import { CardanoChart } from "@/components/CardanoChart";
import { MarketOverview } from "@/components/MarketOverview";
import { TradingBot } from "@/components/TradingBot";
import { PartnerStats } from "@/components/PartnerStats";
import BalanceBox from "@/components/BalanceBox";


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
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isDataSyncing, setIsDataSyncing] = useState(false);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);

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
      // Usar sempre dados padrão para demonstração
      // Isso garante que sempre mostre usuários interessantes
      setCommunityMessages(defaultMessages);
      
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
    loadInvestmentStats();
    loadPartnerData();
    loadUserInvestments();
    
    // Atualizar dados reais periodicamente (a cada 30 segundos)
    const interval = setInterval(() => {
      loadUserData();
      loadInvestmentStats();
      loadUserInvestments();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Carregar dados reais do usuário
  const loadUserData = async () => {
    if (!user) return;

    setIsDataSyncing(true);
    try {
      // Carregar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData) {
        const newBalance = profileData.balance || 0;
        const newTotalProfit = profileData.total_profit || 0;
        
        // Verificar se os dados mudaram
        const dataChanged = newBalance !== balance || newTotalProfit !== totalProfit;
        
        setBalance(newBalance);
        setTotalProfit(newTotalProfit);
        setReferralBalance(profileData.referral_balance || 0);
        setReferralLink(`${window.location.origin}/register?ref=${profileData.referral_code || user.id}`);
        
        // Mostrar notificação se os dados foram atualizados
        if (dataChanged && lastSyncTime) {
          toast({
            title: "Dados Sincronizados",
            description: "Saldos atualizados com dados reais do banco",
            variant: "default"
          });
        }
        
        setLastSyncTime(new Date());
      }

      // Carregar estatísticas de ganhos residuais
      const { data: residualStats } = await supabase.rpc('get_user_referral_stats', {
        target_user_id: user.id
      });

      if (residualStats && residualStats.length > 0) {
        setResidualBalance(residualStats[0].residual_balance || 0);
        setMonthlyEarnings(residualStats[0].this_month_earnings || 0);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast({
        title: "Erro de Sincronização",
        description: "Falha ao carregar dados reais do banco",
        variant: "destructive"
      });
    } finally {
      setIsDataSyncing(false);
    }
  };

  // Carregar estatísticas de investimentos reais
  const loadInvestmentStats = async () => {
    if (!user) return;

    try {
      // Buscar estatísticas de investimentos
      const { data: investmentStats } = await supabase.rpc('get_investment_stats', {
        p_user_id: user.id
      });

      if (investmentStats && investmentStats.length > 0) {
        const stats = investmentStats[0];
        setTradingBalance(stats.total_invested || 0);
        setDailyProfit(stats.today_total_earnings || 0);
        setActiveOrders(0); // Removido contagem fake
      }

      // Buscar depósitos totais confirmados
      const { data: deposits } = await supabase
        .from('deposits')
        .select('amount_usd')
        .eq('user_id', user.id)
        .eq('status', 'paid');

      if (deposits) {
        const totalDepositsAmount = deposits.reduce((sum, deposit) => sum + (deposit.amount_usd || 0), 0);
        setTotalDeposits(totalDepositsAmount);
      }

    } catch (error) {
      console.error('Erro ao carregar estatísticas de investimentos:', error);
    }
  };

  // Carregar dados reais de parceiro
  const loadPartnerData = async () => {
    if (!user) return;

    try {
      const { data: partner } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      setPartnerData(partner);

      if (partner) {
        // Buscar estatísticas de parceiro
        const { data: commissions } = await supabase
          .from('partner_commissions')
          .select('commission_amount, created_at')
          .eq('partner_id', user.id)
          .eq('status', 'paid');

        if (commissions) {
          const totalEarnings = commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0);
          
          // Calcular ganhos mensais
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const monthlyTotal = commissions
            .filter(c => {
              const date = new Date(c.created_at);
              return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, c) => sum + Number(c.commission_amount), 0);

          setPartnerStats({
            totalEarnings,
            totalDeposits: partner.total_deposits || 0,
            commission: partner.commission_percentage || 1,
            monthlyEarnings: monthlyTotal
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de parceiro:', error);
    }
  };

  // Carregar investimentos ativos do usuário
  const loadUserInvestments = async () => {
    if (!user) return;

    try {
      const { data: investments, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          investment_plans (
            name,
            daily_rate,
            duration_days
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Erro ao carregar investimentos:', error);
        return;
      }

      setUserInvestments(investments || []);
    } catch (error) {
      console.error('Erro ao carregar investimentos do usuário:', error);
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
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1a1f2e] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">TradeHub</h1>
            </div>
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <Button variant="ghost" className="text-teal-400 bg-teal-400/10">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => navigate('/investments')}>
                <Activity className="w-4 h-4 mr-2" />
                Investments
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => navigate('/referrals')}>
                <Users className="w-4 h-4 mr-2" />
                Referrals
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Setting
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{profile?.display_name?.charAt(0) || 'U'}</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                1
              </div>
            </div>
          </div>
        </div>
      </header>

      {partnerData && <PartnerStatusBanner />}

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Portfolio & Assets */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Portfolio Card */}
            <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-300 mb-1">My Portfolio</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className="text-sm text-green-400 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{dailyProfit.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Bitcoin Chart Area */}
              <div className="relative h-48 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-lg mb-4 overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                  <div className="text-sm text-gray-400 mb-1">Bitcoin Performance</div>
                  <div className="text-lg font-bold text-white">
                    +R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="h-full p-4">
                  <TradingChart />
                </div>
              </div>
            </div>

            {/* Asset Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* BTC Card */}
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    ₿
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">BTC</div>
                    <div className="text-xs text-gray-500">Bitcoin</div>
                  </div>
                </div>
                <div className="text-xl font-bold mb-1">$ 51,020</div>
                <div className="text-sm text-red-400 flex items-center">
                  ↓ 20.4%
                </div>
                <div className="text-xs text-gray-500 mt-1">Highest in 30 Days</div>
              </div>

              {/* ETH Card */}
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    Ξ
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">ETH</div>
                    <div className="text-xs text-gray-500">Ethereum</div>
                  </div>
                </div>
                <div className="text-xl font-bold mb-1">$ 3,020</div>
                <div className="text-sm text-green-400 flex items-center">
                  ↑ 20.4%
                </div>
                <div className="text-xs text-gray-500 mt-1">Highest in 30 Days</div>
              </div>

              {/* SOL Card */}
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                    ◎
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">SOL</div>
                    <div className="text-xs text-gray-500">Solana</div>
                  </div>
                </div>
                <div className="text-xl font-bold mb-1">$ 220</div>
                <div className="text-sm text-green-400 flex items-center">
                  ↑ 15.2%
                </div>
                <div className="text-xs text-gray-500 mt-1">Highest in 30 Days</div>
              </div>
            </div>

            {/* Trading Tools */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800 text-center cursor-pointer hover:bg-[#232834] transition-colors" onClick={() => navigate('/deposit')}>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ArrowUpDown className="w-6 h-6 text-blue-400" />
                </div>
                <div className="font-medium mb-1">Deposit</div>
                <div className="text-xs text-gray-500">Add Funds</div>
              </div>
              
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800 text-center cursor-pointer hover:bg-[#232834] transition-colors" onClick={() => navigate('/withdrawal')}>
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-orange-400" />
                </div>
                <div className="font-medium mb-1">Withdraw</div>
                <div className="text-xs text-gray-500">Cash Out</div>
              </div>
              
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800 text-center cursor-pointer hover:bg-[#232834] transition-colors" onClick={() => navigate('/history')}>
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-pink-400" />
                </div>
                <div className="font-medium mb-1">History</div>
                <div className="text-xs text-gray-500">Transactions</div>
              </div>
              
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800 text-center cursor-pointer hover:bg-[#232834] transition-colors" onClick={() => navigate('/market')}>
                <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-teal-400" />
                </div>
                <div className="font-medium mb-1">Analysis</div>
                <div className="text-xs text-gray-500">Markets</div>
              </div>
            </div>

            {/* Active Plans - Modern Style */}
            <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Active Plans</h3>
                <Button variant="ghost" size="sm" className="text-teal-400" onClick={() => navigate('/active-plans')}>
                  See All
                </Button>
              </div>
              
              <div className="space-y-4">
                {userInvestments.length > 0 ? (
                  userInvestments.slice(0, 3).map((investment, index) => (
                    <div key={investment.id} className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg border border-gray-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Plan ${investment.amount?.toFixed(2) || '0.00'}</div>
                          <div className="text-xs text-gray-500">{(investment.daily_rate * 100)?.toFixed(2) || '0.00'}% daily</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-400">+${investment.total_earned?.toFixed(2) || '0.00'}</div>
                        <div className="text-xs text-gray-500">{investment.days_remaining || 0} days left</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">No active plans</div>
                    <Button onClick={() => navigate('/investments')} className="bg-teal-500 hover:bg-teal-600">
                      Start Investing
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Board & Existing Components */}
          <div className="space-y-6">
            {/* Board */}
            <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Board</h3>
                <Button variant="ghost" size="sm" className="text-gray-400">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      F
                    </div>
                    <div>
                      <div className="text-sm font-medium">FFB</div>
                      <div className="text-xs text-gray-500">Facebook Inc.</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-400">$ 42.21</div>
                    <div className="text-xs text-red-400">-21.2%</div>
                  </div>
                  <div className="w-12 h-6">
                    <svg className="w-full h-full">
                      <path d="M0,15 Q3,5 6,10 T12,8" stroke="rgb(239, 68, 68)" strokeWidth="1" fill="none"/>
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      V
                    </div>
                    <div>
                      <div className="text-sm font-medium">VSA</div>
                      <div className="text-xs text-gray-500">Visa Inc.</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-400">$ 42.21</div>
                    <div className="text-xs text-green-400">+21.2%</div>
                  </div>
                  <div className="w-12 h-6">
                    <svg className="w-full h-full">
                      <path d="M0,15 Q3,10 6,5 T12,3" stroke="rgb(34, 197, 94)" strokeWidth="1" fill="none"/>
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <div>
                      <div className="text-sm font-medium">MST</div>
                      <div className="text-xs text-gray-500">Master</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-400">$ 42.21</div>
                    <div className="text-xs text-red-400">-21.2%</div>
                  </div>
                  <div className="w-12 h-6">
                    <svg className="w-full h-full">
                      <path d="M0,5 Q3,15 6,10 T12,12" stroke="rgb(239, 68, 68)" strokeWidth="1" fill="none"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Balance Components */}
            <BalanceBox />
            
            <ResidualBalanceBox />
          </div>
        </div>

        {/* Crypto Charts Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6 text-white">📊 Market Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bitcoin Chart */}
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ₿
                  </div>
                  <h3 className="font-semibold text-sm">Bitcoin (BTC)</h3>
                </div>
              </div>
              <div className="p-4">
                <TradingChart />
              </div>
            </div>

            {/* Ethereum Chart */}
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    Ξ
                  </div>
                  <h3 className="font-semibold text-sm">Ethereum (ETH)</h3>
                </div>
              </div>
              <div className="p-4">
                <EthereumChart />
              </div>
            </div>

            {/* Solana Chart */}
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ◎
                  </div>
                  <h3 className="font-semibold text-sm">Solana (SOL)</h3>
                </div>
              </div>
              <div className="p-4">
                <SolanaChart />
              </div>
            </div>

            {/* Cardano Chart */}
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    A
                  </div>
                  <h3 className="font-semibold text-sm">Cardano (ADA)</h3>
                </div>
              </div>
              <div className="p-4">
                <CardanoChart />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="mt-8">
          <div className="bg-[#1a1f2e] rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Latest Arbitrage Operations</h3>
                <Button variant="ghost" size="sm" className="text-teal-400" onClick={() => navigate('/history')}>
                  See All
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0f1419] border-b border-gray-800">
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Operation</th>
                    <th className="px-6 py-3">Exchange</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Profit</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr className="hover:bg-gray-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <ArrowUpDown className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">BTC Arbitrage</div>
                          <div className="text-xs text-gray-500">Binance → Coinbase</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs text-gray-400">→</span>
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">$2,500.00</td>
                    <td className="px-6 py-4 text-green-400">+$7.50 (0.3%)</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Completed
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(Date.now() - 300000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                  
                  <tr className="hover:bg-gray-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <ArrowUpDown className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">ETH Arbitrage</div>
                          <div className="text-xs text-gray-500">Kraken → Binance</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-gray-400">→</span>
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">$1,800.00</td>
                    <td className="px-6 py-4 text-green-400">+$4.32 (0.24%)</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Completed
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(Date.now() - 600000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>

                  <tr className="hover:bg-gray-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <ArrowUpDown className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">SOL Arbitrage</div>
                          <div className="text-xs text-gray-500">FTX → Binance</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
                        <span className="text-xs text-gray-400">→</span>
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">$950.00</td>
                    <td className="px-6 py-4 text-yellow-400">+$2.85 (0.3%)</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Processing
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(Date.now() - 120000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>

                  <tr className="hover:bg-gray-800/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <ArrowUpDown className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">ADA Arbitrage</div>
                          <div className="text-xs text-gray-500">Coinbase → Kraken</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-400">→</span>
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">$1,200.00</td>
                    <td className="px-6 py-4 text-green-400">+$3.60 (0.3%)</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Completed
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(Date.now() - 900000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;