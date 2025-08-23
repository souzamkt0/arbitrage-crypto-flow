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

      <div className="px-4 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Left Column - Portfolio & Assets */}
          <div className="xl:col-span-3 space-y-4">
            {/* My Portfolio Card */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-300 mb-1">My Portfolio</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className="text-xs text-green-400 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{dailyProfit.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Bitcoin Chart Area */}
              <div className="relative h-36 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-lg mb-3 overflow-hidden animate-[chart-glow_3s_ease-in-out_infinite] animate-[breathe_4s_ease-in-out_infinite]">
                <div className="absolute top-3 left-3 z-10 animate-fade-in">
                  <div className="text-xs text-gray-400 mb-1 animate-[float_3s_ease-in-out_infinite]">Bitcoin Performance</div>
                  <div className="text-sm font-bold text-white animate-[number-tick_2s_ease-in-out_infinite]">
                    $52,420.85
                  </div>
                  <div className="text-xs text-green-400 flex items-center animate-[trading-pulse_2s_ease-in-out_infinite]">
                    <TrendingUp className="w-3 h-3 mr-1 animate-[float_2s_ease-in-out_infinite]" />
                    +2.34% (24h)
                  </div>
                </div>
                
                {/* Valores nos pontos do gráfico */}
                <div className="absolute top-3 right-3 z-10 text-right animate-fade-in">
                  <div className="text-xs text-blue-400 font-mono">High: $53,100</div>
                  <div className="text-xs text-red-400 font-mono">Low: $51,200</div>
                </div>
                
                {/* Gráfico SVG animado estilo trading azul */}
                <svg className="absolute inset-0 w-full h-full animate-fade-in" viewBox="0 0 400 150">
                  <defs>
                    <linearGradient id="bitcoinBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4"/>
                      <stop offset="50%" stopColor="rgb(37, 99, 235)" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="rgb(29, 78, 216)" stopOpacity="0.1"/>
                    </linearGradient>
                    <linearGradient id="blueGlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0">
                        <animate attributeName="stop-opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/>
                      </stop>
                      <stop offset="50%" stopColor="rgb(96, 165, 250)" stopOpacity="0.8">
                        <animate attributeName="stop-opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
                      </stop>
                      <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0">
                        <animate attributeName="stop-opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/>
                      </stop>
                    </linearGradient>
                    
                    {/* Filtro de brilho */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Grid de fundo estilo trading */}
                  <defs>
                    <pattern id="tradingGrid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="0.5" opacity="0.2"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#tradingGrid)" />
                  
                  {/* Área preenchida com animação */}
                  <path
                    d="M 20 120 Q 60 90 100 85 Q 140 75 180 70 Q 220 65 260 60 Q 300 58 340 55 Q 360 54 380 52 L 380 150 L 20 150 Z"
                    fill="url(#bitcoinBlueGradient)"
                    className="animate-[scale-in_2s_ease-out]"
                  />
                  
                  {/* Linha principal com animação progressiva */}
                  <path
                    d="M 20 120 Q 60 90 100 85 Q 140 75 180 70 Q 220 65 260 60 Q 300 58 340 55 Q 360 54 380 52"
                    stroke="url(#blueGlowGradient)"
                    strokeWidth="3"
                    fill="none"
                    filter="url(#glow)"
                    className="animate-[drawLine_2.5s_ease-out_forwards]"
                    style={{
                      strokeDasharray: '1200',
                      strokeDashoffset: '1200'
                    }}
                  />
                  
                  {/* Linha de base em azul sólido */}
                  <path
                    d="M 20 120 Q 60 90 100 85 Q 140 75 180 70 Q 220 65 260 60 Q 300 58 340 55 Q 360 54 380 52"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2"
                    fill="none"
                    className="animate-[drawLine_2.5s_ease-out_0.3s_forwards]"
                    style={{
                      strokeDasharray: '1200',
                      strokeDashoffset: '1200'
                    }}
                  />
                  
                  {/* Pontos de dados com valores */}
                  <g className="animate-[scale-in_0.5s_ease-out_1.5s_forwards]">
                    <circle cx="100" cy="85" r="4" fill="rgb(59, 130, 246)" className="animate-pulse" 
                      style={{ animationDelay: '1.5s', animationDuration: '2s' }} />
                    <circle cx="100" cy="85" r="2" fill="rgb(255, 255, 255)" />
                    <text x="100" y="75" textAnchor="middle" className="fill-blue-400 text-[8px] font-mono">$51.8k</text>
                  </g>
                  
                  <g className="animate-[scale-in_0.5s_ease-out_1.8s_forwards]">
                    <circle cx="180" cy="70" r="4" fill="rgb(59, 130, 246)" className="animate-pulse"
                      style={{ animationDelay: '1.8s', animationDuration: '2s' }} />
                    <circle cx="180" cy="70" r="2" fill="rgb(255, 255, 255)" />
                    <text x="180" y="60" textAnchor="middle" className="fill-blue-400 text-[8px] font-mono">$52.1k</text>
                  </g>
                  
                  <g className="animate-[scale-in_0.5s_ease-out_2.1s_forwards]">
                    <circle cx="260" cy="60" r="4" fill="rgb(59, 130, 246)" className="animate-pulse"
                      style={{ animationDelay: '2.1s', animationDuration: '2s' }} />
                    <circle cx="260" cy="60" r="2" fill="rgb(255, 255, 255)" />
                    <text x="260" y="50" textAnchor="middle" className="fill-blue-400 text-[8px] font-mono">$52.4k</text>
                  </g>
                  
                  <g className="animate-[scale-in_0.5s_ease-out_2.4s_forwards]">
                    <circle cx="340" cy="55" r="4" fill="rgb(59, 130, 246)" className="animate-pulse"
                      style={{ animationDelay: '2.4s', animationDuration: '2s' }} />
                    <circle cx="340" cy="55" r="2" fill="rgb(255, 255, 255)" />
                    <text x="340" y="45" textAnchor="middle" className="fill-blue-400 text-[8px] font-mono">$52.6k</text>
                  </g>
                  
                  {/* Linha de suporte */}
                  <path
                    d="M 20 130 L 380 130"
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    fill="none"
                    opacity="0.5"
                    className="animate-[drawLine_1s_ease-out_3s_forwards]"
                    style={{
                      strokeDasharray: '400',
                      strokeDashoffset: '400'
                    }}
                  />
                  <text x="385" y="134" className="fill-red-400 text-[8px] font-mono">Support: $51.2k</text>
                  
                  {/* Linha de resistência */}
                  <path
                    d="M 20 40 L 380 45"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    fill="none"
                    opacity="0.5"
                    className="animate-[drawLine_1s_ease-out_3.2s_forwards]"
                    style={{
                      strokeDasharray: '400',
                      strokeDashoffset: '400'
                    }}
                  />
                  <text x="385" y="49" className="fill-green-400 text-[8px] font-mono">Resistance: $53.1k</text>
                  
                  {/* Candlesticks estilo trading */}
                  <g className="animate-[fade-in_1s_ease-out_2.8s_forwards]" opacity="0">
                    {/* Candle 1 - Verde (alta) */}
                    <line x1="120" y1="95" x2="120" y2="75" stroke="rgb(34, 197, 94)" strokeWidth="1"/>
                    <rect x="117" y="85" width="6" height="10" fill="rgb(34, 197, 94)" />
                    
                    {/* Candle 2 - Verde (alta) */}
                    <line x1="200" y1="80" x2="200" y2="65" stroke="rgb(34, 197, 94)" strokeWidth="1"/>
                    <rect x="197" y="70" width="6" height="10" fill="rgb(34, 197, 94)" />
                    
                    {/* Candle 3 - Verde (alta) */}
                    <line x1="280" y1="70" x2="280" y2="55" stroke="rgb(34, 197, 94)" strokeWidth="1"/>
                    <rect x="277" y="60" width="6" height="10" fill="rgb(34, 197, 94)" />
                  </g>
                  
                  {/* Volume bars */}
                  <g className="animate-[scale-in_1s_ease-out_3.5s_forwards]" opacity="0">
                    <rect x="95" y="140" width="10" height="8" fill="rgb(59, 130, 246)" opacity="0.6"/>
                    <rect x="175" y="138" width="10" height="10" fill="rgb(59, 130, 246)" opacity="0.6"/>
                    <rect x="255" y="142" width="10" height="6" fill="rgb(59, 130, 246)" opacity="0.6"/>
                    <rect x="335" y="139" width="10" height="9" fill="rgb(59, 130, 246)" opacity="0.6"/>
                  </g>
                </svg>
                
                {/* Overlay com efeito de brilho azul */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 animate-shine"></div>
                
                {/* Wave effect animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent animate-[slide-wave_4s_ease-in-out_infinite]" 
                       style={{ top: '60%', animationDelay: '1s' }}></div>
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400/40 to-transparent animate-[slide-wave_5s_ease-in-out_infinite]" 
                       style={{ top: '80%', animationDelay: '2s' }}></div>
                </div>
                
                {/* Floating price particles */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute text-xs text-blue-400/60 animate-[data-flow_8s_linear_infinite]" 
                       style={{ top: '40%', left: '-20px', animationDelay: '1s' }}>+2.34%</div>
                  <div className="absolute text-xs text-green-400/60 animate-[data-flow_10s_linear_infinite]" 
                       style={{ top: '65%', left: '-20px', animationDelay: '3s' }}>▲ $52.4k</div>
                  <div className="absolute text-xs text-blue-300/60 animate-[data-flow_12s_linear_infinite]" 
                       style={{ top: '30%', left: '-20px', animationDelay: '5s' }}>Vol: 2.1B</div>
                </div>
                
                {/* Indicadores de mercado */}
                <div className="absolute bottom-3 left-3 flex space-x-4 text-xs animate-fade-in" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-mono">24h Vol: $2.1B</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-400 font-mono">Market Cap: $1.03T</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* BTC Card */}
              <div className="bg-[#1a1f2e] rounded-lg p-3 border border-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ₿
                  </div>
                  <div>
                    <div className="text-xs text-gray-300 font-medium">BTC</div>
                    <div className="text-xs text-gray-500">Bitcoin</div>
                  </div>
                </div>
                <div className="text-lg font-bold mb-1">$ 51,020</div>
                <div className="text-xs text-red-400 flex items-center">
                  ↓ 20.4%
                </div>
              </div>

              {/* ETH Card */}
              <div className="bg-[#1a1f2e] rounded-lg p-3 border border-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    Ξ
                  </div>
                  <div>
                    <div className="text-xs text-gray-300 font-medium">ETH</div>
                    <div className="text-xs text-gray-500">Ethereum</div>
                  </div>
                </div>
                <div className="text-lg font-bold mb-1">$ 3,020</div>
                <div className="text-xs text-green-400 flex items-center">
                  ↑ 20.4%
                </div>
              </div>

              {/* SOL Card */}
              <div className="bg-[#1a1f2e] rounded-lg p-3 border border-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ◎
                  </div>
                  <div>
                    <div className="text-xs text-gray-300 font-medium">SOL</div>
                    <div className="text-xs text-gray-500">Solana</div>
                  </div>
                </div>
                <div className="text-lg font-bold mb-1">$ 220</div>
                <div className="text-xs text-green-400 flex items-center">
                  ↑ 15.2%
                </div>
              </div>

              {/* ADA Card */}
              <div className="bg-[#1a1f2e] rounded-lg p-3 border border-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    A
                  </div>
                  <div>
                    <div className="text-xs text-gray-300 font-medium">ADA</div>
                    <div className="text-xs text-gray-500">Cardano</div>
                  </div>
                </div>
                <div className="text-lg font-bold mb-1">$ 0.85</div>
                <div className="text-xs text-green-400 flex items-center">
                  ↑ 8.2%
                </div>
              </div>
            </div>

            {/* Trading Tools */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#1a1f2e] rounded-lg p-3 border border-gray-800 text-center cursor-pointer hover:bg-[#232834] transition-colors" onClick={() => navigate('/deposit')}>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ArrowUpDown className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-sm font-medium mb-1">Deposit</div>
                <div className="text-xs text-gray-500">Add Funds</div>
              </div>
              
              <div className="bg-[#1a1f2e] rounded-lg p-3 border border-gray-800 text-center cursor-pointer hover:bg-[#232834] transition-colors" onClick={() => navigate('/withdrawal')}>
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-sm font-medium mb-1">Withdraw</div>
                <div className="text-xs text-gray-500">Cash Out</div>
              </div>
              
              <div className="bg-[#1a1f2e] rounded-lg p-3 border border-gray-800 text-center cursor-pointer hover:bg-[#232834] transition-colors" onClick={() => navigate('/history')}>
                <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-pink-400" />
                </div>
                <div className="text-sm font-medium mb-1">History</div>
                <div className="text-xs text-gray-500">Transactions</div>
              </div>
              
              <div className="bg-[#1a1f2e] rounded-lg p-3 border border-gray-800 text-center cursor-pointer hover:bg-[#232834] transition-colors" onClick={() => navigate('/market')}>
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-5 h-5 text-teal-400" />
                </div>
                <div className="text-sm font-medium mb-1">Analysis</div>
                <div className="text-xs text-gray-500">Markets</div>
              </div>
            </div>

            {/* Active Plans - Compact */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Active Plans</h3>
                <Button variant="ghost" size="sm" className="text-teal-400 text-xs" onClick={() => navigate('/active-plans')}>
                  See All
                </Button>
              </div>
              
              <div className="space-y-3">
                {userInvestments.length > 0 ? (
                  userInvestments.slice(0, 2).map((investment, index) => (
                    <div key={investment.id} className="flex items-center justify-between p-3 bg-[#0f1419] rounded-lg border border-gray-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                          <BarChart3 className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-medium">Plan ${investment.amount?.toFixed(2) || '0.00'}</div>
                          <div className="text-xs text-gray-500">{(investment.daily_rate * 100)?.toFixed(2) || '0.00'}% daily</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-green-400">+${investment.total_earned?.toFixed(2) || '0.00'}</div>
                        <div className="text-xs text-gray-500">{investment.days_remaining || 0} days</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <div className="text-gray-400 text-xs mb-2">No active plans</div>
                    <Button size="sm" onClick={() => navigate('/investments')} className="bg-teal-500 hover:bg-teal-600 text-xs">
                      Start Investing
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            {/* Board - Compact */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Board</h3>
                <Button variant="ghost" size="sm" className="text-gray-400">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      F
                    </div>
                    <div>
                      <div className="text-xs font-medium">FFB</div>
                      <div className="text-xs text-gray-500">Facebook</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-green-400">$ 42.21</div>
                    <div className="text-xs text-red-400">-21.2%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      V
                    </div>
                    <div>
                      <div className="text-xs font-medium">VSA</div>
                      <div className="text-xs text-gray-500">Visa</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-green-400">$ 42.21</div>
                    <div className="text-xs text-green-400">+21.2%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      M
                    </div>
                    <div>
                      <div className="text-xs font-medium">MST</div>
                      <div className="text-xs text-gray-500">Master</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-green-400">$ 42.21</div>
                    <div className="text-xs text-red-400">-21.2%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Balance Components - Compact */}
            <div className="space-y-4">
              <BalanceBox />
              <ResidualBalanceBox />
            </div>
          </div>
        </div>

        {/* Crypto Charts Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6 text-white">📊 Market Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bitcoin Chart */}
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden animate-[chart-glow_3s_ease-in-out_infinite]">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-[glow_2s_ease-in-out_infinite_alternate]">
                      ₿
                    </div>
                    <h3 className="font-semibold text-sm">Bitcoin (BTC)</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">LIVE</span>
                  </div>
                </div>
                
                {/* Price Info */}
                <div className="mt-3">
                  <div className="text-lg font-bold text-white animate-[number-tick_2s_ease-in-out_infinite]">
                    $52,420.85
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-400 animate-[trading-pulse_2s_ease-in-out_infinite]">
                    <TrendingUp className="h-3 w-3 animate-[float_2s_ease-in-out_infinite]" />
                    <span>+2.34%</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {/* Trading Chart Container */}
                <div className="relative h-32 bg-gradient-to-br from-orange-500/10 to-yellow-600/10 rounded-lg border border-orange-500/20 overflow-hidden animate-[breathe_4s_ease-in-out_infinite]">
                  {/* SVG Chart */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 120">
                    <defs>
                      <linearGradient id="btcGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity="0.4"/>
                        <stop offset="50%" stopColor="rgb(234, 88, 12)" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="rgb(194, 65, 12)" stopOpacity="0.1"/>
                      </linearGradient>
                      
                      <linearGradient id="btcFlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity="0">
                          <animate attributeName="stop-opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/>
                        </stop>
                        <stop offset="50%" stopColor="rgb(251, 146, 60)" stopOpacity="0.8">
                          <animate attributeName="stop-opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
                        </stop>
                        <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0">
                          <animate attributeName="stop-opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite"/>
                        </stop>
                      </linearGradient>
                      
                      <filter id="btcGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Grid Pattern */}
                    <pattern id="btcGrid" width="15" height="15" patternUnits="userSpaceOnUse">
                      <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgb(249, 115, 22)" strokeWidth="0.3" opacity="0.2"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#btcGrid)" className="animate-[fade-in_2s_ease-out]" />
                    
                    {/* Support/Resistance Lines */}
                    <line x1="0" y1="40" x2="100%" y2="40" stroke="rgb(34, 197, 94)" strokeWidth="1" opacity="0.5" strokeDasharray="3,3">
                      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite"/>
                    </line>
                    <line x1="0" y1="80" x2="100%" y2="80" stroke="rgb(239, 68, 68)" strokeWidth="1" opacity="0.5" strokeDasharray="3,3">
                      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite"/>
                    </line>
                    
                    {/* Area Fill */}
                    <polygon
                      fill="url(#btcGradient)"
                      points="15,90 45,85 75,80 105,75 135,70 165,65 195,60 225,55 255,50 285,45 300,42 300,120 15,120"
                      className="animate-[fill-area_3s_ease-out_1.5s_forwards]"
                      opacity="0"
                    />
                    
                    {/* Main Price Line */}
                    <polyline
                      fill="none"
                      stroke="url(#btcFlowGradient)"
                      strokeWidth="3"
                      filter="url(#btcGlow)"
                      points="15,90 45,85 75,80 105,75 135,70 165,65 195,60 225,55 255,50 285,45 300,42"
                      className="animate-[draw-line_4s_ease-out_1s_forwards]"
                      strokeDasharray="800"
                      strokeDashoffset="800"
                    />
                    
                    {/* Data Points */}
                    <g className="animate-[scale-in_0.5s_ease-out_2.5s_forwards]" opacity="0">
                      <circle cx="105" cy="75" r="3" fill="rgb(249, 115, 22)" className="animate-[pulse-glow_2s_ease-in-out_infinite]"/>
                      <circle cx="165" cy="65" r="3" fill="rgb(249, 115, 22)" className="animate-[pulse-glow_2s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}/>
                      <circle cx="225" cy="55" r="3" fill="rgb(249, 115, 22)" className="animate-[pulse-glow_2s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}/>
                      <circle cx="285" cy="45" r="4" fill="rgb(251, 146, 60)" className="animate-[pulse-glow_2s_ease-in-out_infinite]"/>
                    </g>
                    
                    {/* Volume Bars */}
                    <g className="animate-[fade-in_1s_ease-out_3s_forwards]" opacity="0">
                      <rect x="40" y="105" width="6" height="10" fill="rgb(249, 115, 22)" opacity="0.6" className="animate-[grow-bar_0.5s_ease-out_3.2s_forwards]" transform="scaleY(0)" transformOrigin="bottom"/>
                      <rect x="70" y="100" width="6" height="15" fill="rgb(249, 115, 22)" opacity="0.6" className="animate-[grow-bar_0.5s_ease-out_3.4s_forwards]" transform="scaleY(0)" transformOrigin="bottom"/>
                      <rect x="100" y="108" width="6" height="7" fill="rgb(249, 115, 22)" opacity="0.6" className="animate-[grow-bar_0.5s_ease-out_3.6s_forwards]" transform="scaleY(0)" transformOrigin="bottom"/>
                      <rect x="130" y="102" width="6" height="13" fill="rgb(249, 115, 22)" opacity="0.6" className="animate-[grow-bar_0.5s_ease-out_3.8s_forwards]" transform="scaleY(0)" transformOrigin="bottom"/>
                    </g>
                    
                    {/* Moving Price Indicator */}
                    <g className="animate-[price-wave_6s_linear_infinite]">
                      <line x1="0" y1="42" x2="15" y2="42" stroke="rgb(34, 197, 94)" strokeWidth="2" opacity="0.8"/>
                      <circle cx="15" cy="42" r="2" fill="rgb(34, 197, 94)" opacity="0.8"/>
                    </g>
                  </svg>
                  
                  {/* Wave Effects */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent animate-[slide-wave_5s_ease-in-out_infinite]" 
                         style={{ top: '40%', animationDelay: '1s' }}></div>
                  </div>
                  
                  {/* Floating Data */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute text-xs text-orange-400/60 animate-[data-flow_9s_linear_infinite]" 
                         style={{ top: '30%', left: '-15px', animationDelay: '2s' }}>₿ +2.34%</div>
                    <div className="absolute text-xs text-green-400/60 animate-[data-flow_11s_linear_infinite]" 
                         style={{ top: '60%', left: '-15px', animationDelay: '4s' }}>$52.4k</div>
                  </div>
                  
                  {/* Price Tag */}
                  <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm border border-orange-500/30 rounded px-2 py-1 animate-[bounce-in_1s_ease-out_4s_both] opacity-0">
                    <div className="text-xs font-bold text-orange-400">$52,420</div>
                  </div>
                </div>
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