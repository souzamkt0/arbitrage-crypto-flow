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
  Bot
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import axios from "axios";

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
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const [arbitrageOpportunities] = useState([
    { pair: "BTC/USDT", exchange1: "Binance", exchange2: "Future", profit: 1.2, amount: 0.5 },
    { pair: "ETH/USDT", exchange1: "Spot", exchange2: "Future", profit: 0.8, amount: 2.1 },
    { pair: "BNB/USDT", exchange1: "Binance", exchange2: "Future", profit: 2.1, amount: 15.0 },
  ]);

  const [cryptoNews, setCryptoNews] = useState([]);
  const [performance24h, setPerformance24h] = useState({ percentage: 0, symbol: '', price: 0 });
  const [lastPerformanceUpdate, setLastPerformanceUpdate] = useState(null);
  const [arbitrageTrades, setArbitrageTrades] = useState([]);
  const [arbitrageLastUpdate, setArbitrageLastUpdate] = useState(() => Date.now());
  const [arbitrageProgress, setArbitrageProgress] = useState(0);

  useEffect(() => {
    const generateArbitrageOpportunities = () => {
      const cryptoPairs = [
        { symbol: "BTC/USDT", basePrice: 43000 },
        { symbol: "ETH/USDT", basePrice: 2500 },
        { symbol: "BNB/USDT", basePrice: 385 },
        { symbol: "SOL/USDT", basePrice: 98 },
        { symbol: "ADA/USDT", basePrice: 0.45 },
        { symbol: "XRP/USDT", basePrice: 0.62 },
        { symbol: "DOT/USDT", basePrice: 7.8 },
        { symbol: "LINK/USDT", basePrice: 14.5 },
        { symbol: "MATIC/USDT", basePrice: 0.95 },
        { symbol: "AVAX/USDT", basePrice: 32.5 }
      ];
      return cryptoPairs.slice(0, 10).map((pair) => {
        const priceVariation = (Math.random() - 0.5) * 0.1; // ±5%
        const buyPrice = pair.basePrice * (1 + priceVariation);
        const sellPrice = buyPrice * (1 + (Math.random() * 0.015 + 0.002)); // 0.2% a 1.7% acima
        const profit = sellPrice - buyPrice;
        return {
          pair: pair.symbol,
          buyPrice,
          sellPrice,
          profit,
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        };
      });
    };

    // Só gera se trades estiver vazio (primeira carga)
    if (arbitrageTrades.length === 0) {
      setArbitrageTrades(generateArbitrageOpportunities());
      setArbitrageLastUpdate(Date.now());
      setArbitrageProgress(0);
    }

    // Atualiza barra de progresso a cada minuto
    const interval = setInterval(() => {
      const elapsed = Date.now() - arbitrageLastUpdate;
      const percent = Math.min((elapsed / (24 * 60 * 60 * 1000)) * 100, 100);
      setArbitrageProgress(percent);

      // Se passou 24h, gera novas operações
      if (elapsed >= 24 * 60 * 60 * 1000) {
        setArbitrageTrades(generateArbitrageOpportunities());
        setArbitrageLastUpdate(Date.now());
        setArbitrageProgress(0);
      }
    }, 1000 * 60);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [arbitrageTrades, arbitrageLastUpdate]);

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

      // Gerar link de indicação único baseado no username
      if (profile.username) {
        setReferralLink(`${window.location.origin}/register/${profile.username}`);
      }
    };
    loadInvestments();
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

  // Cálculo dos saldos simulados de arbitragem
  const simulatedTotalProfit = arbitrageTrades.reduce((acc, trade) => acc + trade.profit, 0);
  const simulatedBalance = 10000 + simulatedTotalProfit; // Exemplo: saldo inicial + lucro simulado
  const simulatedDailyProfit = simulatedTotalProfit; // Ou ajuste conforme sua lógica

  // Saldo em BTC: soma do lucro convertido pelo preço do BTC/USDT da primeira operação
  const btcPair = arbitrageTrades.find(t => t.pair === 'BTC/USDT');
  const btcPrice = btcPair ? btcPair.buyPrice : 43000;
  const totalProfitUSD = arbitrageTrades.reduce((acc, trade) => acc + trade.profit, 0);
  const btcBalance = btcPrice > 0 ? totalProfitUSD / btcPrice : 0;

  // Saldo em BRL: lucro do dia convertido para real (cotação fixa 1 USD = 5.40 BRL)
  const brlRate = 5.40;
  const brlBalance = simulatedDailyProfit * brlRate;

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-card-foreground">
                Saldo Total
              </CardTitle>
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-primary">
                ${simulatedBalance.toLocaleString()}
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
                +${simulatedDailyProfit.toFixed(2)}
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
                +${simulatedTotalProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Desde o início
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
        </div>

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
                   <div className="text-lg font-bold text-warning">${referralBalance.toFixed(2)}</div>
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
                    performance24h.percentage >= 0 ? 'text-trading-green' : 'text-trading-red'
                  }`}>
                    {performance24h.percentage >= 0 ? '+' : ''}{performance24h.percentage.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Performance 24h</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {performance24h.symbol}/USDT • ${performance24h.price.toLocaleString()}
                  </div>
                </div>
                
                {/* Gráfico de mercado simulado */}
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{performance24h.symbol}/USDT</span>
                    <span className={`text-xs font-medium ${
                      performance24h.percentage >= 0 ? 'text-trading-green' : 'text-trading-red'
                    }`}>
                      {performance24h.percentage >= 0 ? '+' : ''}{performance24h.percentage.toFixed(2)}%
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
                        ${performance24h.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 text-xs">
                      <div className="text-muted-foreground font-mono">
                        ${(performance24h.price * (1 - Math.abs(performance24h.percentage) / 100)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Detalhes da operação */}
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-trading-green rounded-full"></div>
                      <span className="text-muted-foreground">
                        Entrada: ${(performance24h.price * (1 - Math.abs(performance24h.percentage) / 100)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-1 h-1 rounded-full ${
                        performance24h.percentage >= 0 ? 'bg-primary' : 'bg-trading-red'
                      }`}></div>
                      <span className="text-muted-foreground">
                        Atual: ${performance24h.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investimento Ativo */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Activity className="h-5 w-5 mr-2 text-primary" />
                Investimento Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-trading-green rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-foreground">ATIVO</span>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary">
                      Plano Pro
                    </Badge>
                  </div>
                  
                  {/* Gráfico de Oscilação do Mercado */}
                  <div className="mb-4 p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">BTC/USDT</span>
                      <span className="text-xs font-medium text-trading-green">+2.34%</span>
                    </div>
                    
                    <div className="relative h-16 w-full overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 200 60">
                        {/* Linha de oscilação animada */}
                        <path
                          d="M0,30 Q20,20 40,25 T80,35 Q100,25 120,30 T160,40 Q180,35 200,30"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          className="animate-[marketOscillation_4s_ease-in-out_infinite]"
                        />
                        
                        {/* Área de preenchimento */}
                        <path
                          d="M0,30 Q20,20 40,25 T80,35 Q100,25 120,30 T160,40 Q180,35 200,30 L200,60 L0,60 Z"
                          fill="hsl(var(--primary))"
                          fillOpacity="0.1"
                          className="animate-[marketOscillation_4s_ease-in-out_infinite]"
                        />
                        
                        {/* Pontos de negociação */}
                        <circle cx="40" cy="25" r="2" fill="hsl(var(--trading-green))" className="animate-pulse">
                          <animate attributeName="cy" values="25;20;25" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="120" cy="30" r="2" fill="hsl(var(--trading-green))" className="animate-pulse">
                          <animate attributeName="cy" values="30;35;30" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="160" cy="40" r="2" fill="hsl(var(--warning))" className="animate-pulse">
                          <animate attributeName="cy" values="40;35;40" dur="2.5s" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                      
                      {/* Indicadores de preço */}
                      <div className="absolute top-0 right-0 text-xs">
                        <div className="text-trading-green font-mono">$43,250</div>
                      </div>
                      <div className="absolute bottom-0 right-0 text-xs">
                        <div className="text-muted-foreground font-mono">$42,890</div>
                      </div>
                    </div>
                    
                    {/* Indicadores de operação em tempo real */}
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-trading-green rounded-full animate-pulse"></div>
                        <span className="text-muted-foreground">Compra: $42,980</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-warning rounded-full animate-pulse"></div>
                        <span className="text-muted-foreground">Venda: $43,120</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Valor Investido:</span>
                      <span className="text-sm font-bold text-foreground">$5,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Lucro Atual:</span>
                      <span className="text-sm font-bold text-trading-green">+$1,234.56</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">ROI:</span>
                      <span className="text-sm font-bold text-primary">+24.69%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tempo Ativo:</span>
                      <span className="text-sm font-medium text-foreground">15 dias</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground mb-1">Progresso do Mês</div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>
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

        {/* Recent Trades substituído por Arbitragem CoinMarketCap */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Operações Recentes de Arbitragem (CoinMarketCap)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Saldo em BTC acima do cronômetro */}
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Saldo em BTC:</span>
              <span className="font-mono text-lg text-primary">{btcBalance.toFixed(5)} BTC</span>
            </div>
            {/* Saldo em Real */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Saldo em Real:</span>
              <span className="font-mono text-lg text-primary">R$ {brlBalance.toFixed(2)}</span>
            </div>
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Próxima atualização em 24h</span>
                <span className="text-xs text-muted-foreground">{(24 - Math.floor((arbitrageProgress/100)*24)).toString().padStart(2, '0')}:00h</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${arbitrageProgress}%` }}></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {arbitrageTrades.length > 0 ? (
                arbitrageTrades.map((trade, index) => (
                  <div key={index} className="p-2 sm:p-3 bg-secondary rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">{trade.time}</div>
                      <Badge variant="default" className="text-xs">ARBITRAGEM</Badge>
                    </div>
                    <div className="font-medium text-secondary-foreground text-sm sm:text-base">{trade.pair}</div>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-trading-green text-sm sm:text-base">+${trade.profit.toFixed(2)}</div>
                      <Badge variant="outline" className="text-xs">Lucro</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Compra: ${trade.buyPrice.toFixed(2)}</span>
                      <span>Venda: ${trade.sellPrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground w-full col-span-4">
                  <p className="text-sm">Carregando negociações de arbitragem...</p>
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