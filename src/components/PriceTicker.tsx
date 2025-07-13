import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CoinPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
}

const PriceTicker = () => {
  const [coins] = useState<CoinPrice[]>([
    { symbol: "BTC", name: "Bitcoin", price: 43250.89, change24h: 2.34, volume24h: 28500000000 },
    { symbol: "ETH", name: "Ethereum", price: 2650.47, change24h: -1.22, volume24h: 15200000000 },
    { symbol: "BNB", name: "BNB", price: 315.68, change24h: 3.45, volume24h: 1800000000 },
    { symbol: "ADA", name: "Cardano", price: 0.4856, change24h: 1.89, volume24h: 890000000 },
    { symbol: "SOL", name: "Solana", price: 98.32, change24h: -0.67, volume24h: 2400000000 },
    { symbol: "XRP", name: "XRP", price: 0.6234, change24h: 4.12, volume24h: 1600000000 },
    { symbol: "DOT", name: "Polkadot", price: 7.45, change24h: -2.1, volume24h: 320000000 },
    { symbol: "AVAX", name: "Avalanche", price: 38.76, change24h: 2.87, volume24h: 680000000 },
    { symbol: "LINK", name: "Chainlink", price: 14.89, change24h: 1.45, volume24h: 750000000 },
    { symbol: "MATIC", name: "Polygon", price: 0.8945, change24h: -1.87, volume24h: 420000000 },
    { symbol: "UNI", name: "Uniswap", price: 6.78, change24h: 3.21, volume24h: 180000000 },
    { symbol: "LTC", name: "Litecoin", price: 72.34, change24h: 0.98, volume24h: 820000000 },
  ]);

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(4)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(1)}B`;
    }
    if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(1)}M`;
    }
    return `${(volume / 1e3).toFixed(1)}K`;
  };

  // Duplicar array para efeito contínuo
  const tickerItems = [...coins, ...coins, ...coins];

  return (
    <div className="bg-card border-b border-border overflow-hidden relative">
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {tickerItems.map((coin, index) => (
            <div
              key={`${coin.symbol}-${index}`}
              className="ticker-item inline-flex items-center space-x-3 px-6 py-2 whitespace-nowrap"
            >
              <div className="flex items-center space-x-2">
                <span className="font-bold text-primary text-sm">{coin.symbol}</span>
                <span className="text-card-foreground font-medium">
                  {formatPrice(coin.price)}
                </span>
                <div className={`flex items-center space-x-1 ${
                  coin.change24h >= 0 ? 'text-trading-green' : 'text-trading-red'
                }`}>
                  {coin.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="text-xs font-medium">
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  Vol: {formatVolume(coin.volume24h)}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .ticker-wrapper {
            width: 100%;
            overflow: hidden;
          }
          
          .ticker-content {
            display: flex;
            animation: ticker 120s linear infinite;
          }
          
          .ticker-item {
            flex-shrink: 0;
          }
          
          @keyframes ticker {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.333%);
            }
          }
          
          .ticker-content:hover {
            animation-play-state: paused;
          }
        `
      }} />
    </div>
  );
};

export default PriceTicker;