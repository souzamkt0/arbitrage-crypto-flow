import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, DollarSign, ArrowUpDown, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import arbitrageService, { ArbitrageData } from "@/services/coinMarketCapService";

interface Trade {
  id: string;
  time: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  profit: number;
  status: 'executing' | 'completed';
}

interface ChartData {
  time: string;
  profit: number;
  totalTrades: number;
}

const Market = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { toast } = useToast();

  const generateRandomTrade = (): Trade => {
    const symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT', 'MATIC'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = Math.random() > 0.5 ? 'buy' : 'sell';
    const price = Math.random() * 100000 + 1000;
    const profit = (Math.random() * 200 - 50);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString(),
      symbol,
      type,
      price,
      profit,
      status: 'executing'
    };
  };

  const executeTrade = () => {
    if (!isActive) return;
    
    const newTrade = generateRandomTrade();
    
    setTrades(prev => {
      const updated = [newTrade, ...prev].slice(0, 20);
      return updated;
    });

    // Update chart data
    const now = new Date().toLocaleTimeString();
    setChartData(prev => {
      const updated = [...prev, {
        time: now,
        profit: newTrade.profit,
        totalTrades: trades.length + 1
      }].slice(-20);
      return updated;
    });

    // Mark trade as completed after 2 seconds
    setTimeout(() => {
      setTrades(prev => 
        prev.map(trade => 
          trade.id === newTrade.id 
            ? { ...trade, status: 'completed' }
            : trade
        )
      );
    }, 2000);
  };

  useEffect(() => {
    // Auto-start bot
    toast({
      title: "Bot Iniciado Automaticamente",
      description: "Sistema de arbitragem em execução",
      variant: "default",
    });
  }, []);

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      executeTrade();
    }, Math.random() * 3000 + 2000); // Entre 2-5 segundos
    
    return () => clearInterval(interval);
  }, [isActive, trades.length]);

  return (
    <div className="min-h-screen bg-background p-2 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-3 md:space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground flex items-center justify-center md:justify-start">
              <ArrowUpDown className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 mr-2 md:mr-3 text-primary" />
              Arbitragem em Tempo Real
            </h1>
            <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
              Sistema automatizado de negociação - Bot ATIVO
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <Badge variant="default" className="animate-pulse">
              <RefreshCw className="h-3 w-3 mr-1" />
              EXECUTANDO
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Total de Negociações</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{trades.length}</p>
                </div>
                <ArrowUpDown className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="pt-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-xl md:text-2xl font-bold text-trading-green">
                    {trades.length > 0 ? Math.round((trades.filter(t => t.profit > 0).length / trades.length) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-trading-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="flex items-center text-card-foreground text-sm md:text-base lg:text-lg">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 mr-2 text-primary" />
              Gráfico de Lucros em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Live Trading Panel */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="flex items-center text-card-foreground text-sm md:text-base lg:text-lg">
              <Zap className="h-4 w-4 md:h-5 md:w-5 mr-2 text-primary" />
              Painel de Negociações em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-64 md:max-h-96 overflow-y-auto">
              {trades.length === 0 ? (
                <div className="text-center py-6 md:py-8">
                  <ArrowUpDown className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm md:text-base">Aguardando negociações automáticas...</p>
                </div>
              ) : (
                trades.map((trade) => (
                  <div key={trade.id} className={`p-3 md:p-4 rounded-lg border transition-all duration-500 ${
                    trade.status === 'executing' 
                      ? 'bg-yellow-500/10 border-yellow-500/30 animate-pulse' 
                      : trade.profit >= 0 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'} className="text-xs">
                          {trade.type.toUpperCase()}
                        </Badge>
                        <span className="font-medium text-sm md:text-base">{trade.symbol}</span>
                        <span className="text-xs md:text-sm text-muted-foreground">{trade.time}</span>
                      </div>
                      <div className="flex items-center justify-between md:justify-end space-x-2 md:space-x-4">
                        <span className="font-mono text-xs md:text-sm">${trade.price.toFixed(2)}</span>
                        <span className={`font-bold text-sm md:text-base ${trade.profit >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </span>
                        <Badge variant={trade.status === 'executing' ? 'outline' : 'default'} className="text-xs">
                          {trade.status === 'executing' ? 'Executando...' : 'Concluído'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Market;