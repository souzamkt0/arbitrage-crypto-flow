import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Search, RefreshCw, DollarSign } from "lucide-react";

const Market = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [marketData, setMarketData] = useState([
    { symbol: "BTCUSDT", name: "Bitcoin", price: 43250.50, change: 2.35, volume: "2.5B", icon: "₿" },
    { symbol: "ETHUSDT", name: "Ethereum", price: 2680.80, change: -1.25, volume: "1.8B", icon: "Ξ" },
    { symbol: "BNBUSDT", name: "BNB", price: 325.40, change: 3.15, volume: "450M", icon: "🟡" },
    { symbol: "ADAUSDT", name: "Cardano", price: 0.4520, change: 1.85, volume: "280M", icon: "₳" },
    { symbol: "SOLUSDT", name: "Solana", price: 98.75, change: 4.20, volume: "380M", icon: "◎" },
    { symbol: "XRPUSDT", name: "XRP", price: 0.6150, change: -0.85, volume: "320M", icon: "⚡" },
    { symbol: "DOTUSDT", name: "Polkadot", price: 7.25, change: 2.10, volume: "150M", icon: "●" },
    { symbol: "MATICUSDT", name: "Polygon", price: 0.8950, change: 1.95, volume: "220M", icon: "🔷" },
    { symbol: "AVAXUSDT", name: "Avalanche", price: 38.20, change: 3.45, volume: "180M", icon: "🔺" },
    { symbol: "LINKUSDT", name: "Chainlink", price: 15.60, change: -1.15, volume: "140M", icon: "⛓️" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(coin => ({
        ...coin,
        price: coin.price * (1 + (Math.random() - 0.5) * 0.01),
        change: coin.change + (Math.random() - 0.5) * 0.5
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredData = marketData.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <DollarSign className="h-8 w-8 mr-3 text-primary" />
              Mercado de Criptomoedas
            </h1>
            <p className="text-muted-foreground">Dados em tempo real da Binance</p>
          </div>
          <Badge variant="outline" className="animate-pulse">
            <RefreshCw className="h-3 w-3 mr-1" />
            Ao Vivo
          </Badge>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-card-foreground">Preços em Tempo Real</CardTitle>
              <div className="relative w-64">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Moeda</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Variação 24h</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((coin) => (
                  <TableRow key={coin.symbol}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{coin.icon}</span>
                        <div>
                          <div className="font-medium">{coin.name}</div>
                          <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      ${coin.price.toFixed(coin.price < 1 ? 4 : 2)}
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center ${coin.change >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                        {coin.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell>{coin.volume}</TableCell>
                    <TableCell>
                      <Badge variant={coin.change >= 0 ? "default" : "destructive"} className="cursor-pointer">
                        Negociar
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Market;