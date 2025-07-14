import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Search, RefreshCw, DollarSign, ArrowUpDown, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import binanceArbitrageService, { BinancePair, BinanceArbitrageData } from "@/services/coinMarketCapService";

const getCoinIcon = (symbol: string) => {
  const icons: { [key: string]: string } = {
    'BTC': '₿',
    'ETH': 'Ξ',
    'BNB': '🟡',
    'ADA': '₳',
    'SOL': '◎',
    'XRP': '⚡',
    'DOT': '●',
    'MATIC': '🔷',
    'AVAX': '🔺',
    'LINK': '⛓️',
    'LTC': 'Ł',
    'UNI': '🦄',
    'ATOM': '⚛️',
    'FIL': '📁',
    'TRX': '🔴',
  };
  return icons[symbol] || '🪙';
};

const Market = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [marketData, setMarketData] = useState<BinancePair[]>([]);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<BinanceArbitrageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { toast } = useToast();

  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      const [pairs, opportunities] = await Promise.all([
        binanceArbitrageService.getBinancePairs(),
        binanceArbitrageService.analyzeBinanceArbitrage()
      ]);
      
      setMarketData(pairs);
      setArbitrageOpportunities(opportunities);
      setLastUpdate(new Date());
      
      toast({
        title: "Dados atualizados",
        description: "Preços e oportunidades atualizados da CoinMarketCap",
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Usando dados simulados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = marketData.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 mr-3 text-primary" />
              Mercado de Criptomoedas
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Dados da CoinMarketCap - Última atualização: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
            <Button onClick={fetchMarketData} disabled={isLoading} variant="outline" className="w-full sm:w-auto">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </Button>
            <Badge variant="outline" className="animate-pulse w-full sm:w-auto justify-center">
              <RefreshCw className="h-3 w-3 mr-1" />
              API Ativa
            </Badge>
          </div>
        </div>

        {/* Arbitrage Opportunities */}
        {arbitrageOpportunities.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <ArrowUpDown className="h-5 w-5 mr-2 text-primary" />
                Oportunidades de Arbitragem (Tempo Real)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {arbitrageOpportunities.slice(0, 6).map((opp, index) => (
                  <div key={index} className="p-4 bg-secondary rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCoinIcon(opp.symbol)}</span>
                        <span className="font-medium">{opp.symbol}</span>
                      </div>
                      <Badge variant="default" className="text-trading-green">
                        +{opp.profitPercent.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Binance Spot: ${opp.spotPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Binance Futures: ${opp.futuresPrice.toFixed(2)}
                    </div>
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                      <Zap className="h-3 w-3 mr-1" />
                      Executar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <CardTitle className="text-card-foreground">Top 50 Criptomoedas</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar moeda..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Carregando dados da CoinMarketCap...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ranking</TableHead>
                    <TableHead>Moeda</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Variação 24h</TableHead>
                    <TableHead>Volume 24h</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((coin, index) => (
                    <TableRow key={coin.symbol}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getCoinIcon(coin.symbol)}</span>
                          <div>
                            <div className="font-medium">{coin.name}</div>
                            <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        ${coin.price.toFixed(coin.price < 1 ? 6 : 2)}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center ${coin.change24h >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                          {coin.change24h >= 0 ? 
                            <TrendingUp className="h-4 w-4 mr-1" /> : 
                            <TrendingDown className="h-4 w-4 mr-1" />
                          }
                          {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        ${(coin.volume24h / 1000000).toFixed(0)}M
                      </TableCell>
                      <TableCell>
                        ${(coin.volume24h / 100000000).toFixed(1)}B
                      </TableCell>
                      <TableCell>
                        <Badge variant={coin.change24h >= 0 ? "default" : "destructive"} className="cursor-pointer">
                          Negociar
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Market;