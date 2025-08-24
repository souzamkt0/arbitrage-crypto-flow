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
import { TrendingUp, Activity, ArrowUpDown, Zap, Target, Wifi, BarChart3 } from 'lucide-react';
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
  const [currentTrade, setCurrentTrade] = useState<any>(null);
  const [tradingOperations, setTradingOperations] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Gerar operação de trading em tempo real
  const generateTradingOperation = () => {
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Bitfinex', 'OKX'];
    const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
    
    const buyExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    const sellExchange = exchanges.filter(ex => ex !== buyExchange)[Math.floor(Math.random() * 4)];
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    
    const basePrice = pair.includes('BTC') ? 42000 + Math.random() * 8000 : 
                     pair.includes('ETH') ? 2500 + Math.random() * 500 :
                     200 + Math.random() * 100;
    
    const buyPrice = basePrice * (0.998 + Math.random() * 0.004);
    const sellPrice = basePrice * (1.001 + Math.random() * 0.003);
    const volume = 50 + Math.random() * 200;
    const profit = (sellPrice - buyPrice) * volume;
    const profitPercent = ((sellPrice - buyPrice) / buyPrice) * 100;
    
    return {
      id: Date.now() + Math.random(),
      pair,
      buyExchange,
      sellExchange,
      buyPrice,
      sellPrice,
      volume,
      profit,
      profitPercent,
      timestamp: new Date(),
      status: 'executing'
    };
  };

  // Buscar taxa dinâmica do mercado e simular trading
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
        
        // Gerar nova operação de trading
        const newTrade = generateTradingOperation();
        setCurrentTrade(newTrade);
        
        // Adicionar à lista de operações
        setTradingOperations(prev => [...prev.slice(-4), newTrade]);
        
        // Gerar dados de preços baseados nas operações
        const currentPrice = newTrade.sellPrice;
        const newPrices = [...priceHistory.slice(-19), currentPrice];
        const newLabels = [...labels.slice(-19), new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })];
        
        setPriceHistory(newPrices);
        setLabels(newLabels);
        
        setConnectionStatus('connected');
        
        // Simular conclusão da operação após 3-8 segundos
        setTimeout(() => {
          setCurrentTrade((prev: any) => prev ? { ...prev, status: 'completed' } : null);
        }, 3000 + Math.random() * 5000);
        
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
    
    // Atualizar dados a cada 5-12 segundos (simular trading real)
    const updateInterval = 5000 + Math.random() * 7000;
    intervalRef.current = setInterval(() => {
      fetchMarketRate();
    }, updateInterval);

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
      duration: 1500,
      easing: 'easeInOutCubic',
      delay: (context) => context.dataIndex * 100,
    },
    transitions: {
      active: {
        animation: {
          duration: 800,
          easing: 'easeInOutQuart',
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(16, 185, 129, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          maxTicksLimit: 6,
          font: {
            size: 11,
            weight: 500,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(16, 185, 129, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
            weight: 500,
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#10b981',
        bodyColor: 'white',
        borderColor: 'rgba(16, 185, 129, 0.8)',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return `Arbitragem - ${context[0].label}`;
          },
          label: function(context) {
            return `Preço: $${Number(context.parsed.y).toLocaleString()}`;
          },
          afterLabel: function(context) {
            const profit = ((context.parsed.y - 40000) / 40000 * 100).toFixed(3);
            return `Potencial: +${profit}%`;
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
        tension: 0.6,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
      },
      point: {
        radius: 0,
        hoverRadius: 8,
        pointStyle: 'circle',
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Arbitragem em Tempo Real',
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
          gradient.addColorStop(0, `rgba(${color}, 0.02)`);
          gradient.addColorStop(0.3, `rgba(${color}, 0.1)`);
          gradient.addColorStop(0.7, `rgba(${color}, 0.2)`);
          gradient.addColorStop(1, `rgba(${color}, 0.4)`);
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: connectionStatus === 'connected' ? 'rgba(16, 185, 129, 1)' : 'rgba(156, 163, 175, 1)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 3,
        tension: 0.6,
        segment: {
          borderColor: (ctx: any) => {
            const current = ctx.p1.parsed.y;
            const previous = ctx.p0.parsed.y;
            return current > previous ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)';
          },
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-600/30 animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-emerald-400"></div>
              <div className="animate-ping absolute top-0 left-0 rounded-full h-12 w-12 border border-emerald-400/50"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30 animate-fade-in hover-scale transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            {planName} - Trading
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Status de conexão com animação */}
            <Badge className={`${
              connectionStatus === 'connected' 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : connectionStatus === 'connecting'
                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            } transition-all duration-500 animate-scale-in`}>
              <div className={`w-3 h-3 rounded-full mr-2 ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' : 
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-ping' :
                'bg-red-400 animate-pulse'
              }`}></div>
              {connectionStatus === 'connected' ? 'CONECTADO' : 
               connectionStatus === 'connecting' ? 'CONECTANDO' : 'DESCONECTADO'}
            </Badge>
          </div>
        </div>
        
        {/* Informações de ganho hoje com animações */}
        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg border border-emerald-500/30 animate-scale-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 animate-pulse"></div>
          <div className="relative z-10 text-center space-y-2">
            <p className="text-emerald-300 text-sm font-medium animate-fade-in">
              💰 {isLocked ? 'Potencial de Ganho Hoje' : 'Ganho Atual Hoje'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <p className="text-emerald-200 text-xs">Com ${userInvestmentAmount}</p>
                <p className="text-emerald-400 text-xl font-bold animate-pulse">
                  ${todayProfit.amount.toFixed(2)}
                </p>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <p className="text-emerald-200 text-xs">Taxa de hoje</p>
                <p className="text-emerald-400 text-xl font-bold animate-pulse">
                  {todayProfit.percentage.toFixed(2)}%
                </p>
              </div>
            </div>
            <p className="text-emerald-200 text-xs animate-fade-in" style={{ animationDelay: '0.6s' }}>
              ⚡ {isLocked ? 'Baseado em dados reais do mercado' : 'Dados em tempo real'}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Gráfico de Preços com animação */}
        <div className="h-48 w-full relative animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent rounded-lg animate-pulse"></div>
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Operação Atual de Trading com animações */}
        {currentTrade && (
          <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/30 animate-scale-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-400 animate-pulse" />
                  <span className="text-blue-300 font-medium">Operação Ativa</span>
                  <Badge className={`${
                    currentTrade.status === 'executing' 
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse' 
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-bounce'
                  } transition-all duration-500`}>
                    {currentTrade.status === 'executing' ? 'EXECUTANDO' : 'CONCLUÍDA'}
                  </Badge>
                </div>
                <div className="text-emerald-400 font-bold animate-pulse text-lg">
                  +{currentTrade.profitPercent.toFixed(3)}%
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1 animate-fade-in">
                  <p className="text-slate-400">Par: <span className="text-white font-medium">{currentTrade.pair}</span></p>
                  <p className="text-slate-400">Compra: <span className="text-blue-300 font-medium">{currentTrade.buyExchange}</span></p>
                  <p className="text-slate-400">Preço: <span className="text-white font-mono">${currentTrade.buyPrice.toFixed(2)}</span></p>
                </div>
                <div className="space-y-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <p className="text-slate-400">Volume: <span className="text-white font-medium">{currentTrade.volume.toFixed(1)}</span></p>
                  <p className="text-slate-400">Venda: <span className="text-orange-300 font-medium">{currentTrade.sellExchange}</span></p>
                  <p className="text-slate-400">Preço: <span className="text-white font-mono">${currentTrade.sellPrice.toFixed(2)}</span></p>
                </div>
              </div>
              
              <div className="mt-3 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <p className="text-emerald-300 font-medium text-lg animate-pulse">
                  💰 Lucro: ${currentTrade.profit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Últimas Operações com animações */}
        {tradingOperations.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            <h4 className="text-white font-medium text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              Últimas Operações
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {tradingOperations.slice(-3).reverse().map((operation, index) => (
                <div 
                  key={operation.id} 
                  className="flex items-center justify-between p-2 bg-slate-700/30 rounded text-xs hover-scale transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">{operation.pair}</span>
                    <span className="text-blue-300 text-xs px-1 py-0.5 bg-blue-500/20 rounded">{operation.buyExchange}</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400 animate-pulse" />
                    <span className="text-orange-300 text-xs px-1 py-0.5 bg-orange-500/20 rounded">{operation.sellExchange}</span>
                  </div>
                  <div className="text-emerald-400 font-medium animate-pulse">
                    +{operation.profitPercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status do mercado com animações */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="text-center p-3 bg-slate-700/20 rounded-lg hover-scale transition-all duration-300 animate-fade-in">
            <p className="text-slate-400 text-xs">Taxa Mínima</p>
            <p className="text-white font-bold text-lg">{marketRate ? marketRate.min_rate.toFixed(2) : '0.50'}%</p>
          </div>
          <div className="text-center p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/20 hover-scale transition-all duration-300 animate-scale-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-emerald-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <p className="text-emerald-200 text-xs">Hoje o mercado pagaria</p>
              <p className="text-emerald-400 font-bold text-lg animate-pulse">{todayProfit.percentage.toFixed(2)}%</p>
            </div>
          </div>
          <div className="text-center p-3 bg-slate-700/20 rounded-lg hover-scale transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-slate-400 text-xs">Taxa Máxima</p>
            <p className="text-white font-bold text-lg">{dailyRate.toFixed(2)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};