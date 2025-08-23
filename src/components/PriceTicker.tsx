import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerData {
  symbol: string;
  price: number;
  change24h: number;
}

export const PriceTicker = () => {
  const [tickerData, setTickerData] = useState<TickerData[]>([
    { symbol: "BTC/USDT", price: 42350.50, change24h: 2.45 },
    { symbol: "ETH/USDT", price: 2580.30, change24h: -1.23 },
    { symbol: "BNB/USDT", price: 315.75, change24h: 3.67 },
    { symbol: "SOL/USDT", price: 98.42, change24h: 5.89 },
    { symbol: "ADA/USDT", price: 0.4825, change24h: -2.15 },
    { symbol: "DOT/USDT", price: 7.34, change24h: 1.89 },
    { symbol: "MATIC/USDT", price: 0.8456, change24h: 4.32 },
    { symbol: "AVAX/USDT", price: 24.67, change24h: -0.56 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerData(prev => prev.map(ticker => ({
        ...ticker,
        price: ticker.price + (Math.random() - 0.5) * ticker.price * 0.002,
        change24h: ticker.change24h + (Math.random() - 0.5) * 0.2
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Add CSS for scrolling animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }
      .animate-scroll {
        animation: scroll 30s linear infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="bg-card border-y border-border overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap">
        {[...tickerData, ...tickerData].map((ticker, index) => (
          <div key={`${ticker.symbol}-${index}`} className="flex items-center px-6 py-2 min-w-fit">
            <span className="text-foreground font-medium mr-2">{ticker.symbol}</span>
            <span className="text-foreground font-bold mr-2">
              ${ticker.price.toLocaleString('en-US', { 
                minimumFractionDigits: ticker.price < 1 ? 4 : 2,
                maximumFractionDigits: ticker.price < 1 ? 4 : 2
              })}
            </span>
            <div className={`flex items-center gap-1 ${ticker.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
              {ticker.change24h >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="text-xs font-medium">
                {Math.abs(ticker.change24h).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};