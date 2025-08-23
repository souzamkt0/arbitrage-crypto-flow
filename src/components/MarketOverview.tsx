import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  trend: number[];
}

export const MarketOverview = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: 42350.50,
      change24h: 2.45,
      volume: 28.5,
      trend: [42100, 42200, 42150, 42300, 42250, 42350]
    },
    {
      symbol: "ETH", 
      name: "Ethereum",
      price: 2580.30,
      change24h: -1.23,
      volume: 15.8,
      trend: [2600, 2590, 2585, 2580, 2575, 2580]
    },
    {
      symbol: "BNB",
      name: "Binance Coin", 
      price: 315.75,
      change24h: 3.67,
      volume: 8.2,
      trend: [305, 308, 312, 315, 314, 316]
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: 98.42,
      change24h: 5.89,
      volume: 12.1,
      trend: [93, 95, 97, 98, 97.5, 98.4]
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(coin => ({
        ...coin,
        price: coin.price + (Math.random() - 0.5) * coin.price * 0.001,
        change24h: coin.change24h + (Math.random() - 0.5) * 0.1,
        trend: [...coin.trend.slice(1), coin.price + (Math.random() - 0.5) * coin.price * 0.002]
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const renderMiniChart = (trend: number[]) => {
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min;
    
    return (
      <svg className="w-16 h-8" viewBox="0 0 64 32">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={trend.map((price, i) => 
            `${(i * 64) / (trend.length - 1)},${32 - ((price - min) / range) * 32}`
          ).join(' ')}
        />
      </svg>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-binance-yellow" />
            Market Overview
          </CardTitle>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {marketData.map((coin) => (
          <div key={coin.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-binance-yellow to-binance-green rounded-full flex items-center justify-center text-xs font-bold text-binance-black">
                {coin.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="font-medium text-foreground">{coin.symbol}</div>
                <div className="text-xs text-muted-foreground">{coin.name}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`${coin.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                {renderMiniChart(coin.trend)}
              </div>
              
              <div className="text-right">
                <div className="font-bold text-foreground">
                  ${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`flex items-center gap-1 text-xs ${coin.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {coin.change24h >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(coin.change24h).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Market Cap: $1.67T</span>
            <span>24h Vol: $89.2B</span>
            <span>BTC Dom: 52.3%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};