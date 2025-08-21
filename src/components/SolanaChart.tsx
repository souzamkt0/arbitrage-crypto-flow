import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Dados simulados do Solana
const generateSolData = () => {
  const data = [];
  let price = 180;
  for (let i = 0; i < 50; i++) {
    price += (Math.random() - 0.5) * 12;
    data.push({
      time: new Date(Date.now() - (50 - i) * 60000).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      price: Math.max(160, Math.min(200, price)),
      volume: Math.random() * 60 + 30
    });
  }
  return data;
};

export const SolanaChart = () => {
  const [marketData, setMarketData] = useState(generateSolData());
  const [currentPrice, setCurrentPrice] = useState(182.45);
  const [priceChange, setPriceChange] = useState(4.23);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice = currentPrice + (Math.random() - 0.5) * 8;
      const change = ((newPrice - currentPrice) / currentPrice) * 100;
      
      setCurrentPrice(newPrice);
      setPriceChange(change);
      
      setMarketData(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: newPrice,
          volume: Math.random() * 60 + 30
        }];
        return newData;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 backdrop-blur-sm border border-emerald-500/30 rounded-lg p-3 shadow-lg">
          <p className="text-emerald-400 text-sm">{`Time: ${label}`}</p>
          <p className="text-white font-semibold">
            {`Price: $${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-emerald-500/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">SOL/USD</h3>
              <p className="text-gray-400 text-xs">Solana Price</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1 text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">LIVE</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={marketData}>
            <defs>
              <linearGradient id="solGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#10B981" 
              strokeWidth={2}
              fill="url(#solGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};