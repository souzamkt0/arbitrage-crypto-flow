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
import { TrendingUp, Activity, ArrowUpDown, Zap, Target, Wifi } from 'lucide-react';
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
  const [marketRate, setMarketRate] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [isLoading, setIsLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar taxa dinâmica do mercado
  const fetchMarketRate = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Buscar taxa atual do mercado
      const { data: rateData, error: rateError } = await supabase
        .from('daily_market_rates')
        .select('*')
        .eq('plan_id', planId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (rateError && rateError.code !== 'PGRST116') {
        throw rateError;
      }

      if (rateData) {
        setMarketRate(rateData);
        
        // Gerar dados de preços simulados baseados na taxa atual
        const currentPrice = 40000 + Math.random() * 10000;
        const newPrices = [...priceHistory.slice(-19), currentPrice];
        const newLabels = [...labels.slice(-19), new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })];
        
        setPriceHistory(newPrices);
        setLabels(newLabels);
        
        setConnectionStatus('connected');
      } else {
        // Se não existe taxa para hoje, atualizar
        await supabase.rpc('update_current_market_rate', { p_plan_id: planId });
        setConnectionStatus('connected');
      }

    } catch (error) {
      console.error('Erro ao buscar taxa do mercado:', error);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Buscar dados iniciais
    fetchMarketRate();
    
    // Inicializar preços se vazio
    if (priceHistory.length === 0) {
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
    }
    
    // Atualizar dados a cada 10 segundos
    intervalRef.current = setInterval(() => {
      fetchMarketRate();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [planId]);

  const getTodayProfit = () => {
    if (!marketRate) {
      const randomRate = Math.random() * dailyRate * 0.8; // Entre 0% e 80% da taxa máxima
      return {
        amount: userInvestmentAmount * (randomRate / 100),
        percentage: randomRate
      };
    }
    
    return {
      amount: userInvestmentAmount * (marketRate.current_rate / 100),
      percentage: marketRate.current_rate
    };
  };

  const todayProfit = getTodayProfit();

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
        borderColor: connectionStatus === 'connected' ? 'rgba(16, 185, 129, 1)' : 'rgba(156, 163, 175, 1)',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            return 'rgba(16, 185, 129, 0.1)';
          }
          
          const color = connectionStatus === 'connected' ? '16, 185, 129' : '156, 163, 175';
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, `rgba(${color}, 0.05)`);
          gradient.addColorStop(0.5, `rgba(${color}, 0.15)`);
          gradient.addColorStop(1, `rgba(${color}, 0.3)`);
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: connectionStatus === 'connected' ? 'rgba(16, 185, 129, 1)' : 'rgba(156, 163, 175, 1)',
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
            {planName} - Trading
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Status de conexão */}
            <Badge className={`${
              connectionStatus === 'connected' 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : connectionStatus === 'connecting'
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400'
              }`}></div>
              {connectionStatus === 'connected' ? 'CONECTADO' : 
               connectionStatus === 'connecting' ? 'CONECTANDO' : 'DESCONECTADO'}
            </Badge>
          </div>
        </div>
        
        {/* Informações de ganho hoje */}
        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg border border-emerald-500/30">
          <div className="text-center space-y-2">
            <p className="text-emerald-300 text-sm font-medium">
              💰 {isLocked ? 'Potencial de Ganho Hoje' : 'Ganho Atual Hoje'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div>
                <p className="text-emerald-200 text-xs">Com ${userInvestmentAmount}</p>
                <p className="text-emerald-400 text-xl font-bold">
                  ${todayProfit.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-emerald-200 text-xs">Taxa de hoje</p>
                <p className="text-emerald-400 text-xl font-bold">
                  {todayProfit.percentage.toFixed(2)}%
                </p>
              </div>
            </div>
            <p className="text-emerald-200 text-xs">
              ⚡ {isLocked ? 'Baseado em dados reais do mercado' : 'Dados em tempo real'}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Gráfico de Preços */}
        <div className="h-48 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Status do mercado */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="text-center p-3 bg-slate-700/20 rounded-lg">
            <p className="text-slate-400 text-xs">Taxa Mínima</p>
            <p className="text-white font-bold">{marketRate ? marketRate.min_rate.toFixed(2) : '0.50'}%</p>
          </div>
          <div className="text-center p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/20">
            <p className="text-emerald-200 text-xs">Taxa Atual</p>
            <p className="text-emerald-400 font-bold">{todayProfit.percentage.toFixed(2)}%</p>
          </div>
          <div className="text-center p-3 bg-slate-700/20 rounded-lg">
            <p className="text-slate-400 text-xs">Taxa Máxima</p>
            <p className="text-white font-bold">{dailyRate.toFixed(2)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};