import React from 'react';
import { DollarSign, TrendingUp, Activity, Clock, Zap, Target, BarChart3, Users } from 'lucide-react';

interface TradingStatsProps {
  balance: number;
  dailyProfit: number;
  totalProfit: number;
  activeOrders: number;
  tradingBalance: number;
  monthlyEarnings: number;
  botActive: boolean;
}

export const TradingStats: React.FC<TradingStatsProps> = ({
  balance,
  dailyProfit,
  totalProfit,
  activeOrders,
  tradingBalance,
  monthlyEarnings,
  botActive
}) => {
  const stats = [
    {
      title: 'Portfolio Balance',
      value: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: 'Real Time',
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Daily Profit',
      value: `$${dailyProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: 'Today',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Total Profit',
      value: `$${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: 'Accumulated',
      icon: BarChart3,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-500/10 to-violet-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Active Investments',
      value: activeOrders.toString(),
      change: 'Running',
      icon: Activity,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-500/10 to-red-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      title: 'Total Invested',
      value: `$${tradingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: 'Capital',
      icon: Target,
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'from-teal-500/10 to-cyan-500/10',
      borderColor: 'border-teal-500/20'
    },
    {
      title: 'Monthly Earnings',
      value: `$${monthlyEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: 'This Month',
      icon: Clock,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'from-indigo-500/10 to-blue-500/10',
      borderColor: 'border-indigo-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.title}
          className={`bg-gradient-to-br ${stat.bgColor} rounded-xl border ${stat.borderColor} p-6 hover:scale-105 transition-all duration-200 backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">SYNC</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400">{stat.title}</h3>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="flex items-center gap-2">
              <div className={`text-sm font-medium ${
                stat.change.includes('+') 
                  ? 'text-green-400' 
                  : stat.change === 'Running' || stat.change === 'Available'
                  ? 'text-blue-400'
                  : 'text-slate-400'
              }`}>
                {stat.change}
              </div>
              {stat.change.includes('+') && (
                <TrendingUp className="h-4 w-4 text-green-400" />
              )}
            </div>
          </div>

          {/* Subtle animation overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
        </div>
      ))}
    </div>
  );
};