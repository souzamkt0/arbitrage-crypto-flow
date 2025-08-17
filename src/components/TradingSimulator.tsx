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
import { TradingProfitsService } from "@/services/tradingProfitsService";

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
  const [startTime, setStartTime] = useState<number>(0);

  const exchangeList = [
    { 
      name: "Binance", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGM0JBMkYiLz4KPHBhdGggZD0iTTEwLjU4IDE0LjU4TDE2IDE5TDIxLjQyIDE0LjU4TDE5IDEyLjE2TDE2IDEzVjlIMTRWMTNMMTEgMTIuMTZMMTAuNTggMTQuNThaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
      color: "#F3BA2F"
    },
    { 
      name: "Coinbase", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDUyRkYiLz4KPHBhdGggZD0iTTE2IDIyQzE5LjMxIDIyIDIyIDE5LjMxIDIyIDE2QzIyIDEyLjY5IDE5LjMxIDEwIDE2IDEwQzEyLjY5IDEwIDEwIDEyLjY5IDEwIDE2QzEwIDE5LjMxIDEyLjY5IDIyIDE2IDIyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==",
      color: "#0052FF"
    },
    { 
      name: "Kraken", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM1NzMzRkYiLz4KPHBhdGggZD0iTTE2IDEwSDEwVjIySDEzVjE4SDE2QzE4LjIxIDE4IDIwIDE2LjIxIDIwIDE0QzIwIDExLjc5IDE4LjIxIDEwIDE2IDEwWk0xNiAxNUgxM1YxM0gxNkMxNi41NSAxMyAxNyAxMy40NSAxNyAxNEMxNyAxNC41NSAxNi41NSAxNSAxNiAxNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=",
      color: "#5733FF"
    },
    { 
      name: "KuCoin", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMyNEQzNjYiLz4KPHBhdGggZD0iTTEyIDEwSDEwVjE0SDE0VjEySDEyVjEwWk0yMiAxOEgyMFYyMkgxOFYyMEgxNlYxOEgxOFYxNkgyMFYxOEgyMlpNMTQgMTRIMTZWMTZIMTRWMTRaTTE4IDE0SDE2VjE2SDE4VjE0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==",
      color: "#24D366"
    },
    { 
      name: "Huobi", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMxNjc2RjMiLz4KPHBhdGggZD0iTTEwIDEwSDEzVjE2SDEwVjEwWk0xOSAxMEgyMlYxNkgxOVYxMFpNMTMgMTlIMTlWMjJIMTNWMTlaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
      color: "#1676F3"
    },
    { 
      name: "Bybit", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGN0EzM0EiLz4KPHBhdGggZD0iTTEwIDEwSDEzVjEzSDEwVjEwWk0xNiAxMEgxOVYxM0gxNlYxMFpNMTAgMTZIMTNWMTlIMTBWMTZaTTE2IDE2SDE5VjE5SDE2VjE2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==",
      color: "#F7A33A"
    },
    { 
      name: "OKX", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDAwMDAiLz4KPHBhdGggZD0iTTEwIDEwSDEzVjEzSDEwVjEwWk0xMy41IDEzLjVIMTYuNVYxNi41SDEzLjVWMTMuNVpNMTYuNSAxNi41SDE5LjVWMTkuNUgxNi41VjE2LjVaTTE5IDE5SDIyVjIyUDE5VjE5WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==",
      color: "#000000"
    },
    { 
      name: "Gate.io", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMzOTZGRkYiLz4KPHBhdGggZD0iTTE2IDEwQzEyLjY5IDEwIDEwIDEyLjY5IDEwIDE2QzEwIDE5LjMxIDEyLjY5IDIyIDE2IDIyQzE5LjMxIDIyIDIyIDE5LjMxIDIyIDE2QzIyIDEyLjY5IDE5LjMxIDEwIDE2IDEwWk0xNiAyMEMxMy43OSAyMCAxMiAxOC4yMSAxMiAxNkMxMiAxMy43OSAxMy43OSAxMiAxNiAxMkMxOC4yMSAxMiAyMCAxMy43OSAyMCAxNkMyMCAxOC4yMSAxOC4yMSAyMCAxNiAyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=",
      color: "#396FFF"
    }
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
      // Calcular lucro baseado na taxa diária real (2.5% = 0.025)
      const dailyProfitRate = dailyRate / 100; // Converter porcentagem para decimal
      const profit = (investmentAmount * dailyProfitRate) / numExchanges; // Lucro total dividido pelo número de exchanges

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
      // Registrar ganho no Supabase
      const recordProfit = async () => {
        try {
          const profitData = {
            investment_amount: investmentAmount,
            daily_rate: dailyRate,
            plan_name: planName,
            total_profit: newTotalProfit,
            exchanges_count: exchanges.length,
            completed_operations: completedCount,
            execution_time_seconds: Math.floor((Date.now() - startTime) / 1000),
            profit_per_exchange: newTotalProfit / exchanges.length,
            metadata: {
              exchanges: exchanges.map(ex => ({
                name: ex.name,
                pair: ex.pair,
                profit: ex.profit,
                status: ex.status
              }))
            }
          };

          const recordedProfit = await TradingProfitsService.recordProfit(profitData);
          if (recordedProfit) {
            console.log('Ganho registrado com sucesso:', recordedProfit);
          } else {
            console.error('Erro ao registrar ganho');
          }
        } catch (error) {
          console.error('Erro ao registrar ganho de trading:', error);
        }
      };

      recordProfit();

      setTimeout(() => {
        onComplete(newTotalProfit);
        onClose();
      }, 2000);
    }
  }, [exchanges, onComplete, onClose, investmentAmount, dailyRate, planName]);

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(Date.now());
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto bg-black border border-green-400/30 shadow-2xl shadow-green-400/10">
        {/* Trading Terminal Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] rounded-lg" />
        {/* Market Data Stream Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(0,255,0,0.05)_0%,transparent_50%),radial-gradient(circle_at_90%_80%,rgba(255,215,0,0.05)_0%,transparent_50%)] rounded-lg" />
        
        <DialogHeader className="relative z-10">
          {/* Terminal Header Bar */}
          <div className="bg-gray-900/90 border-b border-green-400/30 p-4 rounded-t-lg">
            {/* Terminal Dots */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="ml-4 text-green-400 font-mono text-sm">
                CRYPTO_ARBITRAGE_TERMINAL_v4.0.0
              </div>
            </div>
            
            <DialogTitle className="font-mono text-green-400 text-lg flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white">SISTEMA:</span>
                <span className="text-green-400">ATIVO</span>
              </div>
              <div className="text-yellow-400">|</div>
              <div className="text-gray-300">
                PLANO: <span className="text-yellow-400">{planName}</span>
              </div>
            {totalActiveOperations > 0 && (
                <>
                  <div className="text-yellow-400">|</div>
                  <div className="text-blue-400">
                    BOOST: +{Math.floor(totalActiveOperations / 2)}
                  </div>
                </>
            )}
          </DialogTitle>
          </div>
          
          {/* Market Status Bar */}
          <div className="bg-black/80 border-b border-green-400/20 p-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-6">
                <div className="text-green-400">
                  ● EXCHANGES: <span className="text-white">{exchanges.length}</span>
                </div>
                <div className="text-yellow-400">
                  ● LATÊNCIA: <span className="text-white">12ms</span>
                </div>
                <div className="text-blue-400">
                  ● STATUS: <span className="text-white">CONECTADO</span>
                </div>
              </div>
              <div className="text-green-400">
                {new Date().toLocaleTimeString()} UTC
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 relative z-10 p-4">
          {/* Market Data Dashboard */}
          <div className="bg-black/60 border border-green-400/30 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
              {/* Capital */}
              <div className="bg-black/80 border border-yellow-400/30 p-3">
                <div className="text-xs text-yellow-400 mb-1">CAPITAL</div>
                <div className="text-xl font-bold text-white">${investmentAmount}</div>
                <div className="text-xs text-gray-500">USD</div>
              </div>
              
              {/* Daily Rate */}
              <div className="bg-black/80 border border-green-400/30 p-3">
                <div className="text-xs text-green-400 mb-1">TAXA DIÁRIA</div>
                <div className="text-xl font-bold text-green-400">+{dailyRate}%</div>
                <div className="text-xs text-gray-500">APY</div>
              </div>
              
              {/* Operations */}
              <div className="bg-black/80 border border-blue-400/30 p-3">
                <div className="text-xs text-blue-400 mb-1">OPERAÇÕES</div>
                <div className="text-xl font-bold text-white">{completedOperations}/{exchanges.length}</div>
                <div className="text-xs text-gray-500">EXEC</div>
              </div>
              
              {/* PNL */}
              <div className="bg-black/80 border border-green-400/30 p-3">
                <div className="text-xs text-green-400 mb-1">PNL</div>
                <div className="text-xl font-bold text-green-400">+${totalProfit.toFixed(2)}</div>
                <div className="text-xs text-gray-500">USD</div>
              </div>
            </div>
          </div>

          {/* Terminal Execute Button */}
          {!isRunning && completedOperations === 0 && (
            <div className="text-center py-4">
              <div className="bg-black/80 border border-green-400/30 rounded-lg p-6">
                <div className="font-mono text-green-400 text-sm mb-4">
                  {'>'} READY TO EXECUTE ARBITRAGE OPERATIONS
                </div>
                
                <Button 
                  onClick={handleStart} 
                  className="bg-green-400/20 hover:bg-green-400/30 border border-green-400 text-green-400 font-mono font-bold py-3 px-8 rounded transition-all duration-200 hover:shadow-lg hover:shadow-green-400/20"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  EXECUTE TRADING_BOT.sh
                </Button>
                
                <div className="mt-4 font-mono text-xs text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                    <span>ALGORITHMS LOADED</span>
                    <div className="text-green-400">●</div>
                    <span>EXCHANGES CONNECTED</span>
                    <div className="text-green-400">●</div>
                    <span>LATENCY: 12MS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exchange Market Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exchanges.map((exchange, index) => (
              <div 
                key={index} 
                className={`bg-black/80 border font-mono rounded transition-all duration-300 ${
                  exchange.status === 'completed' 
                    ? 'border-green-400/50 shadow-lg shadow-green-400/20' 
                    : exchange.status === 'analyzing'
                    ? 'border-yellow-400/50 shadow-lg shadow-yellow-400/20'
                    : exchange.status === 'buying'
                    ? 'border-blue-400/50 shadow-lg shadow-blue-400/20'
                    : 'border-red-400/50 shadow-lg shadow-red-400/20'
                }`}
              >
                                {/* Terminal Header */}
                <div className="bg-gray-900/50 border-b border-gray-700/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-black/60 border border-gray-600/50 flex items-center justify-center">
                        <img 
                          src={exchange.logo} 
                          alt={exchange.name}
                          className="w-6 h-6 rounded object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-xs">${
                                exchange.name === 'Binance' ? '🟡' :
                                exchange.name === 'Coinbase' ? '🔵' :
                                exchange.name === 'Kraken' ? '🟣' :
                                exchange.name === 'KuCoin' ? '🟢' :
                                exchange.name === 'Huobi' ? '🔴' :
                                exchange.name === 'Bybit' ? '🟠' :
                                exchange.name === 'OKX' ? '⚫' :
                                '🟤'
                              }</span>`;
                            }
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-white text-sm font-bold">{exchange.name}</div>
                        <div className="text-gray-400 text-xs">{exchange.pair}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs font-mono ${
                      exchange.status === 'completed' 
                        ? 'text-green-400' 
                        : exchange.status === 'analyzing'
                        ? 'text-yellow-400 animate-pulse'
                        : exchange.status === 'buying'
                        ? 'text-blue-400'
                        : 'text-red-400'
                    }`}>
                      [{getStatusText(exchange.status).toUpperCase()}]
                    </div>
                  </div>
                </div>
                {/* Market Data Content */}
                <div className="p-3 space-y-3">
                  {/* Price Data */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/60 p-2 border border-red-500/30">
                      <div className="text-red-400 mb-1">BID</div>
                      <div className="text-white font-mono">${exchange.buyPrice.toFixed(2)}</div>
                    </div>
                    <div className="bg-black/60 p-2 border border-green-500/30">
                      <div className="text-green-400 mb-1">ASK</div>
                      <div className="text-white font-mono">${exchange.sellPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Market Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/60 p-2 border border-yellow-500/30">
                      <div className="text-yellow-400 mb-1">SPREAD</div>
                      <div className="text-white font-mono">{exchange.spread.toFixed(3)}%</div>
                    </div>
                    <div className="bg-black/60 p-2 border border-blue-500/30">
                      <div className="text-blue-400 mb-1">VOL_24H</div>
                      <div className="text-white font-mono">${(exchange.volume / 1000).toFixed(0)}K</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-black/60 p-2 border border-gray-500/30">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">PROGRESS</span>
                      <span className="text-white font-mono">{exchange.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded">
                      <div 
                        className={`h-2 rounded transition-all duration-300 ${
                          exchange.status === 'completed' 
                            ? 'bg-green-400' 
                            : exchange.status === 'analyzing'
                            ? 'bg-yellow-400 animate-pulse'
                            : exchange.status === 'buying'
                            ? 'bg-blue-400'
                            : 'bg-red-400'
                        }`}
                        style={{ width: `${exchange.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* PNL */}
                  <div className="bg-black/60 p-2 border border-green-500/30 text-center">
                    <div className="text-green-400 text-xs mb-1">EST_PNL</div>
                    <div className="text-green-400 font-mono font-bold">+${exchange.profit.toFixed(2)}</div>
                  </div>

                  {/* Status/Timer */}
                  {exchange.status !== 'completed' ? (
                    <div className="bg-black/60 p-2 border border-gray-500/30 text-center">
                      <div className="text-gray-400 font-mono text-xs">
                        TIME_REMAINING: {exchange.timeRemaining.toFixed(0)}s
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black/60 p-2 border border-green-500/30 text-center">
                      <div className="text-green-400 font-mono text-xs font-bold">
                        [OPERATION_COMPLETED]
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
        
        {/* Terminal Footer */}
        <div className="mt-6 pt-4 border-t border-green-400/30 relative z-10">
          <div className="bg-black/60 p-3 rounded font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-green-400">SYSTEM_STATUS:</div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400">ONLINE</span>
                </div>
                <div className="text-yellow-400">|</div>
                <div className="text-blue-400">CONNECTIONS: {exchanges.length}</div>
                <div className="text-yellow-400">|</div>
                <div className="text-gray-400">LATENCY: 12MS</div>
              </div>
              <div className="text-green-400">
                {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="mt-2 text-gray-500 text-center">
              CRYPTO_ARBITRAGE_BOT © 2024 - PROFESSIONAL TRADING SYSTEM
            </div>
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