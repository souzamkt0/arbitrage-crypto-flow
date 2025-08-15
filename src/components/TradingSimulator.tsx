import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpDown,
  Activity,
  Zap,
  Timer,
  Bot,
  Play,
  Pause,
  DollarSign,
  Target,
  Sparkles
} from "lucide-react";

interface Exchange {
  name: string;
  logo: string;
  pair: string;
  buyPrice: number;
  sellPrice: number;
  volume: number;
  spread: number;
  profit: number;
  status: 'analyzing' | 'buying' | 'selling' | 'completed';
  progress: number;
  timeRemaining: number;
}

interface TradingSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  investmentAmount: number;
  dailyRate: number;
  planName: string;
  totalActiveOperations?: number; // Total de operações de todos os planos ativos
  onComplete: (profit: number) => void;
}

const TradingSimulator = ({ 
  isOpen, 
  onClose, 
  investmentAmount, 
  dailyRate,
  planName,
  totalActiveOperations = 0,
  onComplete 
}: TradingSimulatorProps) => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [totalProfit, setTotalProfit] = useState(0);
  const [completedOperations, setCompletedOperations] = useState(0);

  const exchangeList = [
    { name: "Binance", logo: "🟡" },
    { name: "Coinbase Pro", logo: "🔵" },
    { name: "Kraken", logo: "🟣" },
    { name: "KuCoin", logo: "🟢" },
    { name: "Huobi", logo: "🔴" },
    { name: "Bybit", logo: "🟠" },
    { name: "OKX", logo: "⚫" },
    { name: "Gate.io", logo: "🟤" }
  ];

  const cryptoPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "SOL/USDT", "XRP/USDT"];

  const generateExchangeData = (): Exchange[] => {
    // Determinar número de exchanges baseado no plano atual
    let currentPlanOperations = 2; // Padrão para 4.0.0
    
    if (planName?.includes('4.0.5') || dailyRate === 3) {
      currentPlanOperations = 3;
    } else if (planName?.includes('4.1.0') || dailyRate === 4) {
      currentPlanOperations = 4;
    }

    // Se tem outros planos ativos, pode usar mais exchanges (máximo 8)
    const maxExchanges = Math.min(currentPlanOperations + Math.floor(totalActiveOperations / 2), 8);
    const numExchanges = Math.max(currentPlanOperations, maxExchanges);
    
    // Usar apenas o número necessário de exchanges
    const selectedExchanges = exchangeList.slice(0, numExchanges);
    
    return selectedExchanges.map((exchange, index) => {
      const pair = cryptoPairs[Math.floor(Math.random() * cryptoPairs.length)];
      const basePrice = Math.random() * 50000 + 1000;
      const spread = 0.001 + Math.random() * 0.002; // 0.1% a 0.3% spread
      const buyPrice = basePrice;
      const sellPrice = basePrice * (1 + spread);
      const volume = Math.random() * 1000000 + 100000;
      const profit = (investmentAmount * (dailyRate / 100)) / numExchanges; // Dividir pelo número correto

      return {
        name: exchange.name,
        logo: exchange.logo,
        pair,
        buyPrice,
        sellPrice,
        volume,
        spread: spread * 100,
        profit,
        status: 'analyzing',
        progress: 0,
        timeRemaining: 15 + Math.random() * 30 // 15-45 segundos
      };
    });
  };

  useEffect(() => {
    if (isOpen) {
      setExchanges(generateExchangeData());
      setIsRunning(false);
      setTotalProfit(0);
      setCompletedOperations(0);
    }
  }, [isOpen, investmentAmount, dailyRate, planName, totalActiveOperations]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setExchanges(prev => prev.map(exchange => {
        if (exchange.status === 'completed') return exchange;

        let newProgress = exchange.progress + 2;
        let newTimeRemaining = Math.max(exchange.timeRemaining - 1, 0);
        let newStatus: 'analyzing' | 'buying' | 'selling' | 'completed' = exchange.status;

        // Mudar status baseado no progresso
        if (newProgress < 30) {
          newStatus = 'analyzing';
        } else if (newProgress < 70) {
          newStatus = 'buying';
        } else if (newProgress < 100) {
          newStatus = 'selling';
        } else {
          newStatus = 'completed';
          newProgress = 100;
          newTimeRemaining = 0;
        }

        return {
          ...exchange,
          progress: newProgress,
          timeRemaining: newTimeRemaining,
          status: newStatus
        };
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const completedCount = exchanges.filter(ex => ex.status === 'completed').length;
    const newTotalProfit = exchanges
      .filter(ex => ex.status === 'completed')
      .reduce((sum, ex) => sum + ex.profit, 0);
    
    setCompletedOperations(completedCount);
    setTotalProfit(newTotalProfit);

    if (completedCount === exchanges.length && exchanges.length > 0) {
      setTimeout(() => {
        onComplete(newTotalProfit);
        onClose();
      }, 2000);
    }
  }, [exchanges, onComplete, onClose]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing': return 'bg-yellow-500/20 text-yellow-400';
      case 'buying': return 'bg-blue-500/20 text-blue-400';
      case 'selling': return 'bg-green-500/20 text-green-400';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzing': return <Activity className="h-3 w-3" />;
      case 'buying': return <TrendingDown className="h-3 w-3" />;
      case 'selling': return <TrendingUp className="h-3 w-3" />;
      case 'completed': return <Zap className="h-3 w-3" />;
      default: return <Timer className="h-3 w-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'analyzing': return 'Analisando';
      case 'buying': return 'Comprando';
      case 'selling': return 'Vendendo';
      case 'completed': return 'Concluído';
      default: return 'Aguardando';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto bg-gradient-to-br from-background via-background/95 to-primary/5 border-2 border-primary/20">
        <DialogHeader className="relative">
          {/* Background decorativo */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-trading-green/10 rounded-t-lg -z-10" />
          
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="relative">
              <Bot className="h-6 w-6 text-primary animate-pulse" />
              <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <span className="bg-gradient-to-r from-primary to-trading-green bg-clip-text text-transparent">
              Trading Automatizado - {planName}
            </span>
            {totalActiveOperations > 0 && (
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-trading-green/20 border-primary/30 animate-pulse">
                <Target className="h-3 w-3 mr-1" />
                +{Math.floor(totalActiveOperations / 2)} operações extras
              </Badge>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Sistema de arbitragem em tempo real conectado às principais exchanges
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Aprimorado */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <DollarSign className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-xs text-muted-foreground mb-1">Investimento</div>
                <div className="text-xl font-bold text-primary">${investmentAmount}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-trading-green/10 to-trading-green/5 border-trading-green/20 hover:border-trading-green/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-trading-green/5 to-transparent" />
                <TrendingUp className="h-5 w-5 text-trading-green mx-auto mb-2" />
                <div className="text-xs text-muted-foreground mb-1">Taxa Diária</div>
                <div className="text-xl font-bold text-trading-green">{dailyRate}%</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                <Activity className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                <div className="text-xs text-muted-foreground mb-1">Operações</div>
                <div className="text-xl font-bold text-foreground">{completedOperations}/{exchanges.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
                <Zap className="h-5 w-5 text-yellow-400 mx-auto mb-2 animate-pulse" />
                <div className="text-xs text-muted-foreground mb-1">Lucro Total</div>
                <div className="text-xl font-bold text-trading-green animate-pulse">+${totalProfit.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Botão de Iniciar Aprimorado */}
          {!isRunning && completedOperations === 0 && (
            <div className="text-center py-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-trading-green rounded-lg blur-lg opacity-30 animate-pulse" />
                <Button 
                  onClick={handleStart} 
                  className="relative bg-gradient-to-r from-primary to-trading-green hover:from-primary/90 hover:to-trading-green/90 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-3 animate-pulse" />
                  <span className="text-lg">Iniciar Trading Automatizado</span>
                  <Sparkles className="h-4 w-4 ml-3 animate-bounce" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 max-w-md mx-auto">
                O sistema irá conectar-se às exchanges e executar operações de arbitragem em tempo real
              </p>
            </div>
          )}

          {/* Lista de Exchanges Aprimorada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exchanges.map((exchange, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-500 transform hover:scale-102 ${
                  exchange.status === 'completed' 
                    ? 'bg-gradient-to-br from-trading-green/20 to-trading-green/5 border-trading-green/30 shadow-lg shadow-trading-green/20' 
                    : exchange.status === 'analyzing'
                    ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 shadow-lg shadow-yellow-500/20'
                    : exchange.status === 'buying'
                    ? 'bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30 shadow-lg shadow-blue-500/20'
                    : 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 shadow-lg shadow-primary/20'
                }`}
              >
                {/* Efeito de brilho animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="text-2xl drop-shadow-lg">{exchange.logo}</span>
                        {exchange.status === 'completed' && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-trading-green rounded-full animate-ping" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-base">{exchange.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">{exchange.pair}</div>
                      </div>
                    </div>
                    <Badge className={`text-xs font-semibold px-3 py-1 ${getStatusColor(exchange.status)} animate-pulse`}>
                      {getStatusIcon(exchange.status)}
                      <span className="ml-2">{getStatusText(exchange.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preços com design aprimorado */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                      <div className="text-xs text-red-400 mb-1 flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Compra
                      </div>
                      <div className="font-bold text-red-400 text-lg">${exchange.buyPrice.toFixed(2)}</div>
                    </div>
                    <div className="bg-trading-green/10 rounded-lg p-3 border border-trading-green/20">
                      <div className="text-xs text-trading-green mb-1 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Venda
                      </div>
                      <div className="font-bold text-trading-green text-lg">${exchange.sellPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Spread e Volume com ícones */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                      <div className="text-xs text-primary mb-1 flex items-center">
                        <ArrowUpDown className="h-3 w-3 mr-1" />
                        Spread
                      </div>
                      <div className="font-bold text-primary">{exchange.spread.toFixed(3)}%</div>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                      <div className="text-xs text-blue-400 mb-1 flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        Volume 24h
                      </div>
                      <div className="font-bold text-blue-400">${(exchange.volume / 1000).toFixed(0)}K</div>
                    </div>
                  </div>

                  {/* Progresso com animação */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-foreground">Progresso da Operação</span>
                      <span className="text-primary">{exchange.progress.toFixed(0)}%</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={exchange.progress} 
                        className="h-3 bg-muted/30" 
                      />
                      {exchange.progress > 0 && exchange.progress < 100 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Lucro Esperado com destaque */}
                  <div className="text-center bg-trading-green/10 rounded-lg p-3 border border-trading-green/20">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Lucro Esperado
                    </div>
                    <div className="font-bold text-trading-green text-xl">+${exchange.profit.toFixed(2)}</div>
                  </div>

                  {/* Tempo Restante com animação */}
                  {exchange.status !== 'completed' && (
                    <div className="text-center bg-muted/20 rounded-lg p-2">
                      <div className="text-xs text-muted-foreground flex items-center justify-center">
                        <Timer className="h-3 w-3 mr-1 animate-spin" />
                        <span className="animate-pulse">{exchange.timeRemaining}s restantes</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Indicador de conclusão */}
                  {exchange.status === 'completed' && (
                    <div className="text-center bg-trading-green/20 rounded-lg p-3 border border-trading-green/30">
                      <div className="text-sm text-trading-green font-bold flex items-center justify-center">
                        <Zap className="h-4 w-4 mr-2 animate-bounce" />
                        Operação Concluída!
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progresso Geral Aprimorado */}
          {isRunning && (
            <Card className="bg-gradient-to-r from-primary/10 via-trading-green/10 to-primary/10 border-2 border-primary/20 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <Bot className="h-6 w-6 text-primary animate-pulse" />
                    <div className="text-lg font-bold bg-gradient-to-r from-primary to-trading-green bg-clip-text text-transparent">
                      Progresso Geral do Trading
                    </div>
                    <Activity className="h-6 w-6 text-trading-green animate-bounce" />
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={(completedOperations / exchanges.length) * 100} 
                      className="h-4 bg-muted/30" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{completedOperations}</div>
                      <div className="text-xs text-muted-foreground">Concluídas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-muted-foreground">{exchanges.length - completedOperations}</div>
                      <div className="text-xs text-muted-foreground">Em Andamento</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-trading-green">{exchanges.length}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <span className="animate-pulse">🔄 Sistema executando operações automaticamente...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Footer com informações adicionais */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>🔒 Conexão segura com as principais exchanges mundiais</p>
            <p>⚡ Execução automatizada em tempo real • 🎯 Algoritmos de arbitragem avançados</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradingSimulator;

// Adicionar estilos CSS customizados para animações
const styles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Injetar estilos no documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}