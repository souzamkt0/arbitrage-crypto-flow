import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, DollarSign, ArrowUpDown, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import binanceArbitrageService, { BinanceArbitrageData } from "@/services/coinMarketCapService";

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
  const [totalProfit, setTotalProfit] = useState(0);
  const [isActive, setIsActive] = useState(false);
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

    // Update total profit
    setTotalProfit(prev => prev + newTrade.profit);

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

  const toggleBot = () => {
    setIsActive(!isActive);
    toast({
      title: isActive ? "Bot Parado" : "Bot Iniciado",
      description: isActive ? "Arbitragem interrompida" : "Executando arbitragem automática",
      variant: isActive ? "destructive" : "default",
    });
  };

  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      executeTrade();
    }, Math.random() * 3000 + 2000); // Entre 2-5 segundos
    
    return () => clearInterval(interval);
  }, [isActive, trades.length]);

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
              <ArrowUpDown className="h-6 w-6 md:h-8 md:w-8 mr-3 text-primary" />
              Arbitragem em Tempo Real
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Sistema automatizado de negociação - Bot {isActive ? 'ATIVO' : 'INATIVO'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
            <Button onClick={toggleBot} variant={isActive ? "destructive" : "default"} className="w-full sm:w-auto">
              <Zap className="h-4 w-4 mr-2" />
              {isActive ? 'Parar Bot' : 'Iniciar Bot'}
            </Button>
            <Badge variant={isActive ? "default" : "secondary"} className={`w-full sm:w-auto justify-center ${isActive ? 'animate-pulse' : ''}`}>
              <RefreshCw className="h-3 w-3 mr-1" />
              {isActive ? 'EXECUTANDO' : 'PARADO'}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Lucro Total</p>
                  <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                    ${totalProfit.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Negociações</p>
                  <p className="text-2xl font-bold text-foreground">{trades.length}</p>
                </div>
                <ArrowUpDown className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-trading-green">
                    {trades.length > 0 ? Math.round((trades.filter(t => t.profit > 0).length / trades.length) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-trading-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Gráfico de Lucros em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
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
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Zap className="h-5 w-5 mr-2 text-primary" />
              Painel de Negociações em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trades.length === 0 ? (
                <div className="text-center py-8">
                  <ArrowUpDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Inicie o bot para ver as negociações</p>
                </div>
              ) : (
                trades.map((trade) => (
                  <div key={trade.id} className={`p-4 rounded-lg border transition-all duration-500 ${
                    trade.status === 'executing' 
                      ? 'bg-yellow-500/10 border-yellow-500/30 animate-pulse' 
                      : trade.profit >= 0 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                          {trade.type.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{trade.symbol}</span>
                        <span className="text-sm text-muted-foreground">{trade.time}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-mono text-sm">${trade.price.toFixed(2)}</span>
                        <span className={`font-bold ${trade.profit >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </span>
                        <Badge variant={trade.status === 'executing' ? 'outline' : 'default'}>
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