import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Zap, Globe } from 'lucide-react';

export const TradingHeader = () => {
  const [marketStatus, setMarketStatus] = useState({
    btcPrice: 65432.50,
    btcChange: 2.34,
    ethPrice: 3234.78,
    ethChange: -1.23,
    marketCap: 2.45,
    volume: 89.2,
    dominance: 52.3
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketStatus(prev => ({
        ...prev,
        btcPrice: prev.btcPrice + (Math.random() - 0.5) * 100,
        btcChange: prev.btcChange + (Math.random() - 0.5) * 0.1,
        ethPrice: prev.ethPrice + (Math.random() - 0.5) * 50,
        ethChange: prev.ethChange + (Math.random() - 0.5) * 0.1,
        volume: prev.volume + (Math.random() - 0.5) * 2
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 border-b border-slate-700/50 p-4">
      <div className="flex items-center justify-between">
        {/* Trading Platform Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
            <h1 className="text-xl font-bold text-white">Trading Dashboard</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sistema Online</span>
            </div>
            </div>
          </div>
        </div>

        {/* Live Market Data */}
        <div className="flex items-center gap-6">
          {/* BTC */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">₿</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">
                ${marketStatus.btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center gap-1 text-xs ${marketStatus.btcChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketStatus.btcChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{marketStatus.btcChange >= 0 ? '+' : ''}{marketStatus.btcChange.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* ETH */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">Ξ</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">
                ${marketStatus.ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center gap-1 text-xs ${marketStatus.ethChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketStatus.ethChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{marketStatus.ethChange >= 0 ? '+' : ''}{marketStatus.ethChange.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-slate-600">
            <div className="text-center">
              <div className="text-xs text-slate-400">Market Cap</div>
              <div className="text-sm font-bold text-white">${marketStatus.marketCap.toFixed(2)}T</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">24h Volume</div>
              <div className="text-sm font-bold text-white">${marketStatus.volume.toFixed(1)}B</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">BTC.D</div>
              <div className="text-sm font-bold text-white">{marketStatus.dominance.toFixed(1)}%</div>
            </div>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
            <Zap className="h-4 w-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">AO VIVO</span>
          </div>
        </div>
      </div>
    </div>
  );
};