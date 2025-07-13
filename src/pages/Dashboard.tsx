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
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [botActive, setBotActive] = useState(false);
  const [balance, setBalance] = useState(12543.89);
  const [dailyProfit, setDailyProfit] = useState(234.56);
  const [totalProfit, setTotalProfit] = useState(1875.34);
  const [activeOrders, setActiveOrders] = useState(3);
  const { toast } = useToast();

  const [arbitrageOpportunities] = useState([
    { pair: "BTC/USDT", exchange1: "Binance", exchange2: "Future", profit: 1.2, amount: 0.5 },
    { pair: "ETH/USDT", exchange1: "Spot", exchange2: "Future", profit: 0.8, amount: 2.1 },
    { pair: "BNB/USDT", exchange1: "Binance", exchange2: "Future", profit: 2.1, amount: 15.0 },
  ]);

  const [cryptoNews] = useState([
    { 
      title: "Bitcoin atinge novo recorde histórico", 
      source: "@CoinDesk", 
      time: "2h", 
      sentiment: "positive",
      url: "#"
    },
    { 
      title: "Ethereum 2.0: Atualização traz melhorias significativas", 
      source: "@VitalikButerin", 
      time: "4h", 
      sentiment: "positive",
      url: "#"
    },
    { 
      title: "Regulamentação cripto: Novas diretrizes do Fed", 
      source: "@CoinTelegraph", 
      time: "6h", 
      sentiment: "neutral",
      url: "#"
    },
    { 
      title: "Binance anuncia novo produto DeFi", 
      source: "@binance", 
      time: "8h", 
      sentiment: "positive",
      url: "#"
    },
  ]);

  const [recentTrades] = useState([
    { time: "14:32:15", pair: "BTC/USDT", type: "BUY", profit: "+$45.23", status: "Completed" },
    { time: "14:28:42", pair: "ETH/USDT", type: "SELL", profit: "+$23.67", status: "Completed" },
    { time: "14:25:11", pair: "BNB/USDT", type: "BUY", profit: "+$89.12", status: "Completed" },
    { time: "14:22:03", pair: "ADA/USDT", type: "SELL", profit: "+$12.45", status: "Completed" },
  ]);

  const toggleBot = () => {
    setBotActive(!botActive);
    toast({
      title: botActive ? "Bot Pausado" : "Bot Ativado",
      description: botActive ? "Arbitragem automática pausada" : "Arbitragem automática iniciada",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Sistema de Arbitragem Alphabit</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground">Bot Status:</span>
              <Switch checked={botActive} onCheckedChange={toggleBot} />
              <Badge variant={botActive ? "default" : "secondary"} className="ml-2">
                {botActive ? "ATIVO" : "PAUSADO"}
              </Badge>
            </div>
            
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Saldo Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${balance.toLocaleString()}
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
                +${dailyProfit.toFixed(2)}
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
                +${totalProfit.toFixed(2)}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Performance Diária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "00:00", profit: 45.20, percentage: 30 },
                  { time: "04:00", profit: 89.15, percentage: 60 },
                  { time: "08:00", profit: 156.80, percentage: 100 },
                  { time: "12:00", profit: 78.45, percentage: 50 },
                  { time: "16:00", profit: 234.60, percentage: 150 },
                  { time: "20:00", profit: 189.30, percentage: 120 },
                ].map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground w-12">{data.time}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(data.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-trading-green w-20 text-right">
                      +${data.profit}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Arbitrage Opportunities */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <ArrowUpDown className="h-5 w-5 mr-2 text-primary" />
                Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {arbitrageOpportunities.slice(0, 4).map((opp, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                    <div>
                      <div className="font-medium text-secondary-foreground text-sm">{opp.pair}</div>
                      <div className="text-xs text-muted-foreground">
                        {opp.exchange1} → {opp.exchange2}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-trading-green text-sm">
                        +{opp.profit}%
                      </div>
                      <Button size="sm" className="mt-1 h-6 px-2 text-xs bg-primary hover:bg-primary/90">
                        <Zap className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crypto News */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Newspaper className="h-5 w-5 mr-2 text-primary" />
              Notícias do Mercado Cripto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cryptoNews.map((news, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-secondary-foreground text-sm mb-1">
                      {news.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span className="text-primary font-medium">{news.source}</span>
                      <span>•</span>
                      <span>{news.time}</span>
                      <Badge 
                        variant={news.sentiment === "positive" ? "default" : news.sentiment === "negative" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {news.sentiment === "positive" ? "Positiva" : news.sentiment === "negative" ? "Negativa" : "Neutra"}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2 p-1 h-8 w-8">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Operações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentTrades.map((trade, index) => (
                <div key={index} className="p-3 bg-secondary rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{trade.time}</div>
                    <Badge variant={trade.type === "BUY" ? "default" : "secondary"} className="text-xs">
                      {trade.type}
                    </Badge>
                  </div>
                  <div className="font-medium text-secondary-foreground">{trade.pair}</div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-trading-green">{trade.profit}</div>
                    <Badge variant="outline" className="text-xs">
                      {trade.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Painel de Controle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={toggleBot}
                  className={`${
                    botActive
                      ? "bg-destructive hover:bg-destructive/90"
                      : "bg-success hover:bg-success/90"
                  }`}
                >
                  {botActive ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar Bot
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Bot
                    </>
                  )}
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  Status: {botActive ? "Monitorando mercado..." : "Bot pausado"}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" className="border-primary text-primary">
                  Histórico
                </Button>
                <Button variant="outline" className="border-primary text-primary">
                  Relatórios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;