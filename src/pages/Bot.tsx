import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

interface BotStats {
  totalProfit: number;
  todayProfit: number;
  successRate: number;
  activeTrades: number;
  completedTrades: number;
  totalVolume: number;
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
    totalVolume: 125400
  });

  const [tradeOpportunities, setTradeOpportunities] = useState<TradeOpportunity[]>([
    {
      id: "1",
      pair: "BTC/USDT",
      type: "BUY",
      currentPrice: 43250.00,
      targetPrice: 44100.00,
      potentialProfit: 850.00,
      confidence: 87,
      timeframe: "15m",
      volume: 2500,
      riskLevel: "MEDIUM"
    },
    {
      id: "2",
      pair: "ETH/USDT",
      type: "SELL",
      currentPrice: 2485.50,
      targetPrice: 2420.00,
      potentialProfit: 520.00,
      confidence: 92,
      timeframe: "5m",
      volume: 1800,
      riskLevel: "LOW"
    },
    {
      id: "3",
      pair: "SOL/USDT",
      type: "BUY",
      currentPrice: 98.75,
      targetPrice: 102.30,
      potentialProfit: 355.00,
      confidence: 75,
      timeframe: "30m",
      volume: 3200,
      riskLevel: "HIGH"
    }
  ]);

  const [selectedOpportunity, setSelectedOpportunity] = useState<TradeOpportunity | null>(null);
  const [isConnected, setIsConnected] = useState(true);
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

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
              <Bot className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary" />
              <span className="hidden sm:inline">Bot de Trading</span>
              <span className="sm:hidden">Bot</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gerencie seu bot automatizado conectado à Binance
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center">
              {isConnected ? (
                <CheckCircle className="h-4 w-4 mr-1" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-1" />
              )}
              {isConnected ? "Binance Conectada" : "Desconectado"}
            </Badge>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="bot-toggle" className="text-sm font-medium">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
              <DollarSign className="h-4 w-4 text-trading-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-trading-green">
                +${botStats.totalProfit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{botStats.todayProfit.toFixed(2)} hoje
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {botStats.successRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                {botStats.completedTrades} operações
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operações Ativas</CardTitle>
              <Activity className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {botStats.activeTrades}
              </div>
              <p className="text-xs text-muted-foreground">
                Em andamento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume</CardTitle>
              <Wallet className="h-4 w-4 text-secondary-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary-foreground">
                ${botStats.totalVolume.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Volume total
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Mercado */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Análise de Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Gráfico Principal */}
                <div className="p-4 bg-background/50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Signal className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">BTC/USDT</span>
                      <Badge variant="outline" className="text-trading-green border-trading-green">
                        +2.34%
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tempo real
                    </div>
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
                  
                  {/* Indicadores técnicos */}
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações do Bot */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Settings className="h-5 w-5 mr-2 text-primary" />
                Configurações do Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="strategy">Estratégia</Label>
                    <Select value={botConfig.strategy} onValueChange={(value) => setBotConfig(prev => ({ ...prev, strategy: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scalping">Scalping</SelectItem>
                        <SelectItem value="swing">Swing Trading</SelectItem>
                        <SelectItem value="arbitrage">Arbitragem</SelectItem>
                        <SelectItem value="grid">Grid Trading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="risk-level">Nível de Risco: {botConfig.riskLevel}/10</Label>
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
                      <span>Agressivo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-investment">Investimento Máximo ($)</Label>
                      <Input
                        id="max-investment"
                        type="number"
                        value={botConfig.maxInvestment}
                        onChange={(e) => setBotConfig(prev => ({ ...prev, maxInvestment: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stop-loss">Stop Loss (%)</Label>
                      <Input
                        id="stop-loss"
                        type="number"
                        value={botConfig.stopLoss}
                        onChange={(e) => setBotConfig(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="take-profit">Take Profit (%)</Label>
                    <Input
                      id="take-profit"
                      type="number"
                      value={botConfig.takeProfit}
                      onChange={(e) => setBotConfig(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-trade"
                      checked={botConfig.autoTrade}
                      onCheckedChange={(checked) => setBotConfig(prev => ({ ...prev, autoTrade: checked }))}
                    />
                    <Label htmlFor="auto-trade">Execução Automática</Label>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Projeção de Lucros</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Diário:</span>
                      <div className="font-medium text-trading-green">+$125-$380</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mensal:</span>
                      <div className="font-medium text-primary">+$3,750-$11,400</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Melhores Oportunidades */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-card-foreground">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Melhores Oportunidades
              </CardTitle>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tradeOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="p-4 bg-secondary rounded-lg border border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={opportunity.type === "BUY" ? "default" : "secondary"}>
                          {opportunity.type}
                        </Badge>
                        <span className="font-medium">{opportunity.pair}</span>
                        <Badge variant="outline" className={getRiskColor(opportunity.riskLevel)}>
                          {opportunity.riskLevel}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Preço Atual:</span>
                          <div className="font-medium">${opportunity.currentPrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Alvo:</span>
                          <div className="font-medium">${opportunity.targetPrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lucro Potencial:</span>
                          <div className="font-medium text-trading-green">+${opportunity.potentialProfit.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confiança:</span>
                          <div className="font-medium text-primary">{opportunity.confidence}%</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {opportunity.timeframe}
                        </div>
                        <div className="flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          Vol: ${opportunity.volume.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecuteTrade(opportunity)}
                        disabled={!botConfig.isActive}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Executar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BotPage;