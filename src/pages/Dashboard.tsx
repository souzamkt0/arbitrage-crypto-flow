import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import axios from "axios";
import { realCoinMarketCapService, AlphaBotUpdate } from "@/services/realCoinMarketCapService";

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
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const [cryptoNews, setCryptoNews] = useState([]);
  const [performance24h, setPerformance24h] = useState({ percentage: 2.34, symbol: 'BTC', price: 43250 });
  const [lastPerformanceUpdate, setLastPerformanceUpdate] = useState(null);
  const [alphabotData, setAlphabotData] = useState<AlphaBotUpdate | null>(null);
   const [isUpdatingAlphabot, setIsUpdatingAlphabot] = useState(false);
   const [timeUntilUpdate, setTimeUntilUpdate] = useState({ hours: 24, minutes: 0 });
  const [communityMessages, setCommunityMessages] = useState([
    {
      id: 1,
      user: "João Silva",
      avatar: "JS",
      message: "Acabei de fazer um lucro de $2,500 com BTC! O bot está funcionando perfeitamente! 🚀",
      time: "2 min atrás",
      likes: 12,
      isVerified: true
    },
    {
      id: 2,
      user: "Maria Santos",
      avatar: "MS",
      message: "Primeira semana usando o sistema e já estou com +15% de lucro. Recomendo demais! 💎",
      time: "8 min atrás",
      likes: 8,
      isVerified: true
    },
    {
      id: 3,
      user: "Pedro Costa",
      avatar: "PC",
      message: "Alguém mais está vendo essa oportunidade em ETH? Parece promissora! 📈",
      time: "15 min atrás",
      likes: 5,
      isVerified: false
    },
    {
      id: 4,
      user: "Ana Oliveira",
      avatar: "AO",
      message: "Consegui pagar minhas contas do mês só com os lucros do trading! Obrigada comunidade! 🙏",
      time: "22 min atrás",
      likes: 18,
      isVerified: true
    },
    {
      id: 5,
      user: "Carlos Lima",
      avatar: "CL",
      message: "Dica: sempre configurem o stop loss, salvou minha operação hoje! ⚠️",
      time: "35 min atrás",
      likes: 14,
      isVerified: true
    }
  ]);



  // Função para atualizar o AlphaBot usando dados reais da CoinMarketCap
  const updateAlphaBot = async () => {
    setIsUpdatingAlphabot(true);
    try {
      const data = await realCoinMarketCapService.updateAlphaBot();
      setAlphabotData(data);
      toast({
        title: "AlphaBot Atualizado",
        description: "Dados atualizados com sucesso via CoinMarketCap API",
      });
    } catch (error) {
      console.error('Erro ao atualizar AlphaBot:', error);
      toast({
        title: "Erro na Atualização",
        description: "Não foi possível atualizar os dados do AlphaBot",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAlphabot(false);
    }
  };

  // Função para forçar atualização manual
  const forceUpdateAlphaBot = async () => {
    setIsUpdatingAlphabot(true);
    try {
      const data = await realCoinMarketCapService.forceUpdate();
      setAlphabotData(data);
      toast({
        title: "AlphaBot Atualizado Manualmente",
        description: "Nova atualização forçada com dados da CoinMarketCap",
      });
    } catch (error) {
      console.error('Erro ao forçar atualização:', error);
      toast({
        title: "Erro na Atualização",
        description: "Não foi possível forçar a atualização",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAlphabot(false);
    }
  };

  // Carregar dados do AlphaBot na inicialização
   useEffect(() => {
     updateAlphaBot();
     
     // Atualizar contador de tempo a cada minuto
     const timeInterval = setInterval(() => {
       const timeLeft = realCoinMarketCapService.getTimeUntilNextUpdate();
       setTimeUntilUpdate(timeLeft);
     }, 60000);
     
     // Verificar se precisa atualizar a cada 5 minutos
     const updateInterval = setInterval(() => {
       const currentData = realCoinMarketCapService.getCurrentAlphaBotData();
       if (currentData) {
         const now = Date.now();
         const elapsed = now - currentData.lastUpdate;
         const progress = Math.min((elapsed / (24 * 60 * 60 * 1000)) * 100, 100);
         
         setAlphabotData({
           ...currentData,
           progress
         });
         
         // Se passou 24h, atualizar automaticamente
         if (elapsed >= 24 * 60 * 60 * 1000) {
           updateAlphaBot();
         }
       }
     }, 5 * 60 * 1000);
     
     return () => {
       clearInterval(timeInterval);
       clearInterval(updateInterval);
     };
   }, []);

  // Carregar dados reais do usuário
  useEffect(() => {
    if (!profile) return;
    setBalance(profile.balance || 0);
    setTotalProfit(profile.total_profit || 0);
    setReferralBalance(profile.referral_balance || 0);
    setResidualBalance(profile.residual_balance || 0);
    setMonthlyEarnings(profile.monthly_earnings || 0);
    setDailyProfit(profile.earnings || 0);

    // Carregar dados de investimentos e operações
    const loadInvestments = async () => {
      const { data: investments } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', profile.user_id)
        .eq('status', 'active');

      const { data: operations } = await supabase
        .from('current_operations')
        .select('*')
        .in('user_investment_id', investments?.map(inv => inv.id) || []);

      setActiveOrders(operations?.length || 0);

      // Calcular saldo de trading baseado nas operações dos investimentos
      const loadTradingBalance = async () => {
        const { data: tradingHistory } = await supabase
          .from('trading_history')
          .select('profit')
          .eq('user_id', profile.user_id)
          .eq('status', 'completed')
          .in('type', ['investment_trading', 'arbitrage']); // Incluir operações de investimento e arbitragem

        const totalTradingProfit = tradingHistory?.reduce((sum, trade) => sum + (trade.profit || 0), 0) || 0;
        setTradingBalance(totalTradingProfit);
      };

      await loadTradingBalance();

      // Carregar total de depósitos (DigitoPay + USDT)
      const loadTotalDeposits = async () => {
        // Depósitos via DigitoPay (completed)
        const { data: digitopayDeposits } = await supabase
          .from('digitopay_transactions')
          .select('amount_brl')
          .eq('user_id', profile.user_id)
          .eq('type', 'deposit')
          .eq('status', 'completed');

        // Depósitos via USDT (completed)
        const { data: usdtDeposits } = await supabase
          .from('deposits')
          .select('amount_brl')
          .eq('user_id', profile.user_id)
          .eq('status', 'completed');

        const digitopayTotal = digitopayDeposits?.reduce((sum, deposit) => sum + (deposit.amount_brl || 0), 0) || 0;
        const usdtTotal = usdtDeposits?.reduce((sum, deposit) => sum + (deposit.amount_brl || 0), 0) || 0;
        
        setTotalDeposits(digitopayTotal + usdtTotal);
      };

      await loadTotalDeposits();

      // Gerar link de indicação único baseado no username
      if (profile.username) {
        setReferralLink(`${window.location.origin}/register/${profile.username}`);
      }
    };
    loadInvestments();

    // Atualizar saldo de trading a cada 30 segundos
    const tradingBalanceInterval = setInterval(async () => {
      if (profile?.user_id) {
        const { data: tradingHistory } = await supabase
          .from('trading_history')
          .select('profit')
          .eq('user_id', profile.user_id)
          .eq('status', 'completed')
          .in('type', ['investment_trading', 'arbitrage']); // Incluir operações de investimento e arbitragem

        const totalTradingProfit = tradingHistory?.reduce((sum, trade) => sum + (trade.profit || 0), 0) || 0;
        setTradingBalance(totalTradingProfit);

        // Atualizar total de depósitos
        const { data: digitopayDeposits } = await supabase
          .from('digitopay_transactions')
          .select('amount_brl')
          .eq('user_id', profile.user_id)
          .eq('type', 'deposit')
          .eq('status', 'completed');

        const { data: usdtDeposits } = await supabase
          .from('deposits')
          .select('amount_brl')
          .eq('user_id', profile.user_id)
          .eq('status', 'completed');

        const digitopayTotal = digitopayDeposits?.reduce((sum, deposit) => sum + (deposit.amount_brl || 0), 0) || 0;
        const usdtTotal = usdtDeposits?.reduce((sum, deposit) => sum + (deposit.amount_brl || 0), 0) || 0;
        
        setTotalDeposits(digitopayTotal + usdtTotal);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(tradingBalanceInterval);
  }, [profile?.user_id]);

  useEffect(() => {
    // Fallback para gerar link genérico caso não tenha username
    if (!referralLink && user) {
      const userCode = Math.random().toString(36).substring(2, 15);
      setReferralLink(`${window.location.origin}/register/${userCode}`);
    }
  }, [user, referralLink]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const url = new URL('https://newsdata.io/api/1/news');
        url.searchParams.set('apikey', 'pub_7d30bec4ab0045e59c9fc2e3836551ad');
        url.searchParams.set('q', 'financial markets OR crypto OR bitcoin OR ethereum OR trading OR stock market');
        url.searchParams.set('language', 'pt');
        url.searchParams.set('country', 'br,us');
        url.searchParams.set('category', 'business,technology');
        url.searchParams.set('size', '10');

        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          const formattedNews = (data.results?.map((article) => ({
            title: article.title,
            source: article.source_id || 'NewsData',
            time: new Date(article.pubDate).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            sentiment: article.sentiment || 'neutral',
            url: article.link,
            description: article.description,
          })) || []).slice(0, 5);
          setCryptoNews(formattedNews);
        } else {
          toast({
            title: 'Erro ao buscar notícias',
            description: `Status: ${response.status}`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Erro ao buscar notícias',
          description: String(error),
          variant: 'destructive',
        });
      }
    };

    fetchNews();
    const newsInterval = setInterval(fetchNews, 60 * 60 * 1000);
    return () => clearInterval(newsInterval);
  }, [toast]);

  const toggleBot = () => {
    setBotActive(!botActive);
    toast({
      title: botActive ? "Bot Pausado" : "Bot Ativado",
      description: botActive ? "Arbitragem automática pausada" : "Arbitragem automática iniciada",
    });
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link copiado!",
        description: "O link de indicação foi copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  // Usar dados reais do usuário em vez de valores simulados
  const userBalance = balance || 0; // Saldo real do usuário
  const userTotalProfit = totalProfit || 0; // Lucro total real do usuário
  const userDailyProfit = dailyProfit || 0; // Lucro diário real do usuário

  // Saldo em BTC: baseado no lucro total real
  const btcPrice = 43000;
  const btcBalance = (userTotalProfit || 0) / btcPrice;

  // Saldo em BRL: lucro do dia convertido para real (cotação fixa 1 USD = 5.40 BRL)
  const brlRate = 5.40;
  const brlBalance = (userDailyProfit || 0) * brlRate;

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Sistema de Arbitragem Alphabit</p>
          </div>
        </div>

        {/* Link de Indicação no Topo */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  value={referralLink}
                  readOnly
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono bg-secondary border border-border rounded-md text-secondary-foreground"
                />
              </div>
              <Button
                onClick={copyReferralLink}
                className="bg-primary hover:bg-primary/90 whitespace-nowrap"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-6">
            <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">
                Saldo Total
              </CardTitle>
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-primary">
                ${userBalance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +2.5% desde ontem
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Lucro Diário
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-trading-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-trading-green">
                +${(userDailyProfit || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +15.3% desde ontem
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Lucro Total
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                +${(userTotalProfit || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Desde o início
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Saldo Trading
              </CardTitle>
              <ArrowUpDown className="h-4 w-4 text-trading-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-trading-green">
                +${(tradingBalance || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                De operações
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Ordens Ativas
              </CardTitle>
              <Activity className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {activeOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                Em execução
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Depósitos
              </CardTitle>
              <DollarSign className="h-4 w-4 text-trading-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-trading-green">
                R$ {totalDeposits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                DigitoPay + USDT
              </p>
            </CardContent>
          </Card>
                 </div>

         {/* Alphabot - Negociações de Arbitragem */}
         <Card className="bg-card border-border">
           <CardHeader>
             <CardTitle className="flex items-center text-card-foreground">
               <Bot className="h-5 w-5 mr-2 text-primary" />
               Alphabot
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
                               {/* Saldos do Alphabot */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lucro BTC</span>
                      <span className="text-lg font-bold text-primary">
                        {alphabotData?.totalProfitBTC?.toFixed(6) || '0.000000'} BTC
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Dados reais da CoinMarketCap</div>
                  </div>
                  <div className="p-3 bg-trading-green/10 rounded-lg border border-trading-green/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lucro USDT</span>
                      <span className="text-lg font-bold text-trading-green">
                        ${(alphabotData?.totalProfitUSDT || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Dados reais da CoinMarketCap</div>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lucro Real</span>
                      <span className="text-lg font-bold text-warning">
                        R$ ${(alphabotData?.totalProfitBRL || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Dados reais da CoinMarketCap</div>
                  </div>
                </div>

               {/* Contador e Controles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        Próxima atualização em: {timeUntilUpdate.hours}h {timeUntilUpdate.minutes}min
                      </span>
                    </div>
                    <Button 
                      onClick={forceUpdateAlphaBot} 
                      disabled={isUpdatingAlphabot}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isUpdatingAlphabot ? 'animate-spin' : ''}`} />
                      {isUpdatingAlphabot ? 'Atualizando...' : 'Atualizar'}
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso da atualização (24h)</span>
                      <span>{(alphabotData?.progress || 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-trading-green h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${alphabotData?.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Última atualização: {alphabotData?.lastUpdate ? new Date(alphabotData.lastUpdate).toLocaleString('pt-BR') : 'Nunca'}
                  </div>
                </div>

               {/* Negociações de Arbitragem */}
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <h3 className="text-sm font-medium text-foreground">Negociações de Arbitragem (CoinMarketCap)</h3>
                   <Badge variant="outline" className="text-xs">
                     {alphabotData?.trades?.length || 0} operações
                   </Badge>
                 </div>
                 
                 {alphabotData?.trades && alphabotData.trades.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                     {alphabotData.trades.slice(0, 10).map((trade) => (
                       <div key={trade.id} className="p-3 bg-background/50 rounded-lg border border-border hover:bg-background/70 transition-colors">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-xs text-muted-foreground">{trade.time}</span>
                           <Badge variant="default" className="text-xs">ARBITRAGEM</Badge>
                         </div>
                         <div className="font-medium text-sm mb-2">{trade.pair}</div>
                         <div className="space-y-1 text-xs">
                           <div className="flex justify-between">
                             <span className="text-muted-foreground">Preço Atual:</span>
                             <span className="font-mono">${(trade.currentPrice || 0).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-muted-foreground">Variação 24h:</span>
                             <span className={`font-mono ${(trade.change24h || 0) >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                               {(trade.change24h || 0) >= 0 ? '+' : ''}{(trade.change24h || 0).toFixed(2)}%
                             </span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-muted-foreground">Volume 24h:</span>
                             <span className="font-mono">${((trade.volume24h || 0) / 1000000).toFixed(1)}M</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-muted-foreground">Market Cap:</span>
                             <span className="font-mono">${((trade.marketCap || 0) / 1000000000).toFixed(1)}B</span>
                           </div>
                         </div>
                         <div className="mt-2 pt-2 border-t border-border">
                           <div className="text-xs text-muted-foreground">
                             Rank #{trade.rank} • CoinMarketCap
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8 text-muted-foreground">
                     <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                     <p className="text-sm">
                       {isUpdatingAlphabot ? 'Carregando dados da CoinMarketCap...' : 'Nenhuma operação disponível'}
                     </p>
                   </div>
                 )}
               </div>
             </div>
           </CardContent>
         </Card>

         {/* Painel de Controle */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Painel de Controle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Compartilhe seu link exclusivo e ganhe comissão sobre os investimentos dos seus indicados!
              </p>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                 <div className="text-center p-3 bg-primary/10 rounded-lg">
                   <div className="text-lg font-bold text-primary">10%</div>
                   <div className="text-xs text-muted-foreground">Comissão por indicação</div>
                 </div>
                 <div className="text-center p-3 bg-trading-green/10 rounded-lg">
                   <div className="text-lg font-bold text-trading-green">0</div>
                   <div className="text-xs text-muted-foreground">Pessoas indicadas</div>
                 </div>
                 <div className="text-center p-3 bg-warning/10 rounded-lg">
                   <div className="text-lg font-bold text-warning">${(referralBalance || 0).toFixed(2)}</div>
                   <div className="text-xs text-muted-foreground">Total em comissões</div>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance 24h - Operação Única */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Performance 24h
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Métrica única da operação */}
                <div className={`text-center p-4 rounded-lg border ${
                  performance24h.percentage >= 0 
                    ? 'bg-trading-green/10 border-trading-green/20' 
                    : 'bg-trading-red/10 border-trading-red/20'
                }`}>
                  <div className={`text-2xl font-bold ${
                    (performance24h.percentage || 0) >= 0 ? 'text-trading-green' : 'text-trading-red'
                  }`}>
                    {(performance24h.percentage || 0) >= 0 ? '+' : ''}{(performance24h.percentage || 0).toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Performance 24h</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {performance24h.symbol}/USDT • ${(performance24h.price || 0).toLocaleString()}
                  </div>
                </div>
                
                {/* Gráfico de mercado simulado */}
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{performance24h.symbol}/USDT</span>
                    <span className={`text-xs font-medium ${
                      (performance24h.percentage || 0) >= 0 ? 'text-trading-green' : 'text-trading-red'
                    }`}>
                      {(performance24h.percentage || 0) >= 0 ? '+' : ''}{(performance24h.percentage || 0).toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="relative h-20 w-full overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 200 80">
                      {/* Linha de oscilação do mercado */}
                      <path
                        d="M0,50 Q25,45 50,40 T100,35 Q125,30 150,35 T200,40"
                        fill="none"
                        stroke="hsl(var(--trading-green))"
                        strokeWidth="2"
                        className="animate-[marketOscillation_3s_ease-in-out_infinite]"
                      />
                      
                      {/* Área de preenchimento */}
                      <path
                        d="M0,50 Q25,45 50,40 T100,35 Q125,30 150,35 T200,40 L200,80 L0,80 Z"
                        fill="hsl(var(--trading-green))"
                        fillOpacity="0.1"
                        className="animate-[marketOscillation_3s_ease-in-out_infinite]"
                      />
                      
                      {/* Ponto de entrada da operação */}
                      <circle cx="50" cy="40" r="3" fill="hsl(var(--trading-green))" className="animate-pulse">
                        <animate attributeName="cy" values="40;35;40" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      
                      {/* Ponto de saída da operação */}
                      <circle cx="150" cy="35" r="3" fill="hsl(var(--primary))" className="animate-pulse">
                        <animate attributeName="cy" values="35;30;35" dur="2.5s" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    
                    {/* Indicadores de preço */}
                    <div className="absolute top-0 right-0 text-xs">
                      <div className={`font-mono ${
                        performance24h.percentage >= 0 ? 'text-trading-green' : 'text-trading-red'
                      }`}>
                        ${(performance24h.price || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 text-xs">
                      <div className="text-muted-foreground font-mono">
                        ${((performance24h.price || 0) * (1 - Math.abs((performance24h.percentage || 0)) / 100)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Detalhes da operação */}
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-trading-green rounded-full"></div>
                      <span className="text-muted-foreground">
                        Entrada: ${((performance24h.price || 0) * (1 - Math.abs((performance24h.percentage || 0)) / 100)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-1 h-1 rounded-full ${
                        performance24h.percentage >= 0 ? 'bg-primary' : 'bg-trading-red'
                      }`}></div>
                      <span className="text-muted-foreground">
                        Atual: ${(performance24h.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mensagens da Comunidade */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Mensagens da Comunidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Últimas Mensagens</span>
                  </div>
                  <Badge variant="outline" className="text-xs text-primary border-primary">
                    {communityMessages.length} ativas
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {communityMessages.slice(0, 3).map((message) => (
                    <div key={message.id} className="flex items-start space-x-3 p-3 bg-background/50 rounded-lg border border-border hover:bg-background/70 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{message.avatar}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-foreground">{message.user}</span>
                          {message.isVerified && (
                            <div className="w-4 h-4 bg-trading-green rounded-full flex items-center justify-center">
                              <span className="text-[10px] text-white">✓</span>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{message.time}</span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{message.message}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 text-trading-green">❤️</div>
                            <span className="text-xs text-muted-foreground">{message.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Ver Todas as Mensagens
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximas Entradas do Bot */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Bot className="h-5 w-5 mr-2 text-primary" />
                Próximas Entradas do Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Próxima operação com gráfico */}
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">BTC/USDT</span>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary">
                      Entrada em 2min
                    </Badge>
                  </div>
                  
                  {/* Gráfico de análise */}
                  <div className="mb-3 p-2 bg-background/50 rounded-lg">
                    <div className="relative h-16 w-full overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 200 60">
                        {/* Linha de tendência */}
                        <path
                          d="M0,45 Q40,40 80,30 T160,25 Q180,20 200,18"
                          fill="none"
                          stroke="hsl(var(--trading-green))"
                          strokeWidth="2"
                          className="animate-[marketOscillation_2s_ease-in-out_infinite]"
                        />
                        
                        {/* Área de preenchimento */}
                        <path
                          d="M0,45 Q40,40 80,30 T160,25 Q180,20 200,18 L200,60 L0,60 Z"
                          fill="hsl(var(--trading-green))"
                          fillOpacity="0.1"
                        />
                        
                        {/* Ponto de entrada previsto */}
                        <circle cx="180" cy="20" r="3" fill="hsl(var(--primary))" className="animate-pulse">
                          <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite"/>
                        </circle>
                        
                        {/* Indicador de sinal */}
                        <text x="150" y="15" fill="hsl(var(--primary))" fontSize="8" className="animate-pulse">
                          COMPRA
                        </text>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Preço Entrada:</span>
                      <div className="font-medium">$43,250</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stop Loss:</span>
                      <div className="font-medium text-destructive">$42,800</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Take Profit:</span>
                      <div className="font-medium text-trading-green">$44,100</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confiança:</span>
                      <div className="font-medium text-primary">87%</div>
                    </div>
                  </div>
                </div>
                
                {/* Operações em fila */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground mb-2">Próximas em análise:</div>
                  {[
                    { pair: "ETH/USDT", signal: "COMPRA", confidence: 75, time: "5min" },
                    { pair: "SOL/USDT", signal: "VENDA", confidence: 68, time: "8min" },
                    { pair: "ADA/USDT", signal: "COMPRA", confidence: 82, time: "12min" }
                  ].map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                        <span className="text-sm font-medium">{entry.pair}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={entry.signal === "COMPRA" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {entry.signal}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{entry.confidence}%</span>
                        <span className="text-xs text-muted-foreground">{entry.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crypto News */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground text-sm sm:text-base">
              <Newspaper className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
              <span className="hidden sm:inline">Notícias do Mercado Cripto</span>
              <span className="sm:hidden">Notícias</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cryptoNews.length > 0 ? cryptoNews.map((news, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{news.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-primary">{news.source}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{news.time}</span>
                      <Badge 
                        variant={news.sentiment === 'positive' ? 'default' : news.sentiment === 'negative' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {news.sentiment === 'positive' ? 'Positivo' : news.sentiment === 'negative' ? 'Negativo' : 'Neutro'}
                      </Badge>
                    </div>
                  </div>
                  <a href={news.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 hover:text-primary" />
                  </a>
                </div>
              )) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Carregando notícias...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>



      </div>
    </div>
  );
};

export default Dashboard;