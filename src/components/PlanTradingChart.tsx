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
}

export const PlanTradingChart: React.FC<PlanTradingChartProps> = ({ 
  planId, 
  planName, 
  dailyRate 
}) => {
  const [tradingData, setTradingData] = useState<PlanTradingData[]>([]);
  const [stats, setStats] = useState<PlanTradingStats | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [currentOperation, setCurrentOperation] = useState<PlanTradingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Gerar dados simulados de arbitragem
  const generateArbitrageData = () => {
    const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Bybit'];
    
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const exchangeFrom = exchanges[Math.floor(Math.random() * exchanges.length)];
    let exchangeTo = exchanges[Math.floor(Math.random() * exchanges.length)];
    while (exchangeTo === exchangeFrom) {
      exchangeTo = exchanges[Math.floor(Math.random() * exchanges.length)];
    }

    // Preços baseados no par
    let basePrice;
    switch (pair.split('/')[0]) {
      case 'BTC':
        basePrice = 43000 + (Math.random() - 0.5) * 2000;
        break;
      case 'ETH':
        basePrice = 2600 + (Math.random() - 0.5) * 200;
        break;
      case 'BNB':
        basePrice = 300 + (Math.random() - 0.5) * 30;
        break;
      case 'ADA':
        basePrice = 0.5 + (Math.random() - 0.5) * 0.1;
        break;
      case 'SOL':
        basePrice = 100 + (Math.random() - 0.5) * 20;
        break;
      default:
        basePrice = 100;
    }

    // Calcular lucro baseado na daily_rate do plano
    const profitPercentage = (dailyRate / 100) * (0.8 + Math.random() * 0.4); // ±20% da taxa diária
    const buyPrice = basePrice;
    const sellPrice = buyPrice * (1 + profitPercentage / 100);
    const volume = Math.random() * 10 + 1;

    return {
      id: Math.random().toString(36).substr(2, 9),
      pair,
      buy_price: buyPrice,
      sell_price: sellPrice,
      volume,
      profit_percentage: profitPercentage,
      exchange_from: exchangeFrom,
      exchange_to: exchangeTo,
      status: 'active',
      created_at: new Date().toISOString(),
    };
  };

  // Simular estatísticas do plano
  const generatePlanStats = (): PlanTradingStats => {
    const baseOperations = Math.floor(Math.random() * 50) + 20;
    const totalProfit = baseOperations * (dailyRate / 100) * 1000; // Simular lucro baseado em investimento médio
    
    return {
      id: planId,
      total_operations: baseOperations,
      total_profit: totalProfit,
      avg_profit_percentage: dailyRate / 4, // Média por operação
      best_profit_percentage: dailyRate / 2, // Melhor operação
      total_volume: Math.random() * 100000 + 50000,
      success_rate: 95 + Math.random() * 5, // 95-100%
      avg_execution_time: Math.floor(Math.random() * 300) + 60, // 1-6 minutos
      last_operation_at: new Date().toISOString(),
    };
  };

  useEffect(() => {
    // Carregar dados iniciais
    setStats(generatePlanStats());
    
    // Gerar histórico inicial de preços
    const initialPrices = Array.from({ length: 20 }, () => 
      40000 + Math.random() * 10000
    );
    const initialLabels = Array.from({ length: 20 }, (_, i) => {
      const date = new Date(Date.now() - (20 - i) * 60000);
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    });
    
    setPriceHistory(initialPrices);
    setLabels(initialLabels);
    setIsLoading(false);

    // Iniciar simulação de trading em tempo real
    intervalRef.current = setInterval(() => {
      // Gerar nova operação de arbitragem
      const newOperation = generateArbitrageData();
      setCurrentOperation(newOperation);
      
      // Atualizar histórico de preços
      setPriceHistory(prev => {
        const newPrice = newOperation.buy_price;
        const newPrices = [...prev.slice(1), newPrice];
        return newPrices;
      });
      
      setLabels(prev => {
        const newLabel = new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        const newLabels = [...prev.slice(1), newLabel];
        return newLabels;
      });

      // Simular histórico de operações
      setTradingData(prev => {
        const newData = [...prev, newOperation].slice(-10); // Manter apenas últimas 10
        return newData;
      });

    }, 3000 + Math.random() * 2000); // 3-5 segundos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [planId, dailyRate]);

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

  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            {planName} - Trading ao Vivo
          </CardTitle>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
            AO VIVO
          </Badge>
        </div>
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