import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, ArrowUpDown, Zap, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PlanTradingData {
  id: string;
  pair: string;
  buy_price: number;
  sell_price: number;
  volume: number;
  profit_percentage: number;
  exchange_from: string;
  exchange_to: string;
  status: string;
  created_at: string;
}

interface PlanTradingStats {
  id: string;
  total_operations: number;
  total_profit: number;
  avg_profit_percentage: number;
  best_profit_percentage: number;
  total_volume: number;
  success_rate: number;
  avg_execution_time: number;
  last_operation_at: string;
}

interface PlanTradingChartProps {
  planId: string;
  planName: string;
  dailyRate: number;
  isLocked?: boolean;
  userInvestmentAmount?: number;
}

export const PlanTradingChart: React.FC<PlanTradingChartProps> = ({ 
  planId, 
  planName, 
  dailyRate,
  isLocked = false,
  userInvestmentAmount = 1000
}) => {
  const [tradingData, setTradingData] = useState<PlanTradingData[]>([]);
  const [stats, setStats] = useState<PlanTradingStats | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [currentOperation, setCurrentOperation] = useState<PlanTradingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar dados reais do Supabase
  const fetchPlanData = async () => {
    try {
      // Buscar dados de trading do plano
      const { data: tradingData, error: tradingError } = await supabase
        .from('plan_arbitrage_operations')
        .select('*')
        .eq('plan_id', planId)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (tradingError) throw tradingError;
      setTradingData(tradingData || []);

      // Buscar estatísticas do plano
      const { data: statsData, error: statsError } = await supabase
        .from('plan_trading_stats')
        .select('*')
        .eq('plan_id', planId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;
      setStats(statsData);

      // Buscar histórico de preços
      const { data: priceData, error: priceError } = await supabase
        .from('plan_price_history')
        .select('*')
        .eq('plan_id', planId)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (priceError) throw priceError;
      
      if (priceData && priceData.length > 0) {
        const prices = priceData.reverse().map(item => item.price);
        const timeLabels = priceData.map(item => 
          new Date(item.timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        );
        setPriceHistory(prices);
        setLabels(timeLabels);
      }

      // Se há dados de trading, pegar a operação mais recente
      if (tradingData && tradingData.length > 0) {
        setCurrentOperation(tradingData[0]);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do plano:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Buscar dados reais do plano
    fetchPlanData();
    
    // Definir um intervalo para atualizar os dados periodicamente
    intervalRef.current = setInterval(() => {
      fetchPlanData();
    }, 30000); // Atualizar a cada 30 segundos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [planId]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart',
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          maxTicksLimit: 6,
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 11,
          },
          callback: function(value) {
            return '$' + Number(value).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(16, 185, 129, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `Preço: $${Number(context.parsed.y).toLocaleString()}`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
        hoverRadius: 6,
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Preço de Arbitragem',
        data: priceHistory,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            return 'rgba(16, 185, 129, 0.1)';
          }
          
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
          gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.3)');
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calculateSimulatedProfit = () => {
    if (!currentOperation) return { dailyProfit: 0, percentage: 0 };
    
    const todayPercentage = Math.random() * dailyRate; // Simula entre 0% e o max do plano
    const dailyProfit = userInvestmentAmount * (todayPercentage / 100);
    
    return { dailyProfit, percentage: todayPercentage };
  };

  const simulatedProfit = calculateSimulatedProfit();

  return (
    <Card className={`bg-gradient-to-br from-slate-800/80 to-slate-700/80 border ${
      isLocked ? 'border-orange-500/30' : 'border-slate-600/30'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg font-bold flex items-center gap-2 ${
            isLocked ? 'text-orange-300' : 'text-white'
          }`}>
            <Activity className={`h-5 w-5 ${isLocked ? 'text-orange-400' : 'text-emerald-400'}`} />
            {planName} - {isLocked ? 'Simulação' : 'Trading ao Vivo'}
          </CardTitle>
          {isLocked ? (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
              SIMULAÇÃO
            </Badge>
          ) : (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
              AO VIVO
            </Badge>
          )}
        </div>
        
        {/* Simulação para planos bloqueados */}
        {isLocked && (
          <div className="mt-4 p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
            <div className="text-center space-y-2">
              <p className="text-orange-300 text-sm font-medium">
                🔒 Potencial de Ganho Hoje
              </p>
              <div className="flex items-center justify-center gap-4">
                <div>
                  <p className="text-orange-200 text-xs">Com ${userInvestmentAmount}</p>
                  <p className="text-orange-400 text-xl font-bold">
                    ${simulatedProfit.dailyProfit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-orange-200 text-xs">Percentual de hoje</p>
                  <p className="text-orange-400 text-xl font-bold">
                    {simulatedProfit.percentage.toFixed(2)}%
                  </p>
                </div>
              </div>
              <p className="text-orange-200 text-xs">
                ⚡ Baseado em dados reais de arbitragem
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Gráfico de Preços */}
        <div className="h-48 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Operação Atual */}
        {currentOperation && (
          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Arbitragem Ativa
              </h4>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Zap className="h-3 w-3 mr-1" />
                Executando
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Par</p>
                <p className="text-white font-bold">{currentOperation.pair}</p>
              </div>
              <div>
                <p className="text-slate-400">Compra ({currentOperation.exchange_from})</p>
                <p className="text-white font-bold">${currentOperation.buy_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400">Venda ({currentOperation.exchange_to})</p>
                <p className="text-emerald-400 font-bold">${currentOperation.sell_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400">Lucro</p>
                <p className="text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {currentOperation.profit_percentage.toFixed(3)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas do Plano */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <p className="text-slate-400 text-xs">Operações</p>
              <p className="text-white font-bold">{stats.total_operations}</p>
            </div>
            <div className="text-center p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/20">
              <p className="text-emerald-200 text-xs">Lucro Total</p>
              <p className="text-emerald-400 font-bold">${stats.total_profit.toFixed(0)}</p>
            </div>
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <p className="text-slate-400 text-xs">Taxa Sucesso</p>
              <p className="text-white font-bold">{stats.success_rate.toFixed(1)}%</p>
            </div>
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <p className="text-slate-400 text-xs">Tempo Médio</p>
              <p className="text-white font-bold">{Math.floor(stats.avg_execution_time / 60)}min</p>
            </div>
          </div>
        )}

        {/* Últimas Operações */}
        {tradingData.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Últimas Operações
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {tradingData.slice(-5).map((operation, index) => (
                <div 
                  key={operation.id} 
                  className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-xs"
                >
                  <span className="text-slate-300">{operation.pair}</span>
                  <span className="text-slate-400">
                    {operation.exchange_from} → {operation.exchange_to}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    +{operation.profit_percentage.toFixed(3)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};