import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DollarSign, Users, Clock, CheckCircle, TrendingUp, Zap } from 'lucide-react';

// Dados simulados de depósitos
const generateDepositData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    deposits: Math.floor(Math.random() * 50) + 20,
    volume: Math.floor(Math.random() * 100000) + 50000
  }));
};

const paymentMethodData = [
  { name: 'PIX', value: 65, color: '#10B981' },
  { name: 'USDT', value: 25, color: '#3B82F6' },
  { name: 'Bank Transfer', value: 10, color: '#8B5CF6' }
];

export const DepositStats = () => {
  const [depositData] = useState(generateDepositData());
  const [liveStats, setLiveStats] = useState({
    totalDeposits: 12450,
    activeUsers: 324,
    avgProcessTime: 2.3,
    successRate: 99.8,
    todayVolume: 85690,
    weeklyGrowth: 15.6
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        totalDeposits: prev.totalDeposits + Math.floor(Math.random() * 3),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 2) - 1,
        avgProcessTime: Math.max(1, prev.avgProcessTime + (Math.random() - 0.5) * 0.2),
        todayVolume: prev.todayVolume + Math.floor(Math.random() * 500)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 shadow-lg">
          <p className="text-blue-400 text-sm">{`Day: ${label}`}</p>
          <p className="text-white font-semibold">
            {`Deposits: ${payload[0].value}`}
          </p>
          <p className="text-green-400 font-semibold">
            {`Volume: $${payload[1]?.value?.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Live Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-8 w-8 text-blue-400" />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            ${liveStats.totalDeposits.toLocaleString()}
          </div>
          <div className="text-sm text-blue-400">Today's Volume</div>
          <div className="text-xs text-green-400 mt-1">+12.5% from yesterday</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-green-400" />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {liveStats.activeUsers}
          </div>
          <div className="text-sm text-green-400">Active Users</div>
          <div className="text-xs text-green-400 mt-1">+8 in last hour</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-purple-400" />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {liveStats.avgProcessTime.toFixed(1)}m
          </div>
          <div className="text-sm text-purple-400">Avg Process Time</div>
          <div className="text-xs text-green-400 mt-1">-15% faster</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {liveStats.successRate}%
          </div>
          <div className="text-sm text-emerald-400">Success Rate</div>
          <div className="text-xs text-green-400 mt-1">99.9% uptime</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-4 border border-orange-500/20">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-orange-400" />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            +{liveStats.weeklyGrowth}%
          </div>
          <div className="text-sm text-orange-400">Weekly Growth</div>
          <div className="text-xs text-green-400 mt-1">Above target</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-8 w-8 text-yellow-400" />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            LIVE
          </div>
          <div className="text-sm text-yellow-400">System Status</div>
          <div className="text-xs text-green-400 mt-1">All systems operational</div>
        </div>
      </div>

      {/* Weekly Deposits Chart */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-blue-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart className="h-6 w-6 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Weekly Deposits</h3>
          <div className="ml-auto px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-xs font-medium">
            +15.6% vs last week
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depositData}>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="deposits" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Methods Distribution */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-green-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <PieChart className="h-6 w-6 text-green-400" />
          <h3 className="text-lg font-bold text-white">Payment Methods</h3>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={50}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {paymentMethodData.map((method, index) => (
              <div key={method.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: method.color }}
                ></div>
                <span className="text-white text-sm">{method.name}</span>
                <span className="text-gray-400 text-sm">{method.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};