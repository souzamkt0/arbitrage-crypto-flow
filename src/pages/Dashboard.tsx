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
    
    // Atualizar dados reais periodicamente (a cada 30 segundos)
    const interval = setInterval(() => {
      loadUserData();
      loadInvestmentStats();
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
        setActiveOrders(stats.active_investments || 0);
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
        .single();

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
      
      {/* Partner Status Banner - Top Priority */}
      {partnerData && <PartnerStatusBanner />}
      
      {/* Partner Congratulations Box - Prominent Position */}
      <div className="container mx-auto px-4 py-4">
        <PartnerStats />
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Alphabot Trading - Topo */}
        <TradingBot
          botActive={botActive}
          setBotActive={setBotActive}
          alphabotData={alphabotData}
          isUpdatingAlphabot={isUpdatingAlphabot}
          updateAlphaBot={updateAlphaBot}
        />
        
        {/* Boxes de Saldos e Informações - Layout Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6">
          {/* Coluna Principal - Saldos */}
          <div className="xl:col-span-2 lg:col-span-1 space-y-6">
            {/* Balance Box Principal */}
            <BalanceBox onRefresh={() => {
              loadInvestmentStats();
              loadPartnerData();
            }} />
            
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

            {/* Link de Indicação */}
            <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Link className="h-5 w-5 text-blue-400" />
                  🎯 Sistema de Indicação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                  <Label className="text-sm text-gray-300 mb-2 block">Seu Link de Indicação:</Label>
                  <div className="flex gap-2">
                    <Input
                      value={referralLink || `${window.location.origin}/register?ref=${profile?.referral_code || profile?.username || 'user'}`}
                      readOnly
                      className="bg-slate-700/50 border-slate-600 text-white text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = referralLink || `${window.location.origin}/register?ref=${profile?.referral_code || profile?.username || 'user'}`;
                        navigator.clipboard.writeText(link);
                        toast({ title: "Link copiado!", description: "Link de indicação copiado para área de transferência" });
                      }}
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-800/40 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-400">{referralBalance?.toFixed(2) || '0.00'} USD</div>
                    <div className="text-xs text-gray-400">Saldo de Indicação</div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-400">{monthlyEarnings?.toFixed(2) || '0.00'} USD</div>
                    <div className="text-xs text-gray-400">Ganhos do Mês</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico Simplificado */}
            <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-600/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-400" />
                  📊 Histórico Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-600/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <div className="text-white text-sm font-medium">Operação BTC/USDT</div>
                        <div className="text-gray-400 text-xs">Lucro: +0.24%</div>
                      </div>
                    </div>
                    <div className="text-green-400 text-sm font-semibold">+$12.50</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-600/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="text-white text-sm font-medium">Depósito PIX</div>
                        <div className="text-gray-400 text-xs">Aprovado</div>
                      </div>
                    </div>
                    <div className="text-blue-400 text-sm font-semibold">+$100.00</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-600/30">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <div className="text-white text-sm font-medium">Indicação Ativa</div>
                        <div className="text-gray-400 text-xs">Comissão gerada</div>
                      </div>
                    </div>
                    <div className="text-purple-400 text-sm font-semibold">+$5.00</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-600/30">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/history')}
                    className="w-full border-slate-600/30 text-gray-300 hover:bg-slate-700/50"
                  >
                    Ver Histórico Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Gráficos e Market Overview */}
          <div className="xl:col-span-1 lg:col-span-1 space-y-6">
            <ResidualBalanceBox />
            <MarketOverview />
            
            {/* Gráficos Compactos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">📈 Análise de Mercado</h3>
              
              <Card className="bg-slate-800/50 border border-slate-600/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Bitcoin (BTC)</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <TradingChart />
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border border-slate-600/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Ethereum (ETH)</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <EthereumChart />
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border border-slate-600/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Solana (SOL)</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <SolanaChart />
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border border-slate-600/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Cardano (ADA)</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <CardanoChart />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;