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
  Pause
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
  onComplete: (profit: number) => void;
}

const TradingSimulator = ({ 
  isOpen, 
  onClose, 
  investmentAmount, 
  dailyRate,
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
    return exchangeList.map((exchange, index) => {
      const pair = cryptoPairs[Math.floor(Math.random() * cryptoPairs.length)];
      const basePrice = Math.random() * 50000 + 1000;
      const spread = 0.001 + Math.random() * 0.002; // 0.1% a 0.3% spread
      const buyPrice = basePrice;
      const sellPrice = basePrice * (1 + spread);
      const volume = Math.random() * 1000000 + 100000;
      const profit = (investmentAmount * (dailyRate / 100)) / 8; // Dividir por 8 exchanges

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
  }, [isOpen, investmentAmount, dailyRate]);

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Simulação de Trading em Tempo Real
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/50">
              <CardContent className="p-3 text-center">
                <div className="text-sm text-muted-foreground">Investimento</div>
                <div className="text-lg font-bold text-primary">${investmentAmount}</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-3 text-center">
                <div className="text-sm text-muted-foreground">Taxa Diária</div>
                <div className="text-lg font-bold text-trading-green">{dailyRate}%</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-3 text-center">
                <div className="text-sm text-muted-foreground">Operações</div>
                <div className="text-lg font-bold text-foreground">{completedOperations}/{exchanges.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-3 text-center">
                <div className="text-sm text-muted-foreground">Lucro Total</div>
                <div className="text-lg font-bold text-trading-green">+${totalProfit.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Botão de Iniciar */}
          {!isRunning && completedOperations === 0 && (
            <div className="text-center">
              <Button onClick={handleStart} className="bg-primary hover:bg-primary/90">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Simulação de Trading
              </Button>
            </div>
          )}

          {/* Lista de Exchanges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exchanges.map((exchange, index) => (
              <Card key={index} className="bg-card/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{exchange.logo}</span>
                      <div>
                        <div className="font-semibold text-sm">{exchange.name}</div>
                        <div className="text-xs text-muted-foreground">{exchange.pair}</div>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(exchange.status)}`}>
                      {getStatusIcon(exchange.status)}
                      <span className="ml-1">{getStatusText(exchange.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Preços */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Compra</div>
                      <div className="font-bold text-trading-red">${exchange.buyPrice.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Venda</div>
                      <div className="font-bold text-trading-green">${exchange.sellPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Spread e Volume */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Spread</div>
                      <div className="font-bold">{exchange.spread.toFixed(3)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Volume 24h</div>
                      <div className="font-bold">${(exchange.volume / 1000).toFixed(0)}K</div>
                    </div>
                  </div>

                  {/* Progresso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progresso</span>
                      <span>{exchange.progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={exchange.progress} className="h-2" />
                  </div>

                  {/* Lucro Esperado */}
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Lucro Esperado</div>
                    <div className="font-bold text-trading-green">+${exchange.profit.toFixed(2)}</div>
                  </div>

                  {/* Tempo Restante */}
                  {exchange.status !== 'completed' && (
                    <div className="text-center text-xs text-muted-foreground">
                      <Timer className="h-3 w-3 inline mr-1" />
                      {exchange.timeRemaining}s restantes
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progresso Geral */}
          {isRunning && (
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium">Progresso Geral da Simulação</div>
                  <Progress value={(completedOperations / exchanges.length) * 100} className="h-3" />
                  <div className="text-xs text-muted-foreground">
                    {completedOperations} de {exchanges.length} operações concluídas
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradingSimulator;