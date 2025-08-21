import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Shield, 
  Zap, 
  ChevronRight, 
  Activity,
  BarChart3,
  Target,
  PlayCircle,
  Pause,
  Wallet,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Trophy,
  Star,
  Users,
  Rocket,
  LineChart
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';

interface InvestmentPlan {
  id: number;
  name: string;
  description: string;
  dailyRate: number;
  minInvestment: number;
  maxInvestment: number;
  duration: number;
  features: string[];
  riskLevel: 'low' | 'medium' | 'high';
  isActive: boolean;
  totalReturn: number;
  status?: 'available' | 'limited' | 'sold-out';
  popularity?: number;
}

const Investments: React.FC = () => {
  const { user } = useAuth();
  const { formatUSD } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [showTradingSimulation, setShowTradingSimulation] = useState(false);
  const [tradingStatus, setTradingStatus] = useState<'analyzing' | 'buying' | 'selling' | 'completed'>('analyzing');
  const [tradingProgress, setTradingProgress] = useState(0);
  const [currentProfit, setCurrentProfit] = useState(0);
  const [currentTradingPair] = useState('BTC/USDT');
  const [priceData, setPriceData] = useState<Array<{time: string, price: number}>>([]);
  const [buyPrice] = useState(45250.30);
  const [sellPrice] = useState(45890.75);

  const investmentPlans: InvestmentPlan[] = [
    {
      id: 1,
      name: 'Starter Bot',
      description: 'Ideal para iniciantes na arbitragem automatizada',
      dailyRate: 2.5,
      minInvestment: 100,
      maxInvestment: 1000,
      duration: 30,
      totalReturn: 75,
      riskLevel: 'low',
      isActive: true,
      status: 'available',
      popularity: 85,
      features: [
        '🤖 Bot de Arbitragem Básico',
        '📊 Análise de 10+ exchanges',
        '⚡ Execução automática 24/7',
        '📱 Alertas em tempo real',
        '🔒 Stop-loss automático'
      ]
    },
    {
      id: 2,
      name: 'Professional Bot',
      description: 'Para traders experientes com capital médio',
      dailyRate: 3.2,
      minInvestment: 1000,
      maxInvestment: 10000,
      duration: 30,
      totalReturn: 96,
      riskLevel: 'medium',
      isActive: true,
      status: 'available',
      popularity: 92,
      features: [
        '🚀 Bot Avançado Multi-Exchange',
        '💎 Arbitragem de alta frequência',
        '🎯 AI de machine learning',
        '📈 Análise técnica avançada',
        '🛡️ Proteção anti-liquidação',
        '💰 Compound automático'
      ]
    },
    {
      id: 3,
      name: 'Elite Bot',
      description: 'O mais avançado sistema de arbitragem',
      dailyRate: 4.1,
      minInvestment: 10000,
      maxInvestment: 100000,
      duration: 30,
      totalReturn: 123,
      riskLevel: 'high',
      isActive: true,
      status: 'limited',
      popularity: 98,
      features: [
        '👑 Bot Elite com IA Proprietária',
        '⚡ Latência ultra-baixa < 1ms',
        '🌐 Cobertura global 50+ exchanges',
        '🔮 Predições de mercado',
        '💎 Arbitragem institucional',
        '🎖️ Suporte VIP 24/7',
        '📊 Relatórios personalizados'
      ]
    }
  ];

  // Simulate trading progress
  useEffect(() => {
    if (!showTradingSimulation) return;

    const interval = setInterval(() => {
      setTradingProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 3, 100);
        
        if (newProgress < 25) setTradingStatus('analyzing');
        else if (newProgress < 60) setTradingStatus('buying');
        else if (newProgress < 85) setTradingStatus('selling');
        else setTradingStatus('completed');

        setCurrentProfit(newProgress * 6.5);
        
        return newProgress;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [showTradingSimulation]);

  // Generate realistic price data
  useEffect(() => {
    const generatePriceData = () => {
      const data = [];
      let basePrice = 45200;
      
      for (let i = 0; i < 50; i++) {
        const time = new Date(Date.now() - (50 - i) * 60000).toLocaleTimeString();
        const volatility = (Math.random() - 0.5) * 100;
        basePrice += volatility;
        data.push({
          time,
          price: Math.max(basePrice, 44000)
        });
      }
      
      setPriceData(data);
    };

    generatePriceData();
    const interval = setInterval(generatePriceData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInvestment = async (plan: InvestmentPlan) => {
    if (!user) {
      toast.error('Você precisa estar logado para investir');
      return;
    }

    try {
      toast.success(`Plano ${plan.name} ativado com sucesso!`);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Investment error:', error);
      toast.error('Erro ao processar investimento');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'medium': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'high': return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-400/20';
      case 'limited': return 'text-yellow-400 bg-yellow-400/20';
      case 'sold-out': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400/20 via-transparent to-blue-500/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-yellow-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-8 h-8 text-black font-bold" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Planos de Arbitragem Automatizada
              </h1>
              <p className="text-gray-400 text-lg">Robôs inteligentes trabalhando 24/7 para maximizar seus lucros</p>
            </div>
          </div>

          {/* Trading Access Button */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={() => setShowTradingSimulation(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white px-8 py-4 text-lg font-bold rounded-xl border border-cyan-400/30 shadow-2xl shadow-cyan-500/25 transition-all duration-500 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <div className="relative flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span>Acessar Trading</span>
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 h-1 bg-white rounded-full opacity-60 animate-pulse" 
                      style={{ animationDelay: `${i * 0.3}s` }}
                    ></div>
                  ))}
                </div>
              </div>
              
              <div className="absolute top-0 left-0 w-full h-full">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-bounce"
                    style={{
                      left: `${20 + i * 12}%`,
                      top: `${30 + (i % 2) * 40}%`,
                      animationDelay: `${i * 0.4}s`,
                      animationDuration: '2s'
                    }}
                  ></div>
                ))}
              </div>
            </Button>
          </div>
        </div>

        {/* Investment Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {investmentPlans.map((plan) => (
            <Card key={plan.id} className="group relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-700/90 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/25 overflow-hidden">
              {/* Card Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -inset-1 bg-gradient-to-br from-yellow-400/20 to-blue-400/20 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:to-yellow-200 transition-all duration-300">
                    {plan.name}
                  </CardTitle>
                  <Badge className={`${getStatusColor(plan.status || 'available')} border-0 px-2 py-1 text-xs font-semibold`}>
                    {plan.status === 'available' ? 'Disponível' : 
                     plan.status === 'limited' ? 'Limitado' : 'Esgotado'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-3xl font-bold text-green-400">{plan.dailyRate}%</span>
                    <span className="text-gray-400 text-sm">por dia</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-yellow-400 font-semibold">{plan.popularity}%</span>
                  </div>
                </div>

                <CardDescription className="text-gray-300 mb-4 group-hover:text-gray-200 transition-colors">
                  {plan.description}
                </CardDescription>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <Badge variant="outline" className={getRiskColor(plan.riskLevel)}>
                      Risco {plan.riskLevel === 'low' ? 'Baixo' : plan.riskLevel === 'medium' ? 'Médio' : 'Alto'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{plan.duration} dias</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="bg-black/20 rounded-lg p-4 border border-gray-600/30 group-hover:border-yellow-500/30 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Investimento:</span>
                      <span className="font-semibold text-white">
                        {formatUSD(plan.minInvestment)} - {formatUSD(plan.maxInvestment)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Retorno Total:</span>
                      <span className="font-bold text-green-400 text-lg">
                        +{plan.totalReturn}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-300 mb-2">🚀 Recursos Inclusos:</h4>
                    <ul className="space-y-1 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-gray-300 group-hover:text-gray-200 transition-colors">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-3 rounded-xl shadow-lg shadow-yellow-500/25 hover:shadow-yellow-400/40 transition-all duration-300 group-hover:scale-105 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-ping">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <Zap className="h-5 w-5 mr-2 relative z-10 animate-pulse" />
                    <span className="relative z-10">Ativar Robô Agora</span>
                    <ChevronRight className="h-5 w-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Professional Trading Simulation Modal */}
        <Dialog open={showTradingSimulation} onOpenChange={() => {}}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto bg-gradient-to-br from-slate-950 via-gray-950 to-black border-2 border-cyan-500/20 text-white p-0">
            
            {/* Trading Terminal Header */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-violet-950/40 px-6 py-4 border-b border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-2xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      TERMINAL ARBITRAGEM PRO
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Sistema operacional • Latência: 0.8ms</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-green-500/20 px-3 py-2 rounded-lg border border-green-500/30">
                    <div className="text-xs text-green-400 font-medium">Profit 24h</div>
                    <div className="text-lg font-bold text-green-400">+${currentProfit.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trading Interface */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status: {tradingStatus.toUpperCase()}</span>
                  <span className="text-cyan-400">{tradingProgress}%</span>
                </div>
                <Progress value={tradingProgress} className="h-2" />
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                  {currentTradingPair} - Análise Técnica
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsLineChart data={priceData}>
                    <XAxis dataKey="time" tick={{fontSize: 10}} />
                    <YAxis tick={{fontSize: 10}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <div className="text-sm text-green-400">Compra</div>
                  <div className="text-xl font-bold">${buyPrice}</div>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <div className="text-sm text-blue-400">Alvo</div>
                  <div className="text-xl font-bold">${sellPrice}</div>
                </div>
                <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                  <div className="text-sm text-purple-400">ROI</div>
                  <div className="text-xl font-bold">+{((sellPrice - buyPrice) / buyPrice * 100).toFixed(2)}%</div>
                </div>
              </div>

              {/* Market Analysis Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-900/60 rounded-xl p-4 border border-gray-700/30">
                  <h4 className="text-cyan-400 font-semibold mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Arbitragem Detectada
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { exchange: 'Binance', price: 45250.30, type: 'buy' },
                      { exchange: 'Coinbase', price: 45312.45, type: 'neutral' },
                      { exchange: 'Kraken', price: 45198.75, type: 'neutral' },
                      { exchange: 'Huobi', price: 45467.89, type: 'sell' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-slate-800/40 rounded border border-gray-600/20">
                        <span className="text-gray-300">{item.exchange}</span>
                        <span className={`font-mono ${
                          item.type === 'buy' ? 'text-green-400' : 
                          item.type === 'sell' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-4 border border-gray-700/30">
                  <h4 className="text-violet-400 font-semibold mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Execução de Trades
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { action: 'BUY BTC', exchange: 'Binance', amount: '0.127 BTC', status: 'completed' },
                      { action: 'SELL BTC', exchange: 'Huobi', amount: '0.127 BTC', status: 'executing' },
                      { action: 'PENDING', exchange: 'Coinbase', amount: '0.089 BTC', status: 'waiting' }
                    ].map((trade, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-slate-800/40 rounded border border-gray-600/20">
                        <div>
                          <div className="text-gray-300 font-medium">{trade.action}</div>
                          <div className="text-xs text-gray-500">{trade.exchange}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs px-2 py-1 rounded ${
                            trade.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            trade.status === 'executing' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {trade.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-gradient-to-r from-slate-900/80 to-gray-900/80 rounded-xl p-4 border border-cyan-500/20">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-cyan-400 font-semibold">Sistema AlphaTrade AI</div>
                    <div className="text-gray-400">
                      Algoritmo: AlphaTrade AI v4.0.0
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Controls */}
            <div className="bg-gradient-to-r from-slate-950/80 to-gray-950/80 px-6 py-4 border-t border-cyan-500/20 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400">Sistema Ativo</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Próxima operação em: <span className="text-cyan-400 font-mono">23:45:12</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowTradingSimulation(false)}
                  variant="outline"
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Minimizar Terminal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Investment Dialog */}
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-yellow-300 text-xl flex items-center space-x-2">
                <Bot className="w-6 h-6" />
                <span>Ativar {selectedPlan?.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {selectedPlan && (
                <>
                  <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 rounded-lg p-4 border border-yellow-500/30">
                    <h4 className="text-yellow-300 font-semibold mb-2">📊 Resumo do Plano</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Taxa Diária:</span>
                        <span className="text-green-400 font-bold">{selectedPlan.dailyRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duração:</span>
                        <span className="text-white">{selectedPlan.duration} dias</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Retorno Total:</span>
                        <span className="text-green-400 font-bold">+{selectedPlan.totalReturn}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Investimento:</span>
                        <span className="text-white">{formatUSD(selectedPlan.minInvestment)} - {formatUSD(selectedPlan.maxInvestment)}</span>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-blue-900/30 border-blue-500/30">
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-blue-200">
                      Este robô utilizará inteligência artificial para executar operações de arbitragem automaticamente. 
                      Seus fundos estarão protegidos por nosso sistema de segurança multicamadas.
                    </AlertDescription>
                  </Alert>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => handleInvestment(selectedPlan)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Ativar Agora
                    </Button>
                    <Button 
                      onClick={() => setSelectedPlan(null)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:text-white"
                    >
                      Fechar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Investments;