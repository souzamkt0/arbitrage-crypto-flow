import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ChartData {
  tradingHistory: any[];
  profitHistory: any[];
  referralHistory: any[];
  transactionHistory: any[];
  stats: any;
}

export const PerformanceCharts = ({ tradingHistory, profitHistory, referralHistory, transactionHistory, stats }: ChartData) => {
  // Prepare data for charts
  const prepareMonthlyData = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        monthIndex: date.getMonth(),
        year: date.getFullYear()
      };
    }).reverse();

    return months.map(({ month, monthIndex, year }) => {
      const monthTrades = tradingHistory.filter(trade => {
        const tradeDate = new Date(trade.created_at || trade.timestamp);
        return tradeDate.getMonth() === monthIndex && tradeDate.getFullYear() === year;
      });

      const monthProfits = profitHistory.filter(profit => {
        const profitDate = new Date(profit.created_at);
        return profitDate.getMonth() === monthIndex && profitDate.getFullYear() === year;
      });

      const monthReferrals = referralHistory.filter(ref => {
        const refDate = new Date(ref.created_at);
        return refDate.getMonth() === monthIndex && refDate.getFullYear() === year;
      });

      const tradingProfit = monthTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
      const investmentProfit = monthProfits.reduce((sum, profit) => sum + (profit.total_profit || 0), 0);
      const referralEarnings = monthReferrals.reduce((sum, ref) => sum + (ref.commission || 0), 0);

      return {
        month,
        tradingProfit: Number(tradingProfit.toFixed(2)),
        investmentProfit: Number(investmentProfit.toFixed(2)),
        referralEarnings: Number(referralEarnings.toFixed(2)),
        totalProfit: Number((tradingProfit + investmentProfit + referralEarnings).toFixed(2)),
        operations: monthTrades.length + monthProfits.length
      };
    });
  };

  const preparePairDistribution = () => {
    const pairStats = tradingHistory.reduce((acc, trade) => {
      const pair = trade.pair || 'OUTROS';
      if (!acc[pair]) {
        acc[pair] = { pair, operations: 0, totalProfit: 0 };
      }
      acc[pair].operations += 1;
      acc[pair].totalProfit += trade.profit || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(pairStats)
      .map((item: any) => ({
        ...item,
        totalProfit: Number(item.totalProfit.toFixed(2))
      }))
      .sort((a: any, b: any) => b.operations - a.operations)
      .slice(0, 6);
  };

  const preparePerformanceMetrics = () => {
    return [
      { name: 'Lucro Total', value: stats.totalProfit, color: '#10b981' },
      { name: 'Saldo Atual', value: stats.currentBalance, color: '#3b82f6' },
      { name: 'Ganhos Indicação', value: stats.totalReferralEarnings, color: '#8b5cf6' },
      { name: 'Total Investido', value: stats.totalInvested, color: '#f59e0b' }
    ];
  };

  const prepareTransactionFlow = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const dayTransactions = transactionHistory.filter(tx => 
        tx.created_at.split('T')[0] === date
      );

      const deposits = dayTransactions
        .filter(tx => tx.type === 'deposit' && (tx.status === 'paid' || tx.status === 'completed'))
        .reduce((sum, tx) => sum + tx.amount_brl, 0);

      const withdrawals = dayTransactions
        .filter(tx => tx.type === 'withdrawal' && (tx.status === 'approved' || tx.status === 'completed'))
        .reduce((sum, tx) => sum + tx.amount_brl, 0);

      return {
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        deposits: Number(deposits.toFixed(2)),
        withdrawals: Number(withdrawals.toFixed(2)),
        balance: Number((deposits - withdrawals).toFixed(2))
      };
    }).filter(day => day.deposits > 0 || day.withdrawals > 0 || day.balance !== 0);
  };

  const monthlyData = prepareMonthlyData();
  const pairData = preparePairDistribution();
  const metricsData = preparePerformanceMetrics();
  const transactionFlow = prepareTransactionFlow();

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
      {/* Monthly Profit Evolution */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">📈 Evolução dos Lucros (12 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalProfit" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pair Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">💱 Distribuição por Par</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pairData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="operations"
                  label={({ pair, operations }) => `${pair}: ${operations}`}
                >
                  {pairData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Operações']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">📊 Métricas de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={10}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Flow */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">💰 Fluxo de Transações (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transactionFlow} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="deposits" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Depósitos"
                />
                <Line 
                  type="monotone" 
                  dataKey="withdrawals" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Saques"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown by Category */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">🎯 Detalhamento por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                />
                <Legend />
                <Bar dataKey="tradingProfit" stackId="a" fill="#10b981" name="Trading" />
                <Bar dataKey="investmentProfit" stackId="a" fill="#3b82f6" name="Investimentos" />
                <Bar dataKey="referralEarnings" stackId="a" fill="#8b5cf6" name="Indicações" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};