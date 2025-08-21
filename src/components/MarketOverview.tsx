import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

// Dados simulados de mercado
const cryptoData = [
  { symbol: 'BTC', name: 'Bitcoin', price: 65432.50, change: 2.34, volume: '28.5B' },
  { symbol: 'ETH', name: 'Ethereum', price: 3234.78, change: -1.23, volume: '15.2B' },
  { symbol: 'BNB', name: 'BNB', price: 542.30, change: 5.67, volume: '2.1B' },
  { symbol: 'ADA', name: 'Cardano', price: 0.875, change: 3.12, volume: '890M' },
  { symbol: 'SOL', name: 'Solana', price: 145.67, change: -2.45, volume: '1.8B' },
];

export const MarketOverview = () => {
  const [marketStats, setMarketStats] = useState({
    totalMarketCap: 2.45,
    btcDominance: 52.3,
    totalVolume: 89.2,
    fearGreedIndex: 74
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketStats(prev => ({
        ...prev,
        totalMarketCap: prev.totalMarketCap + (Math.random() - 0.5) * 0.1,
        btcDominance: prev.btcDominance + (Math.random() - 0.5) * 0.5,
        totalVolume: prev.totalVolume + (Math.random() - 0.5) * 2,
        fearGreedIndex: Math.max(0, Math.min(100, prev.fearGreedIndex + (Math.random() - 0.5) * 3))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-6 w-6 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Market Overview</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">Market Cap</div>
            <div className="text-lg font-bold text-white">
              ${marketStats.totalMarketCap.toFixed(2)}T
            </div>
            <div className="text-xs text-green-400">+2.5%</div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">24h Volume</div>
            <div className="text-lg font-bold text-white">
              ${marketStats.totalVolume.toFixed(1)}B
            </div>
            <div className="text-xs text-blue-400">+5.2%</div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">BTC Dominance</div>
            <div className="text-lg font-bold text-white">
              {marketStats.btcDominance.toFixed(1)}%
            </div>
            <div className="text-xs text-red-400">-0.3%</div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">Fear & Greed</div>
            <div className="text-lg font-bold text-white">
              {Math.round(marketStats.fearGreedIndex)}
            </div>
            <div className={`text-xs ${marketStats.fearGreedIndex > 50 ? 'text-green-400' : 'text-orange-400'}`}>
              {marketStats.fearGreedIndex > 50 ? 'Greed' : 'Fear'}
            </div>
          </div>
        </div>
      </div>

      {/* Top Cryptos */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-green-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="h-6 w-6 text-green-400" />
          <h3 className="text-lg font-bold text-white">Top Cryptocurrencies</h3>
        </div>

        <div className="space-y-3">
          {cryptoData.map((crypto, index) => (
            <div key={crypto.symbol} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{crypto.symbol}</span>
                </div>
                <div>
                  <div className="text-white font-medium">{crypto.symbol}</div>
                  <div className="text-xs text-gray-400">{crypto.name}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-white font-medium">
                  ${crypto.price.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 text-xs ${crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {crypto.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{crypto.change >= 0 ? '+' : ''}{crypto.change}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};