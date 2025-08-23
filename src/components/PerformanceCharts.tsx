import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface ChartData {
  tradingHistory: any[];
  profitHistory: any[];
  stats: any;
  referralHistory?: any[];
  transactionHistory?: any[];
}

export const PerformanceCharts: React.FC<ChartData> = ({ tradingHistory, profitHistory, stats }) => {
  // Dados para o gráfico de área principal
  const areaData = [
    { month: 'Jan', input: 450, output: 520, profit: 70 },
    { month: 'Fev', input: 850, output: 920, profit: 150 },
    { month: 'Mar', input: 680, output: 750, profit: 120 },
    { month: 'Abr', input: 720, output: 850, profit: 180 },
    { month: 'Mai', input: 620, output: 650, profit: 95 },
    { month: 'Jun', input: 850, output: 970, profit: 220 },
    { month: 'Jul', input: 780, output: 890, profit: 170 },
    { month: 'Ago', input: 550, output: 620, profit: 110 },
    { month: 'Set', input: 450, output: 510, profit: 85 },
    { month: 'Out', input: 750, output: 840, profit: 160 },
    { month: 'Nov', input: 650, output: 720, profit: 130 },
    { month: 'Dez', input: 450, output: 530, profit: 105 }
  ];

  // Dados para os gráficos circulares
  const successData = [
    { name: 'Success', value: stats.successRate || 75, color: '#3b82f6' },
    { name: 'Remaining', value: 100 - (stats.successRate || 75), color: '#1e293b' }
  ];

  const failData = [
    { name: 'Fail', value: 25, color: '#f97316' },
    { name: 'Remaining', value: 75, color: '#1e293b' }
  ];

  const exchangeData = [
    { name: 'Exchange', value: 45, color: '#eab308' },
    { name: 'Remaining', value: 55, color: '#1e293b' }
  ];

  // Dados para o gráfico de barras (volume diário)
  const barData = [
    { day: 'Mon', volume: 300 },
    { day: 'Tue', volume: 250 },
    { day: 'Wed', volume: 280 },
    { day: 'Thu', volume: 220 },
    { day: 'Fri', volume: 320 },
    { day: 'Sat', volume: 290 },
    { day: 'Sun', volume: 310 }
  ];

  const renderCustomLabel = (data: any) => {
    return `${data.value}%`;
  };

  return (
    <div className="w-full h-full p-4 space-y-6">
      {/* Gráfico de Área Principal - Input/Output */}
      <div className="h-64 bg-gradient-to-br from-slate-800/40 to-slate-700/60 backdrop-blur-xl border border-slate-500/20 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
          Input
          <div className="w-3 h-3 bg-orange-400 rounded-full ml-4"></div>
          Output
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={areaData}>
            <defs>
              <linearGradient id="inputGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="outputGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="input"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#inputGradient)"
            />
            <Area
              type="monotone"
              dataKey="output"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#outputGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Grid com gráficos circulares e barras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gráfico Circular - Success */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/60 backdrop-blur-xl border border-slate-500/20 rounded-xl p-4">
          <h4 className="text-blue-400 text-sm font-semibold mb-2">Success Rate</h4>
          <div className="relative h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  startAngle={90}
                  endAngle={450}
                  dataKey="value"
                >
                  {successData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg font-bold">{stats.successRate || 75}%</span>
            </div>
          </div>
          <p className="text-blue-300 text-xs text-center mt-2">Operações Bem-sucedidas</p>
        </div>

        {/* Gráfico Circular - Fail Rate */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/60 backdrop-blur-xl border border-slate-500/20 rounded-xl p-4">
          <h4 className="text-orange-400 text-sm font-semibold mb-2">Fail Rate</h4>
          <div className="relative h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  startAngle={90}
                  endAngle={450}
                  dataKey="value"
                >
                  {failData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg font-bold">25%</span>
            </div>
          </div>
          <p className="text-orange-300 text-xs text-center mt-2">Taxa de Falhas</p>
        </div>

        {/* Gráfico Circular - Exchange */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/60 backdrop-blur-xl border border-slate-500/20 rounded-xl p-4">
          <h4 className="text-yellow-400 text-sm font-semibold mb-2">Exchanging</h4>
          <div className="relative h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={exchangeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  startAngle={90}
                  endAngle={450}
                  dataKey="value"
                >
                  {exchangeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg font-bold">45%</span>
            </div>
          </div>
          <p className="text-yellow-300 text-xs text-center mt-2">Em Processamento</p>
        </div>

        {/* Gráfico de Barras - Volume Semanal */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/60 backdrop-blur-xl border border-slate-500/20 rounded-xl p-4">
          <h4 className="text-purple-400 text-sm font-semibold mb-2">Volume Diário</h4>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={barData}>
              <Bar 
                dataKey="volume" 
                fill="#8b5cf6"
                radius={[2, 2, 0, 0]}
              />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Métricas Numéricas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/30 backdrop-blur-xl border border-emerald-400/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">850,00</div>
          <div className="text-emerald-300 text-xs">Input Atual</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/30 backdrop-blur-xl border border-orange-400/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">970,30</div>
          <div className="text-orange-300 text-xs">Output Atual</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/30 backdrop-blur-xl border border-blue-400/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.totalOperations}</div>
          <div className="text-blue-300 text-xs">Total Operações</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/30 backdrop-blur-xl border border-purple-400/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.activeInvestments}</div>
          <div className="text-purple-300 text-xs">Ativos</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/30 backdrop-blur-xl border border-yellow-400/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.averageROI}%</div>
          <div className="text-yellow-300 text-xs">ROI Médio</div>
        </div>
      </div>
    </div>
  );
};