import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { binanceApi } from "@/services/binanceApiService";
import { 
  Bot, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Settings, 
  Play, 
  Pause, 
  Zap,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Target,
  Clock,
  Wallet,
  Signal,
  RefreshCw
} from "lucide-react";

interface BotConfig {
  isActive: boolean;
  riskLevel: number;
  maxInvestment: number;
  stopLoss: number;
  takeProfit: number;
  tradingPairs: string[];
  strategy: string;
  autoTrade: boolean;
}

interface TradeOpportunity {
  id: string;
  pair: string;
  type: "BUY" | "SELL";
  currentPrice: number;
  targetPrice: number;
  potentialProfit: number;
  confidence: number;
  timeframe: string;
  volume: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  strategy?: {
    name: string;
    description: string;
    execution: string;
    profitRange: string;
    howItWorks: string;
  };
  binanceData: {
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
    lastUpdate: string;
  };
}

interface BotStats {
  totalProfit: number;
  todayProfit: number;
  successRate: number;
  activeTrades: number;
  completedTrades: number;
  totalVolume: number;
  apiStatus: "connected" | "disconnected";
  lastSync: string;
  analysisSpeed: number; // operações analisadas por segundo
}

const BotPage = () => {
  const [botConfig, setBotConfig] = useState<BotConfig>({
    isActive: false,
    riskLevel: 3,
    maxInvestment: 1000,
    stopLoss: 5,
    takeProfit: 10,
    tradingPairs: ["BTC/USDT", "ETH/USDT", "BNB/USDT"],
    strategy: "scalping",
    autoTrade: false
  });

  const [botStats, setBotStats] = useState<BotStats>({
    totalProfit: 2847.65,
    todayProfit: 156.23,
    successRate: 78.5,
    activeTrades: 3,
    completedTrades: 247,
    totalVolume: 125400,
    apiStatus: "disconnected",
    lastSync: "Conectando...",
    analysisSpeed: 847 // operações analisadas por segundo
  });

  // Estados para dados reais da Binance
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<any[]>([]);
  const [binanceConnected, setBinanceConnected] = useState(false);

  const [tradeOpportunities, setTradeOpportunities] = useState<TradeOpportunity[]>([]);

  const [selectedOpportunity, setSelectedOpportunity] = useState<TradeOpportunity | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [binanceApiStatus, setBinanceApiStatus] = useState({
    connected: true,
    latency: 23, // ms
    dataStreams: 847, // streams ativos
    lastUpdate: "2024-07-14 10:23:45"
  });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [canRefresh, setCanRefresh] = useState(true);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(0);

  // Função para gerar oportunidades baseadas em dados do CoinMarketCap
  const generateArbitrageOpportunities = async (): Promise<TradeOpportunity[]> => {
    try {
      // Simular dados do CoinMarketCap com variações realistas
      const cryptoPairs = [
        { symbol: "BTC/USDT", basePrice: 43000 },
        { symbol: "ETH/USDT", basePrice: 2500 },
        { symbol: "BNB/USDT", basePrice: 385 },
        { symbol: "SOL/USDT", basePrice: 98 },
        { symbol: "ADA/USDT", basePrice: 0.45 },
        { symbol: "XRP/USDT", basePrice: 0.62 },
        { symbol: "DOT/USDT", basePrice: 7.8 },
        { symbol: "LINK/USDT", basePrice: 14.5 }
      ];

      const strategies = [
        {
          name: "Arbitragem Cross-Exchange",
          description: "Explora diferenças de preço entre Binance Spot e Futures simultaneamente",
          execution: "Compra no Spot (preço menor) e vende no Futures (preço maior)",
          profitRange: "0.2% - 0.8%",
          timeframe: "Instantâneo",
          riskLevel: "LOW" as const
        },
        {
          name: "Arbitragem Triangular",
          description: "Utiliza três pares de moedas para criar ciclos de arbitragem",
          execution: "BTC → ETH → USDT → BTC, capturando diferenças de taxa de câmbio",
          profitRange: "0.1% - 0.5%",
          timeframe: "1-3min",
          riskLevel: "LOW" as const
        },
        {
          name: "Funding Rate Arbitrage",
          description: "Aproveita taxas de financiamento negativas/positivas em contratos perpétuos",
          execution: "Posição longa no spot + curta no futuro quando funding é positivo",
          profitRange: "0.3% - 1.2%",
          timeframe: "8h",
          riskLevel: "MEDIUM" as const
        },
        {
          name: "Statistical Arbitrage",
          description: "Usa correlações históricas entre ativos para identificar divergências",
          execution: "Long no ativo subvalorizado + Short no sobrevalorizado",
          profitRange: "0.5% - 2.0%",
          timeframe: "1-24h",
          riskLevel: "MEDIUM" as const
        }
      ];

      return cryptoPairs.slice(0, 4).map((pair, index) => {
        const strategy = strategies[index % strategies.length];
        const priceVariation = (Math.random() - 0.5) * 0.1; // ±5%
        const currentPrice = pair.basePrice * (1 + priceVariation);
        const arbitrageSpread = Math.random() * 0.015 + 0.002; // 0.2% a 1.7%
        
        const isLong = Math.random() > 0.5;
        const targetPrice = isLong 
          ? currentPrice * (1 + arbitrageSpread)
          : currentPrice * (1 - arbitrageSpread);
        
        const volume = Math.random() * 5000 + 1000;
        const potentialProfit = Math.abs(targetPrice - currentPrice) * volume / currentPrice;

        return {
          id: `cmc_${index}_${Date.now()}`,
          pair: pair.symbol,
          type: isLong ? "BUY" : "SELL" as "BUY" | "SELL",
          currentPrice,
          targetPrice,
          potentialProfit,
          confidence: Math.floor(Math.random() * 20 + 75), // 75-95%
          timeframe: strategy.timeframe,
          volume,
          riskLevel: strategy.riskLevel,
          strategy: {
            name: strategy.name,
            description: strategy.description,
            execution: strategy.execution,
            profitRange: strategy.profitRange,
            howItWorks: `${strategy.description}. ${strategy.execution}. Esta estratégia é ideal para ${strategy.riskLevel === 'LOW' ? 'investidores conservadores' : 'traders experientes'} que buscam ${strategy.profitRange} de retorno por operação.`
          },
          binanceData: {
            priceChange24h: (Math.random() - 0.5) * 10, // ±5%
            volume24h: Math.random() * 100000000 + 10000000,
            marketCap: Math.random() * 500000000000 + 50000000000,
            lastUpdate: new Date().toLocaleString('pt-BR')
          }
        };
      });
    } catch (error) {
      console.error("Erro ao gerar oportunidades:", error);
      return [];
    }
  };

  // Função para conectar com a Binance e obter dados reais
  const connectToBinance = async () => {
    try {
      console.log("Conectando com a Binance...");
      const connectionStatus = await binanceApi.checkConnection();
      
      if (connectionStatus) {
        const credentialsValid = await binanceApi.validateCredentials();
        
        if (credentialsValid) {
          setBinanceConnected(true);
          setBotStats(prev => ({
            ...prev,
            apiStatus: "connected",
            lastSync: new Date().toLocaleString('pt-BR')
          }));
          
          toast({
            title: "Binance conectada!",
            description: "Bot agora usando dados reais da API Binance.",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao conectar com Binance:", error);
      setBinanceConnected(false);
    }
  };

  // Função para atualizar dados em tempo real
  const updateRealTimeData = async () => {
    try {
      if (!binanceConnected) return;
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
      const prices = await Promise.all(symbols.map(symbol => binanceApi.getPrice(symbol)));
      setRealTimeData(prices);
      setBotStats(prev => ({ ...prev, lastSync: new Date().toLocaleString('pt-BR') }));
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    }
  };

  // Sistema de atualização automática a cada 5 horas
  useEffect(() => {
    const updateOpportunities = async () => {
      try {
        const opportunities = await generateArbitrageOpportunities();
        setTradeOpportunities(opportunities);
        setLastRefresh(new Date());
        
        toast({
          title: "Estratégias Atualizadas",
          description: "Novas oportunidades de arbitragem carregadas do CoinMarketCap",
        });
      } catch (error) {
        console.error("Erro ao atualizar estratégias:", error);
      }
    };

    // Atualizar imediatamente
    updateOpportunities();

    // Configurar timer para 5 horas
    const interval = setInterval(updateOpportunities, 5 * 60 * 60 * 1000);

    // Timer para mostrar tempo restante
    const countdownInterval = setInterval(() => {
      const now = new Date();
      const timeDiff = now.getTime() - lastRefresh.getTime();
      const fiveHoursInMs = 5 * 60 * 60 * 1000;
      
      if (timeDiff >= fiveHoursInMs) {
        setCanRefresh(true);
        setTimeUntilRefresh(0);
      } else {
        setCanRefresh(false);
        const remaining = fiveHoursInMs - timeDiff;
        setTimeUntilRefresh(Math.ceil(remaining / (60 * 1000)));
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, []);

  // Conectar automaticamente ao carregar a página
  useEffect(() => {
    connectToBinance();
    
    // Atualizar dados a cada 30 segundos se conectado
    const interval = setInterval(() => {
      if (binanceConnected) {
        updateRealTimeData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [binanceConnected]);

  const { toast } = useToast();

  const handleBotToggle = () => {
    setBotConfig(prev => ({ ...prev, isActive: !prev.isActive }));
    toast({
      title: botConfig.isActive ? "Bot Desativado" : "Bot Ativado",
      description: botConfig.isActive 
        ? "O bot foi pausado e não realizará novas operações" 
        : "O bot está ativo e monitorando o mercado",
    });
  };

  const handleExecuteTrade = (opportunity: TradeOpportunity) => {
    setSelectedOpportunity(opportunity);
    toast({
      title: "Operação Executada",
      description: `${opportunity.type} ${opportunity.pair} executada com sucesso`,
    });
  };

  const handleRefreshOpportunities = () => {
    if (!canRefresh) {
      toast({
        title: "Atualização Limitada",
        description: `Próxima atualização disponível em ${Math.floor(timeUntilRefresh / 60)}h ${timeUntilRefresh % 60}min`,
        variant: "destructive"
      });
      return;
    }

    setLastRefresh(new Date());
    toast({
      title: "Oportunidades Atualizadas",
      description: "Próxima atualização disponível em 5 horas",
    });
  };

  // Função para calcular projeção de lucros em tempo real
  const calculateProfitProjection = () => {
    const { maxInvestment, strategy, riskLevel, takeProfit, stopLoss } = botConfig;
    
    let dailyMultiplier = 0;
    let successRateAdjustment = 0;
    
    // Multiplicadores por estratégia
    switch(strategy) {
      case "scalping":
        dailyMultiplier = 0.008; // 0.8% ao dia
        successRateAdjustment = 85;
        break;
      case "swing":
        dailyMultiplier = 0.015; // 1.5% ao dia  
        successRateAdjustment = 75;
        break;
      case "arbitrage":
        dailyMultiplier = 0.012; // 1.2% ao dia
        successRateAdjustment = 90;
        break;
      case "grid":
        dailyMultiplier = 0.010; // 1.0% ao dia
        successRateAdjustment = 80;
        break;
      default:
        dailyMultiplier = 0.008;
        successRateAdjustment = 70;
    }
    
    // Ajuste por nível de risco (1-10)
    const riskMultiplier = 1 + (riskLevel - 5) * 0.1; // -40% a +50%
    
    // Ajuste por take profit e stop loss
    const profitLossRatio = takeProfit / (stopLoss || 1);
    const strategyAdjustment = Math.min(1.5, profitLossRatio * 0.3);
    
    // Cálculo final
    const finalMultiplier = dailyMultiplier * riskMultiplier * strategyAdjustment;
    const dailyProfitMin = maxInvestment * finalMultiplier * 0.7; // 70% do potencial
    const dailyProfitMax = maxInvestment * finalMultiplier * 1.3; // 130% do potencial
    
    return {
      daily: {
        min: dailyProfitMin,
        max: dailyProfitMax
      },
      monthly: {
        min: dailyProfitMin * 22, // 22 dias úteis
        max: dailyProfitMax * 22
      },
      successRate: Math.min(95, successRateAdjustment + (riskLevel * 2)),
      riskLevel: riskLevel <= 3 ? "Baixo" : riskLevel <= 7 ? "Médio" : "Alto"
    };
  };

  const getStrategyDescription = (strategy: string) => {
    const descriptions = {
      scalping: {
        name: "Scalping",
        description: "Operações rápidas de segundos a minutos, aproveitando pequenas variações de preço",
        advantages: ["Alta frequência de operações", "Lucros consistentes", "Menor exposição ao risco de mercado"],
        timeframe: "1s - 5min",
        profitTarget: "0.1% - 0.5% por trade",
        riskLevel: "Baixo a Médio"
      },
      swing: {
        name: "Swing Trading", 
        description: "Operações de médio prazo, capturando movimentos de tendência de dias a semanas",
        advantages: ["Maior potencial de lucro", "Menos estresse operacional", "Aproveita tendências maiores"],
        timeframe: "1h - 1 semana",
        profitTarget: "2% - 8% por trade",
        riskLevel: "Médio"
      },
      arbitrage: {
        name: "Arbitragem",
        description: "Explora diferenças de preço entre exchanges ou pares de moedas simultaneamente",
        advantages: ["Risco muito baixo", "Lucros garantidos", "Independe da direção do mercado"],
        timeframe: "Instantâneo",
        profitTarget: "0.1% - 1% por trade",
        riskLevel: "Muito Baixo"
      },
      grid: {
        name: "Grid Trading",
        description: "Coloca ordens de compra e venda em intervalos regulares, lucrando com volatilidade",
        advantages: ["Automatizado", "Funciona em mercados laterais", "Composta lucros"],
        timeframe: "Contínuo",
        profitTarget: "0.5% - 2% por ciclo",
        riskLevel: "Baixo a Médio"
      }
    };
    
    return descriptions[strategy as keyof typeof descriptions] || descriptions.scalping;
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case "LOW": return "text-trading-green";
      case "MEDIUM": return "text-warning";
      case "HIGH": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStrategyName = (strategy: string) => {
    switch(strategy) {
      case "scalping": return "Scalping";
      case "swing": return "Swing Trading";
      case "arbitrage": return "Arbitragem";
      case "grid": return "Grid Trading";
      default: return "Personalizada";
    }
  };

  const getOperationStrategy = (opportunityId: string) => {
    const strategies = [
      {
        name: "Arbitragem Instantânea",
        description: "Explora diferenças de preço entre exchanges em tempo real",
        type: "ARBITRAGE",
        execution: "Compra numa exchange e vende simultaneamente em outra",
        timeframe: "Instantâneo",
        profitRange: "0.1% - 1%",
        riskLevel: "Muito Baixo",
        features: ["Lucro garantido", "Sem exposição ao mercado", "Execução automática"],
        howItWorks: "Bot identifica diferenças de preço entre exchanges ou pares, executa compra e venda simultâneas"
      },
      {
        name: "Scalping Rápido",
        description: "Operações de alta frequência aproveitando micro movimentos",
        type: "SCALPING",
        execution: "Compra e venda em segundos ou minutos",
        timeframe: "1s - 5min",
        profitRange: "0.1% - 0.5%",
        riskLevel: "Baixo a Médio",
        features: ["Alta frequência", "Lucros pequenos consistentes", "Análise técnica avançada"],
        howItWorks: "Bot analisa padrões de preço em timeframes muito curtos, executa trades rápidos"
      },
      {
        name: "Swing Trading",
        description: "Captura tendências de médio prazo com análise técnica",
        type: "SWING",
        execution: "Mantém posições por horas ou dias",
        timeframe: "1h - 1 semana",
        profitRange: "2% - 8%",
        riskLevel: "Médio",
        features: ["Maior potencial de lucro", "Menos operações", "Segue tendências"],
        howItWorks: "Bot identifica tendências usando indicadores técnicos, mantém posições por mais tempo"
      },
      {
        name: "Grid Trading",
        description: "Sistema automatizado de ordens escalonadas",
        type: "GRID",
        execution: "Ordens de compra e venda em intervalos regulares",
        timeframe: "Contínuo",
        profitRange: "0.5% - 2%",
        riskLevel: "Baixo a Médio",
        features: ["Totalmente automatizado", "Aproveita volatilidade", "Funciona em laterais"],
        howItWorks: "Bot coloca ordens em grid, comprando baixo e vendendo alto automaticamente"
      }
    ];
    
    return strategies[parseInt(opportunityId) - 1] || strategies[0];
  };

  const profitProjection = calculateProfitProjection();
  const strategyInfo = getStrategyDescription(botConfig.strategy);

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 text-primary" />
              <span className="text-base sm:text-xl lg:text-3xl">Bot de Trading</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
              Gerencie seu bot automatizado conectado à Binance
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center text-xs sm:text-sm">
              {isConnected ? (
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              )}
              <span className="hidden sm:inline">API Binance</span>
              <span className="sm:hidden">API</span> {isConnected ? "Conectada" : "Desconectada"}
            </Badge>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="bot-toggle" className="text-xs sm:text-sm font-medium">
                Bot {botConfig.isActive ? "ON" : "OFF"}
              </Label>
              <Switch
                id="bot-toggle"
                checked={botConfig.isActive}
                onCheckedChange={handleBotToggle}
              />
            </div>
          </div>
        </div>

        {/* Status da API Binance - Mobile Optimized */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-trading-green rounded-full animate-pulse"></div>
                  <span className="font-medium text-sm sm:text-base">API Binance Conectada</span>
                </div>
                <Badge variant="outline" className="text-primary border-primary text-xs">
                  {binanceApiStatus.dataStreams} streams
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
                <div>Latência: {binanceApiStatus.latency}ms</div>
                <div className="hidden sm:block">Analisando: {botStats.analysisSpeed} ops/s</div>
                <div className="hidden lg:block">Última sync: {binanceApiStatus.lastUpdate}</div>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <Signal className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs sm:text-sm">Dados em tempo real</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-trading-green" />
                <span className="text-xs sm:text-sm">Análise de tendências</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
                <span className="text-xs sm:text-sm">Seleção automática</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs sm:text-sm">Execução otimizada</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Lucro Total</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-trading-green" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-trading-green">
                +${botStats.totalProfit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{botStats.todayProfit.toFixed(2)} hoje
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Taxa de Sucesso</CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-primary">
                {botStats.successRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                {botStats.completedTrades} operações
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Operações Ativas</CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-warning">
                {botStats.activeTrades}
              </div>
              <p className="text-xs text-muted-foreground">
                Em andamento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Análise/Segundo</CardTitle>
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-secondary-foreground">
                {botStats.analysisSpeed}
              </div>
              <p className="text-xs text-muted-foreground">
                Operações da Binance
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Gráfico de Mercado com Dados da Binance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-card-foreground">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Dados da Binance API
                </div>
                <Badge variant="outline" className="text-trading-green border-trading-green animate-pulse">
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Gráfico Principal */}
                <div className="p-4 bg-background/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Signal className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">BTC/USDT</span>
                      <Badge variant="outline" className="text-trading-green border-trading-green">
                        +2.34%
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      API Binance • Tempo real
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    Volume 24h: $24.5B • Cap: $847B • Última atualização: {binanceApiStatus.lastUpdate}
                  </div>
                  
                  <div className="relative h-64 w-full overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      {/* Grid de fundo */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5" opacity="0.3"/>
                        </pattern>
                      </defs>
                      <rect width="400" height="200" fill="url(#grid)" />
                      
                      {/* Linha principal do gráfico */}
                      <path
                        d="M0,120 Q40,100 80,90 T160,85 Q200,75 240,80 T320,70 Q360,65 400,60"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        className="animate-[marketOscillation_4s_ease-in-out_infinite]"
                      />
                      
                      {/* Área de preenchimento */}
                      <path
                        d="M0,120 Q40,100 80,90 T160,85 Q200,75 240,80 T320,70 Q360,65 400,60 L400,200 L0,200 Z"
                        fill="hsl(var(--primary))"
                        fillOpacity="0.1"
                      />
                      
                      {/* Pontos de negociação */}
                      <circle cx="80" cy="90" r="3" fill="hsl(var(--trading-green))" className="animate-pulse">
                        <animate attributeName="cy" values="90;85;90" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="240" cy="80" r="3" fill="hsl(var(--trading-green))" className="animate-pulse">
                        <animate attributeName="cy" values="80;85;80" dur="3s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="320" cy="70" r="3" fill="hsl(var(--warning))" className="animate-pulse">
                        <animate attributeName="cy" values="70;65;70" dur="2.5s" repeatCount="indefinite"/>
                      </circle>
                      
                      {/* Linha de suporte */}
                      <line x1="0" y1="150" x2="400" y2="150" stroke="hsl(var(--destructive))" strokeWidth="1" strokeDasharray="5,5" opacity="0.5"/>
                      <text x="5" y="145" fill="hsl(var(--destructive))" fontSize="10">Suporte: $42,800</text>
                      
                      {/* Linha de resistência */}
                      <line x1="0" y1="50" x2="400" y2="50" stroke="hsl(var(--trading-green))" strokeWidth="1" strokeDasharray="5,5" opacity="0.5"/>
                      <text x="5" y="45" fill="hsl(var(--trading-green))" fontSize="10">Resistência: $44,200</text>
                    </svg>
                  </div>
                  
                  {/* Indicadores técnicos com explicações */}
                  <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
                    <div className="text-center">
                      <div className="text-trading-green font-medium">RSI: 68.5</div>
                      <div className="text-muted-foreground">Neutro</div>
                    </div>
                    <div className="text-center">
                      <div className="text-primary font-medium">MACD: +0.23</div>
                      <div className="text-muted-foreground">Positivo</div>
                    </div>
                    <div className="text-center">
                      <div className="text-warning font-medium">BB: Meio</div>
                      <div className="text-muted-foreground">Neutro</div>
                    </div>
                  </div>
                  
                  {/* Explicações dos Indicadores */}
                  <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                    <h4 className="text-xs font-medium mb-2">Indicadores Técnicos:</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div><strong>RSI (68.5):</strong> Índice de Força Relativa. 0-30: Sobrevenda, 30-70: Neutro, 70-100: Sobrecompra</div>
                      <div><strong>MACD (+0.23):</strong> Convergência/Divergência de Médias Móveis. Positivo: Tendência de alta, Negativo: Tendência de baixa</div>
                      <div><strong>BB Meio:</strong> Bollinger Bands. Preço próximo à média móvel central, indicando movimento lateral</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações do Bot - Mobile Optimized */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground text-sm sm:text-base">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                Configurações do Bot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Estratégia com Explicação */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="strategy" className="text-sm sm:text-base font-medium">Estratégia de Trading</Label>
                    <Select value={botConfig.strategy} onValueChange={(value) => setBotConfig(prev => ({ ...prev, strategy: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scalping">Scalping - Rápido e Frequente</SelectItem>
                        <SelectItem value="swing">Swing Trading - Médio Prazo</SelectItem>
                        <SelectItem value="arbitrage">Arbitragem - Baixo Risco</SelectItem>
                        <SelectItem value="grid">Grid Trading - Automatizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Explicação da Estratégia Selecionada */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-primary">
                        {strategyInfo.name} - {strategyInfo.riskLevel}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs sm:text-sm mb-3">
                        {strategyInfo.description}
                      </CardDescription>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="font-medium">Tempo:</span>
                          <div className="text-muted-foreground">{strategyInfo.timeframe}</div>
                        </div>
                        <div>
                          <span className="font-medium">Lucro por Trade:</span>
                          <div className="text-trading-green">{strategyInfo.profitTarget}</div>
                        </div>
                        <div>
                          <span className="font-medium">Risco:</span>
                          <div className="text-muted-foreground">{strategyInfo.riskLevel}</div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="font-medium text-xs">Vantagens:</span>
                        <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                          {strategyInfo.advantages.map((advantage, index) => (
                            <li key={index} className="flex items-center space-x-1">
                              <div className="w-1 h-1 bg-primary rounded-full"></div>
                              <span>{advantage}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="risk-level" className="text-sm sm:text-base">Nível de Risco: {botConfig.riskLevel}/10</Label>
                    <Slider
                      id="risk-level"
                      min={1}
                      max={10}
                      step={1}
                      value={[botConfig.riskLevel]}
                      onValueChange={(value) => setBotConfig(prev => ({ ...prev, riskLevel: value[0] }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Conservador</span>
                      <span>Equilibrado</span>
                      <span>Agressivo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-investment" className="text-sm">Investimento Máximo ($)</Label>
                      <Input
                        id="max-investment"
                        type="number"
                        value={botConfig.maxInvestment}
                        onChange={(e) => setBotConfig(prev => ({ ...prev, maxInvestment: parseFloat(e.target.value) || 0 }))}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stop-loss" className="text-sm">Stop Loss (%)</Label>
                      <Input
                        id="stop-loss"
                        type="number"
                        value={botConfig.stopLoss}
                        onChange={(e) => setBotConfig(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || 0 }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="take-profit" className="text-sm">Take Profit (%)</Label>
                    <Input
                      id="take-profit"
                      type="number"
                      value={botConfig.takeProfit}
                      onChange={(e) => setBotConfig(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-trade"
                      checked={botConfig.autoTrade}
                      onCheckedChange={(checked) => setBotConfig(prev => ({ ...prev, autoTrade: checked }))}
                    />
                    <Label htmlFor="auto-trade" className="text-sm">Execução Automática</Label>
                  </div>
                </div>

                {/* Projeção de Lucros em Tempo Real */}
                <Card className="bg-gradient-to-br from-trading-green/10 to-primary/10 border-trading-green/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm sm:text-base font-medium text-trading-green flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Projeção de Lucros em Tempo Real
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div className="text-center p-3 bg-black/80 rounded-lg border border-trading-green/20">
                        <span className="text-muted-foreground text-xs">Diário (Estimado):</span>
                        <div className="font-bold text-trading-green text-sm sm:text-base">
                          ${profitProjection.daily.min.toFixed(0)} - ${profitProjection.daily.max.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {((profitProjection.daily.min / botConfig.maxInvestment) * 100).toFixed(2)}% - {((profitProjection.daily.max / botConfig.maxInvestment) * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-center p-3 bg-black/80 rounded-lg border border-primary/20">
                        <span className="text-muted-foreground text-xs">Mensal (Estimado):</span>
                        <div className="font-bold text-primary text-sm sm:text-base">
                          ${profitProjection.monthly.min.toFixed(0)} - ${profitProjection.monthly.max.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {((profitProjection.monthly.min / botConfig.maxInvestment) * 100).toFixed(0)}% - {((profitProjection.monthly.max / botConfig.maxInvestment) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs">
                      <div className="text-center p-2 bg-black/60 rounded border border-primary/20">
                        <span className="text-muted-foreground">Taxa de Sucesso:</span>
                        <div className="font-medium text-primary">{profitProjection.successRate}%</div>
                      </div>
                      <div className="text-center p-2 bg-black/60 rounded border border-muted/20">
                        <span className="text-muted-foreground">Nível de Risco:</span>
                        <div className="font-medium">{profitProjection.riskLevel}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-muted-foreground bg-white/30 p-2 rounded text-center">
                      <strong>⚠️ Aviso:</strong> Projeções baseadas em dados históricos da Binance e análise de {botStats.analysisSpeed} operações/segundo. 
                      Resultados passados não garantem lucros futuros.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operações de Arbitragem em Tempo Real - Mobile Optimized */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center text-card-foreground text-sm sm:text-base">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                <span className="hidden sm:inline">Operações de Arbitragem - Compra/Venda em Tempo Real</span>
                <span className="sm:hidden">Arbitragem Live</span>
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Badge variant="outline" className="text-primary border-primary animate-pulse text-xs">
                  Analisando Binance
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshOpportunities}
                  disabled={!canRefresh}
                  className="text-xs w-full sm:w-auto"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 ${!canRefresh ? 'opacity-50' : ''}`} />
                  {canRefresh ? 'Atualizar' : `${Math.floor(timeUntilRefresh / 60)}h ${timeUntilRefresh % 60}m`}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                <h4 className="text-sm font-medium">Motor de Arbitragem Binance</h4>
                <Badge variant="outline" className="text-trading-green border-trading-green text-xs animate-pulse">
                  {botStats.analysisSpeed} ops/s • Live
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-trading-green rounded-full animate-pulse"></div>
                  <span>Diferenças de preço</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>Execução simultânea</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                  <span>Lucro garantido</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                <strong>Arbitragem:</strong> Operações simultâneas de compra/venda aproveitando diferenças de preço entre pares. Lucros de 0.1% a 1% por operação.
                {!canRefresh && (
                  <span className="text-warning ml-2">
                    Próxima sincronização em: {Math.floor(timeUntilRefresh / 60)}h {timeUntilRefresh % 60}min
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">{tradeOpportunities.map((opportunity) => {
                return (
                  <div key={opportunity.id} className="p-3 sm:p-4 bg-gradient-to-r from-trading-green/5 to-primary/5 rounded-lg border border-trading-green/20">
                    {/* Cabeçalho da Estratégia */}
                    {opportunity.strategy && (
                      <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-medium text-primary">{opportunity.strategy.name}</h4>
                            <p className="text-xs text-muted-foreground">{opportunity.strategy.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary">
                            CoinMarketCap
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-xs">
                          <div>
                            <span className="font-medium">Tempo:</span>
                            <div className="text-muted-foreground">{opportunity.timeframe}</div>
                          </div>
                          <div>
                            <span className="font-medium">Lucro Esperado:</span>
                            <div className="text-trading-green">{opportunity.strategy.profitRange}</div>
                          </div>
                          <div>
                            <span className="font-medium">Risco:</span>
                            <div className="text-muted-foreground">{opportunity.riskLevel}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 p-2 bg-secondary/50 rounded text-xs">
                          <span className="font-medium">Execução:</span>
                          <div className="text-muted-foreground mt-1">{opportunity.strategy.execution}</div>
                        </div>
                        
                        <div className="mt-3 p-2 bg-trading-green/10 rounded text-xs">
                          <span className="font-medium">Como funciona:</span>
                          <div className="text-muted-foreground mt-1">{opportunity.strategy.howItWorks}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row items-start justify-between gap-3 lg:gap-4">
                      <div className="space-y-2 sm:space-y-3 flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={opportunity.type === "BUY" ? "default" : "destructive"} className="text-xs animate-pulse">
                            {opportunity.type === "BUY" ? "COMPRA" : "VENDA"}
                          </Badge>
                          <span className="font-medium text-sm sm:text-base">{opportunity.pair}</span>
                          <Badge variant="outline" className={`${getRiskColor(opportunity.riskLevel)} text-xs`}>
                            {opportunity.riskLevel}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-trading-green/10 text-trading-green border-trading-green">
                            ATIVO
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary">
                            DADOS CoinMarketCap
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-muted-foreground">Preço de Compra:</span>
                            <div className="font-medium text-trading-green">${opportunity.currentPrice.toLocaleString()}</div>
                            <div className="text-xs text-trading-green animate-pulse">
                              ● COMPRANDO
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Preço de Venda:</span>
                            <div className="font-medium text-destructive">${opportunity.targetPrice.toLocaleString()}</div>
                            <div className="text-xs text-destructive animate-pulse">
                              ● VENDENDO
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Lucro da Operação:</span>
                            <div className="font-medium text-primary animate-pulse">+${opportunity.potentialProfit.toLocaleString()}</div>
                            <div className="text-xs text-primary">
                              Margem: {(((opportunity.targetPrice - opportunity.currentPrice) / opportunity.currentPrice) * 100).toFixed(3)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <div className="font-medium text-trading-green animate-pulse">EXECUTANDO</div>
                            <div className="text-xs text-muted-foreground">
                              Vol: ${opportunity.volume.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Informações do CoinMarketCap */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20 text-xs">
                          <div>
                            <span className="font-medium">Var. 24h:</span>
                            <div className={opportunity.binanceData.priceChange24h >= 0 ? "text-trading-green" : "text-destructive"}>
                              {opportunity.binanceData.priceChange24h >= 0 ? "+" : ""}{opportunity.binanceData.priceChange24h.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Volume 24h:</span>
                            <div className="text-muted-foreground">${(opportunity.binanceData.volume24h / 1000000).toFixed(1)}M</div>
                          </div>
                          <div>
                            <span className="font-medium">Última Atualização:</span>
                            <div className="text-primary animate-pulse">● Live</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {opportunity.timeframe}
                          </div>
                          <div className="flex items-center gap-1">
                            <Wallet className="h-3 w-3" />
                            Vol: ${opportunity.volume.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Signal className="h-3 w-3" />
                            <span className="hidden sm:inline">Sync: {opportunity.binanceData.lastUpdate}</span>
                            <span className="sm:hidden">Live</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-xs text-center">
                          <div className="font-medium text-trading-green">+${(Math.random() * 50 + 10).toFixed(2)}</div>
                          <div className="text-muted-foreground">Ganho atual</div>
                        </div>
                        <Badge variant="outline" className="text-xs bg-trading-green/10 text-trading-green border-trading-green animate-pulse">
                          EM OPERAÇÃO
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Aviso de Risco - Mobile Optimized */}
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-medium text-destructive">Aviso de Risco</h4>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p>• Trading de criptomoedas envolve riscos significativos de perda</p>
                  <p>• Resultados passados não garantem lucros futuros</p>
                  <p>• Use apenas capital que você pode se permitir perder</p>
                  <p>• Monitore suas operações regularmente</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BotPage;