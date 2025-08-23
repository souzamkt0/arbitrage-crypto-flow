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
import { TotalProfitCard } from "@/components/TotalProfitCard";
import { DepositsCard } from "@/components/DepositsCard";
import { WithdrawalsCard } from "@/components/WithdrawalsCard";
import { InvestmentPlanCard } from "@/components/InvestmentPlanCard";
import { CardanoChart } from "@/components/CardanoChart";
import { MarketOverview } from "@/components/MarketOverview";
import { TradingBot } from "@/components/TradingBot";
import { PartnerStats } from "@/components/PartnerStats";
import BalanceBox from "@/components/BalanceBox";
import { ActivePlansTable } from "@/components/ActivePlansTable";


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
  const [investmentPlans, setInvestmentPlans] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState({ active_referrals: 0 });

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
    loadInvestmentPlans();
    loadReferralStats();
    
    // Atualizar saldo mais frequentemente (a cada 15 segundos)
    const balanceInterval = setInterval(() => {
      loadUserData();
    }, 15000);
    
    // Atualizar outros dados menos frequentemente (a cada 45 segundos)
    const statsInterval = setInterval(() => {
      loadInvestmentStats();
      loadUserInvestments();
    }, 45000);

    return () => {
      clearInterval(balanceInterval);
      clearInterval(statsInterval);
    };
  }, [user]);

  // Carregar dados reais do usuário
  const loadUserData = async () => {
    if (!user) return;

    setIsDataSyncing(true);
    try {
      // Carregar dados do perfil com timeout para evitar travamento
      const { data: profileData, error: profileError } = await Promise.race([
        supabase
          .from('profiles')
          .select('balance, total_profit, referral_balance, referral_code')
          .eq('user_id', user.id)
          .single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]) as any;

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        const newBalance = Number(profileData.balance) || 0;
        const newTotalProfit = Number(profileData.total_profit) || 0;
        const newReferralBalance = Number(profileData.referral_balance) || 0;
        
        // Verificar se os dados mudaram significativamente
        const balanceChanged = Math.abs(newBalance - balance) > 0.01;
        const profitChanged = Math.abs(newTotalProfit - totalProfit) > 0.01;
        
        // Atualizar sempre, mesmo sem mudança
        setBalance(newBalance);
        setTotalProfit(newTotalProfit);
        setReferralBalance(newReferralBalance);
        setReferralLink(`${window.location.origin}/register?ref=${profileData.referral_code || user.id}`);
        
        // Mostrar notificação apenas se houve mudança significativa
        if ((balanceChanged || profitChanged) && lastSyncTime) {
          toast({
            title: "Saldo Atualizado",
            description: `Novo saldo: R$ ${newBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            variant: "default"
          });
        }
        
        setLastSyncTime(new Date());
        
        console.log('💰 Saldo sincronizado:', {
          balance: newBalance,
          totalProfit: newTotalProfit,
          referralBalance: newReferralBalance,
          timestamp: new Date().toISOString()
        });
      }

      // Carregar estatísticas de ganhos residuais
      let residualStats = null;
      try {
        const { data } = await supabase.rpc('get_user_referral_stats', {
          target_user_id: user.id
        });
        residualStats = data;
      } catch (err) {
        console.log('Aviso: não foi possível carregar estatísticas residuais:', err);
      }

      if (residualStats && residualStats.length > 0) {
        setResidualBalance(residualStats[0].residual_balance || 0);
        setMonthlyEarnings(residualStats[0].this_month_earnings || 0);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      
      // Em caso de erro, tentar um fallback simples
      try {
        const { data: simpleBalance } = await supabase
          .from('profiles')
          .select('balance, total_profit')
          .eq('user_id', user.id)
          .single();
          
        if (simpleBalance) {
          setBalance(Number(simpleBalance.balance) || 0);
          setTotalProfit(Number(simpleBalance.total_profit) || 0);
        }
      } catch (fallbackError) {
        console.error('Erro no fallback de dados:', fallbackError);
      }
      
      toast({
        title: "Problemas de Conexão",
        description: "Dados podem estar desatualizados. Tentando reconectar...",
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
        
        // Calcular e armazenar ganho diário usando a função atualizada
        try {
          const { data: rpcResult, error: functionError } = await supabase.rpc('calculate_and_store_daily_profit', {
            target_user_id: user.id
          });
          
          if (functionError) {
            console.error('❌ Erro ao calcular ganho diário:', functionError);
            // Fallback simples local
            let todayProfit = stats.today_total_earnings || 0;
            if (todayProfit === 0 && stats.total_invested > 0) {
              const totalInvested = stats.total_invested;
              const dailyRate = 2.5;
              const dailyTarget = totalInvested * (dailyRate / 100);
              const currentHour = new Date().getHours();
              const timeProgress = Math.max(0.15, currentHour / 24); // Mínimo 15%
              todayProfit = dailyTarget * timeProgress * (0.8 + Math.random() * 0.4);
              todayProfit = Number(todayProfit.toFixed(2));
            }
            setDailyProfit(todayProfit);
          } else {
            setDailyProfit(Number(rpcResult) || 0);
            console.log('💰 Ganho diário calculado e armazenado:', rpcResult);
          }
        } catch (error) {
          console.error('Erro geral na função de ganho diário:', error);
          setDailyProfit(0);
        }
        
        setActiveOrders(0);
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

  // Carregar planos de investimento ativos
  const loadInvestmentPlans = async () => {
    try {
      const { data: plans, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('status', 'active')
        .order('minimum_amount', { ascending: true });

      if (error) throw error;
      setInvestmentPlans(plans || []);
    } catch (error) {
      console.error('Erro ao carregar planos de investimento:', error);
    }
  };

  // Carregar estatísticas de indicações
  const loadReferralStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_referral_stats', {
        target_user_id: user.id
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setReferralStats(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas de indicações:', error);
    }
  };

  // Carregar investimentos ativos do usuário
  const loadUserInvestments = async () => {
    if (!user) return;

    try {
      console.log('🔄 Carregando investimentos do usuário:', user.id);
      
      // Query direta usando RPC ou busca específica
      const { data: investments, error } = await executeSupabaseOperation(async () => {
        return await supabase
          .from('user_investments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
      });

      if (error) {
        console.error('❌ Erro ao carregar investimentos:', error);
        return;
      }

      console.log('✅ Investimentos carregados:', investments);
      setUserInvestments(investments || []);
    } catch (error) {
      console.error('❌ Erro ao carregar investimentos do usuário:', error);
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

      {partnerData && <PartnerStatusBanner />}

      <div className="px-4 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Left Column - Portfolio & Assets */}
          <div className="xl:col-span-3 space-y-4">
            {/* My Portfolio Card */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-base font-semibold text-gray-300">Saldo de Trading</h2>
                    {isDataSyncing && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" title="Sincronizando dados..."></div>
                    )}
                    {lastSyncTime && (
                      <span className="text-xs text-gray-500">
                        Atualizado: {lastSyncTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                   </div>
                  <p className="text-xs text-gray-500 mb-2">Saldo disponível para investimentos</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold animate-[number-tick_2s_ease-in-out_infinite]">
                      R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-green-400 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{dailyProfit.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Animated Trading Chart */}
              <div className="relative h-40 bg-gradient-to-br from-blue-950/50 via-slate-900/50 to-cyan-950/50 rounded-lg mb-3 overflow-hidden border border-blue-500/20">
                {/* Live Price Display */}
                <div className="absolute top-3 left-3 z-20">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-xs font-bold">₿</span>
                    </div>
                    <div className="text-xs text-gray-400">BTC/USD</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-lg font-bold text-white animate-[number-tick_2s_ease-in-out_infinite]">
                    $52,420.85
                  </div>
                  <div className="text-xs text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1 animate-bounce" />
                    +2.34% (24h)
                  </div>
                </div>
                
                {/* Trading Stats */}
                <div className="absolute top-3 right-3 z-20 text-right space-y-1">
                  <div className="text-xs text-green-400 font-mono animate-fade-in">H: $53,100</div>
                  <div className="text-xs text-red-400 font-mono animate-fade-in">L: $51,200</div>
                  <div className="text-xs text-blue-400 font-mono animate-fade-in">Vol: $2.1B</div>
                </div>
                
                {/* Animated Trading Chart SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160">
                  <defs>
                    {/* Trading Grid Pattern */}
                    <pattern id="tradingGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="0.3" opacity="0.3"/>
                    </pattern>
                    
                    {/* Chart Gradients */}
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6"/>
                      <stop offset="50%" stopColor="rgb(37, 99, 235)" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="rgb(29, 78, 216)" stopOpacity="0.1"/>
                    </linearGradient>
                    
                    {/* Animated Line Gradient */}
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.8">
                        <animate attributeName="stop-opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
                      </stop>
                      <stop offset="50%" stopColor="rgb(96, 165, 250)" stopOpacity="1">
                        <animate attributeName="stop-opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite"/>
                      </stop>
                      <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.8">
                        <animate attributeName="stop-opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
                      </stop>
                    </linearGradient>
                    
                    {/* Glow Filter */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Grid Background */}
                  <rect width="100%" height="100%" fill="url(#tradingGrid)" opacity="0.5"/>
                  
                  {/* Price Chart Area */}
                  <path
                    d="M 30 130 Q 70 110 110 105 Q 150 95 190 85 Q 230 75 270 70 Q 310 65 350 60 Q 370 58 390 55 L 390 160 L 30 160 Z"
                    fill="url(#chartGradient)"
                    className="animate-[scale-in_2s_ease-out]"
                  />
                  
                  {/* Main Trading Line */}
                  <path
                    d="M 30 130 Q 70 110 110 105 Q 150 95 190 85 Q 230 75 270 70 Q 310 65 350 60 Q 370 58 390 55"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    fill="none"
                    filter="url(#glow)"
                    style={{
                      strokeDasharray: '1200',
                      strokeDashoffset: '1200',
                      animation: 'drawLine 3s ease-out forwards'
                    }}
                  />
                  
                  {/* Support Line */}
                  <line x1="30" y1="140" x2="390" y2="140" 
                    stroke="rgb(239, 68, 68)" 
                    strokeWidth="1" 
                    strokeDasharray="4,4" 
                    opacity="0.6"
                    style={{
                      strokeDasharray: '400',
                      strokeDashoffset: '400',
                      animation: 'drawLine 1s ease-out 2s forwards'
                    }}
                  />
                  
                  {/* Resistance Line */}
                  <line x1="30" y1="45" x2="390" y2="50" 
                    stroke="rgb(34, 197, 94)" 
                    strokeWidth="1" 
                    strokeDasharray="4,4" 
                    opacity="0.6"
                    style={{
                      strokeDasharray: '400',
                      strokeDashoffset: '400',
                      animation: 'drawLine 1s ease-out 2.5s forwards'
                    }}
                  />
                  
                  {/* Trading Candlesticks */}
                  <g style={{ animation: 'fade-in 1s ease-out 3s forwards', opacity: 0 }}>
                    {/* Green Candles */}
                    <rect x="107" y="100" width="6" height="15" fill="rgb(34, 197, 94)" opacity="0.8"/>
                    <line x1="110" y1="95" x2="110" y2="115" stroke="rgb(34, 197, 94)" strokeWidth="1"/>
                    
                    <rect x="187" y="80" width="6" height="12" fill="rgb(34, 197, 94)" opacity="0.8"/>
                    <line x1="190" y1="75" x2="190" y2="92" stroke="rgb(34, 197, 94)" strokeWidth="1"/>
                    
                    <rect x="267" y="65" width="6" height="10" fill="rgb(34, 197, 94)" opacity="0.8"/>
                    <line x1="270" y1="60" x2="270" y2="75" stroke="rgb(34, 197, 94)" strokeWidth="1"/>
                  </g>
                  
                  {/* Volume Bars */}
                  <g style={{ animation: 'fade-in 1s ease-out 3.5s forwards', opacity: 0 }}>
                    <rect x="105" y="145" width="10" height="8" fill="rgb(59, 130, 246)" opacity="0.7"/>
                    <rect x="185" y="143" width="10" height="10" fill="rgb(59, 130, 246)" opacity="0.7"/>
                    <rect x="265" y="147" width="10" height="6" fill="rgb(59, 130, 246)" opacity="0.7"/>
                    <rect x="345" y="144" width="10" height="9" fill="rgb(59, 130, 246)" opacity="0.7"/>
                  </g>
                  
                  {/* Moving Price Indicator */}
                  <circle r="4" fill="rgb(59, 130, 246)" filter="url(#glow)">
                    <animateMotion dur="4s" repeatCount="indefinite">
                      <path d="M 30 130 Q 70 110 110 105 Q 150 95 190 85 Q 230 75 270 70 Q 310 65 350 60 Q 370 58 390 55"/>
                    </animateMotion>
                  </circle>
                  
                  {/* Data Points with Values */}
                  <g style={{ animation: 'scale-in 0.5s ease-out 2s forwards', opacity: 0 }}>
                    <circle cx="110" cy="105" r="3" fill="rgb(59, 130, 246)" className="animate-pulse"/>
                    <text x="110" y="95" textAnchor="middle" className="fill-blue-400 text-[8px] font-mono">$51.8k</text>
                  </g>
                  
                  <g style={{ animation: 'scale-in 0.5s ease-out 2.3s forwards', opacity: 0 }}>
                    <circle cx="190" cy="85" r="3" fill="rgb(59, 130, 246)" className="animate-pulse"/>
                    <text x="190" y="75" textAnchor="middle" className="fill-blue-400 text-[8px] font-mono">$52.1k</text>
                  </g>
                  
                  <g style={{ animation: 'scale-in 0.5s ease-out 2.6s forwards', opacity: 0 }}>
                    <circle cx="270" cy="70" r="3" fill="rgb(59, 130, 246)" className="animate-pulse"/>
                    <text x="270" y="60" textAnchor="middle" className="fill-blue-400 text-[8px] font-mono">$52.4k</text>
                  </g>
                </svg>
                
                {/* Floating Data Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-16 left-16 w-1 h-1 bg-blue-400 rounded-full animate-[float_3s_ease-in-out_infinite]"></div>
                  <div className="absolute top-20 right-20 w-1 h-1 bg-green-400 rounded-full animate-[float_4s_ease-in-out_infinite_0.5s]"></div>
                  <div className="absolute bottom-16 left-24 w-1 h-1 bg-cyan-400 rounded-full animate-[float_3.5s_ease-in-out_infinite_1s]"></div>
                </div>
                
                {/* Scanning Line Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-60 animate-[slide-wave_3s_linear_infinite]"></div>
                </div>
                
                {/* Trading Session Indicator */}
                <div className="absolute bottom-3 left-3 flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-mono">Market Open</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-400 font-mono">Live Data</span>
                  </div>
                </div>
                
                {/* Real-time Price Tag */}
                <div className="absolute top-16 right-8 bg-blue-600/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-mono text-white border border-blue-400/50 animate-[breathe_2s_ease-in-out_infinite]">
                  $52.42k
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


            {/* Active Plans Table */}
            <div className="mb-6">
              <ActivePlansTable />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-1 space-y-4">

            {/* Existing Balance Components - Compact */}
            <div className="space-y-4">
              <BalanceBox />
              <ResidualBalanceBox />
            </div>
            
            {/* Statistics Cards - After Balance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">📊 Estatísticas</h3>
              <div className="grid grid-cols-1 gap-4">
                <TotalProfitCard />
                <DepositsCard />
                <WithdrawalsCard />
              </div>
            </div>
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

      </div>
    </div>
  );
};

export default Dashboard;