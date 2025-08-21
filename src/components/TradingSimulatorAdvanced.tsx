import { useState, useEffect, useCallback } from "react";
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
  Sparkles,
  BarChart3,
  Monitor,
  Signal,
  Cpu,
  WifiHigh
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Tooltip,
  CartesianGrid
} from "recharts";
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
  priceHistory: Array<{ time: number; price: number; volume: number }>;
}

interface TradingSimulatorAdvancedProps {
  isOpen: boolean;
  onClose: () => void;
  investmentAmount: number;
  dailyRate: number;
  planName: string;
  totalActiveOperations?: number;
  onComplete: (profit: number) => void;
}

const TradingSimulatorAdvanced = ({ 
  isOpen, 
  onClose, 
  investmentAmount, 
  dailyRate,
  planName,
  totalActiveOperations = 0,
  onComplete 
}: TradingSimulatorAdvancedProps) => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [totalProfit, setTotalProfit] = useState(0);
  const [completedOperations, setCompletedOperations] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [marketData, setMarketData] = useState<Array<{ time: string; btc: number; eth: number; volume: number }>>([]);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);

  const exchangeList = [
    { 
      name: "Binance", 
      logo: "🟨",
      color: "#F3BA2F",
      latency: "12ms"
    },
    { 
      name: "Coinbase", 
      logo: "🔵",
      color: "#0052FF",
      latency: "18ms"
    },
    { 
      name: "Kraken", 
      logo: "🟣",
      color: "#5733FF",
      latency: "15ms"
    },
    { 
      name: "KuCoin", 
      logo: "🟢",
      color: "#24D366",
      latency: "20ms"
    },
    { 
      name: "Huobi", 
      logo: "🔷",
      color: "#1676F3",
      latency: "22ms"
    },
    { 
      name: "Bybit", 
      logo: "🟠",
      color: "#F7A33A",
      latency: "16ms"
    },
    { 
      name: "OKX", 
      logo: "⚫",
      color: "#000000",
      latency: "14ms"
    },
    { 
      name: "Gate.io", 
      logo: "🔷",
      color: "#396FFF",
      latency: "25ms"
    }
  ];

  const cryptoPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "SOL/USDT", "XRP/USDT"];

  // Gerar dados de mercado em tempo real
  const generateMarketData = useCallback(() => {
    const now = new Date();
    const data = [];
    for (let i = 0; i < 50; i++) {
      const time = new Date(now.getTime() - (49 - i) * 1000);
      data.push({
        time: time.toLocaleTimeString(),
        btc: 43000 + Math.sin(i * 0.1) * 1000 + Math.random() * 500,
        eth: 2500 + Math.sin(i * 0.12) * 100 + Math.random() * 50,
        volume: 1000000 + Math.random() * 500000
      });
    }
    return data;
  }, []);

  const generatePriceHistory = () => {
    const history = [];
    for (let i = 0; i < 20; i++) {
      history.push({
        time: Date.now() - (19 - i) * 5000,
        price: 43000 + Math.sin(i * 0.3) * 200 + Math.random() * 100,
        volume: Math.random() * 1000000
      });
    }
    return history;
  };

  const generateExchangeData = (): Exchange[] => {
    let currentPlanOperations = 2;
    
    if (planName?.includes('4.0.5') || dailyRate === 3) {
      currentPlanOperations = 3;
    } else if (planName?.includes('4.1.0') || dailyRate === 4) {
      currentPlanOperations = 4;
    }

    const maxExchanges = Math.min(currentPlanOperations + Math.floor(totalActiveOperations / 2), 8);
    const numExchanges = Math.max(currentPlanOperations, maxExchanges);
    const selectedExchanges = exchangeList.slice(0, numExchanges);
    
    return selectedExchanges.map((exchange, index) => {
      const pair = cryptoPairs[Math.floor(Math.random() * cryptoPairs.length)];
      const basePrice = Math.random() * 50000 + 1000;
      const spread = 0.001 + Math.random() * 0.002;
      const buyPrice = basePrice;
      const sellPrice = basePrice * (1 + spread);
      const volume = Math.random() * 1000000 + 100000;
      const dailyProfitRate = dailyRate / 100;
      const profit = (investmentAmount * dailyProfitRate) / numExchanges;

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
        timeRemaining: 15 + Math.random() * 30,
        priceHistory: generatePriceHistory()
      };
    });
  };

  useEffect(() => {
    if (isOpen) {
      setExchanges(generateExchangeData());
      setMarketData(generateMarketData());
      setIsRunning(false);
      setTotalProfit(0);
      setCompletedOperations(0);
      setSelectedExchange(null);
    }
  }, [isOpen, investmentAmount, dailyRate, planName, totalActiveOperations, generateMarketData]);

  // Atualizar dados de mercado em tempo real
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setMarketData(prev => {
        const newData = [...prev.slice(1)];
        const lastPrice = prev[prev.length - 1]?.btc || 43000;
        newData.push({
          time: new Date().toLocaleTimeString(),
          btc: lastPrice + (Math.random() - 0.5) * 100,
          eth: 2500 + Math.sin(Date.now() * 0.001) * 50 + Math.random() * 20,
          volume: 1000000 + Math.random() * 500000
        });
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setExchanges(prev => prev.map(exchange => {
        if (exchange.status === 'completed') return exchange;

        let newProgress = exchange.progress + 2;
        let newTimeRemaining = Math.max(exchange.timeRemaining - 1, 0);
        let newStatus: 'analyzing' | 'buying' | 'selling' | 'completed' = exchange.status;

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

        // Atualizar histórico de preços
        const newPriceHistory = [...exchange.priceHistory.slice(1)];
        newPriceHistory.push({
          time: Date.now(),
          price: exchange.buyPrice + (Math.random() - 0.5) * 10,
          volume: Math.random() * 1000000
        });

        return {
          ...exchange,
          progress: newProgress,
          timeRemaining: newTimeRemaining,
          status: newStatus,
          priceHistory: newPriceHistory
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

          await TradingProfitsService.recordProfit(profitData);
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
  }, [exchanges, onComplete, onClose, investmentAmount, dailyRate, planName, startTime]);

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(Date.now());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'buying': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'selling': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
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
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-auto bg-black border border-green-400/30 shadow-2xl shadow-green-400/10">
        {/* Terminal Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] rounded-lg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,0,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(255,215,0,0.05)_0%,transparent_50%)] rounded-lg" />
        
        <DialogHeader className="relative z-10">
          {/* Terminal Header */}
          <div className="bg-gray-900/95 border-b border-green-400/30 p-4 rounded-t-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="ml-4 text-green-400 font-mono text-sm flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                ALPHA_ARBITRAGE_TERMINAL_v5.2.1
              </div>
            </div>
            
            <DialogTitle className="font-mono text-green-400 text-lg flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white">SISTEMA:</span>
                <span className="text-green-400">ONLINE</span>
              </div>
              <div className="text-yellow-400">|</div>
              <div className="text-gray-300 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                CONTRATO: <span className="text-yellow-400">{planName}</span>
              </div>
              {totalActiveOperations > 0 && (
                <>
                  <div className="text-yellow-400">|</div>
                  <div className="text-blue-400 flex items-center gap-1">
                    <Cpu className="h-4 w-4" />
                    BOOST: +{Math.floor(totalActiveOperations / 2)}
                  </div>
                </>
              )}
            </DialogTitle>
          </div>
          
          {/* Status Bar */}
          <div className="bg-black/90 border-b border-green-400/20 p-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-6">
                <div className="text-green-400 flex items-center gap-1">
                  <Signal className="h-3 w-3" />
                  EXCHANGES: <span className="text-white">{exchanges.length}</span>
                </div>
                <div className="text-yellow-400 flex items-center gap-1">
                  <WifiHigh className="h-3 w-3" />
                  LATÊNCIA: <span className="text-white">8ms</span>
                </div>
                <div className="text-blue-400 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  STATUS: <span className="text-white">CONECTADO</span>
                </div>
              </div>
              <div className="text-green-400">
                {new Date().toLocaleTimeString()} UTC-3
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 relative z-10 p-6">
          {/* Market Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Métricas Principais */}
            <div className="bg-black/60 border border-green-400/30 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 font-mono">
                <div className="bg-black/80 border border-yellow-400/30 p-3 rounded">
                  <div className="text-xs text-yellow-400 mb-1">CAPITAL</div>
                  <div className="text-xl font-bold text-white">${investmentAmount}</div>
                  <div className="text-xs text-gray-500">USD</div>
                </div>
                
                <div className="bg-black/80 border border-green-400/30 p-3 rounded">
                  <div className="text-xs text-green-400 mb-1">TAXA</div>
                  <div className="text-xl font-bold text-green-400">+{dailyRate}%</div>
                  <div className="text-xs text-gray-500">DIÁRIA</div>
                </div>
                
                <div className="bg-black/80 border border-blue-400/30 p-3 rounded">
                  <div className="text-xs text-blue-400 mb-1">OPS</div>
                  <div className="text-xl font-bold text-white">{completedOperations}/{exchanges.length}</div>
                  <div className="text-xs text-gray-500">EXEC</div>
                </div>
                
                <div className="bg-black/80 border border-green-400/30 p-3 rounded">
                  <div className="text-xs text-green-400 mb-1">LUCRO</div>
                  <div className="text-xl font-bold text-green-400">+${totalProfit.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">USD</div>
                </div>
              </div>
            </div>

            {/* Gráfico de Mercado */}
            <div className="lg:col-span-2 bg-black/60 border border-green-400/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-400 font-mono text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  MARKET DATA STREAM
                </h3>
                <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                  LIVE
                </Badge>
              </div>
              
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketData}>
                    <defs>
                      <linearGradient id="btcGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f7931a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f7931a" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9ca3af" 
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      domain={['dataMin - 100', 'dataMax + 100']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#000',
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="btc" 
                      stroke="#f7931a" 
                      strokeWidth={2}
                      fill="url(#btcGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Execute Button */}
          {!isRunning && completedOperations === 0 && (
            <div className="text-center py-6">
              <div className="bg-black/80 border border-green-400/30 rounded-lg p-8">
                <div className="font-mono text-green-400 text-sm mb-6 space-y-1">
                  <div>{'>'} SISTEMA PRONTO PARA EXECUTAR ARBITRAGEM</div>
                  <div>{'>'} ALGORITMOS CARREGADOS E EXCHANGES CONECTADAS</div>
                  <div>{'>'} PRESSIONE PARA INICIAR OPERAÇÕES AUTOMÁTICAS</div>
                </div>
                
                <Button 
                  onClick={handleStart} 
                  className="bg-gradient-to-r from-green-400/20 to-green-600/20 hover:from-green-400/30 hover:to-green-600/30 border border-green-400 text-green-400 font-mono font-bold py-4 px-12 rounded transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 hover:scale-105"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-3" />
                  EXECUTE ALPHA_BOT.sh
                </Button>
                
                <div className="mt-6 font-mono text-xs text-gray-500 space-y-1">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                      <span>ALGORITHMS: LOADED</span>
                    </div>
                    <div className="text-green-400">●</div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                      <span>EXCHANGES: CONNECTED</span>
                    </div>
                    <div className="text-green-400">●</div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                      <span>LATENCY: 8MS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exchange Operations Grid */}
          {isRunning && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {exchanges.map((exchange, index) => (
                <Card 
                  key={index} 
                  className="bg-black/80 border border-gray-700/50 hover:border-green-400/50 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedExchange(exchange)}
                >
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{exchange.logo}</span>
                        <div>
                          <div className="text-sm font-bold text-white">{exchange.name}</div>
                          <div className="text-xs text-gray-400">{exchange.pair}</div>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(exchange.status)}`}>
                        {getStatusIcon(exchange.status)}
                        <span className="ml-1">{getStatusText(exchange.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-3">
                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Progresso</span>
                          <span className="text-white">{exchange.progress.toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={exchange.progress} 
                          className="h-2 bg-gray-800"
                        />
                      </div>

                      {/* Mini Price Chart */}
                      {exchange.priceHistory.length > 0 && (
                        <div className="h-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={exchange.priceHistory.map((point, idx) => ({
                              x: idx,
                              price: point.price
                            }))}>
                              <Line 
                                type="monotone" 
                                dataKey="price" 
                                stroke="#10b981" 
                                strokeWidth={1.5}
                                dot={false}
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-400">Spread</div>
                          <div className="text-yellow-400 font-mono">{exchange.spread.toFixed(3)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Lucro</div>
                          <div className="text-green-400 font-mono">+${exchange.profit.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Time Remaining */}
                      {exchange.timeRemaining > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Timer className="h-3 w-3" />
                          <span>{exchange.timeRemaining}s restantes</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Overall Progress */}
          {isRunning && exchanges.length > 0 && (
            <Card className="bg-gradient-to-r from-black/80 to-gray-900/80 border border-green-400/30">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                      Progresso Geral das Operações
                    </h3>
                    <div className="text-sm text-gray-400">
                      {completedOperations}/{exchanges.length} concluídas
                    </div>
                  </div>
                  
                  <Progress 
                    value={(completedOperations / exchanges.length) * 100} 
                    className="h-3 bg-gray-800"
                  />
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">+${totalProfit.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">Lucro Atual</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{completedOperations}</div>
                      <div className="text-xs text-gray-400">Operações</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {exchanges.length > 0 ? ((totalProfit / exchanges.length).toFixed(2)) : '0.00'}
                      </div>
                      <div className="text-xs text-gray-400">Lucro Médio</div>
                    </div>
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

export default TradingSimulatorAdvanced;