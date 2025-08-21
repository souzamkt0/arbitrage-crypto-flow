import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  Calendar,
  PiggyBank,
  Plus,
  Bot,
  Timer,
  Play,
  ArrowUpDown,
  Activity,
  Zap,
  Sparkles,
  BarChart3,
  CreditCard,
  Wallet,
  ChevronRight,
  Shield,
  TrendingDown,
  CheckCircle,
  PlayCircle,
  Users,
  ChevronDown,
  ChevronUp,
  Lock,
  Crown,
  Settings,
  User,
  Key,
  LogOut,
  Menu
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Tooltip
} from "recharts";
import TradingSimulator from "@/components/TradingSimulator";
import { TradingHistory } from "@/components/TradingHistory";
import { TradingHistoryExtrato } from "@/components/TradingHistoryExtrato";
import { useNavigate } from "react-router-dom";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { useCurrency } from "@/hooks/useCurrency";

interface Investment {
  id: string;
  name: string;
  dailyRate: number;
  minimumAmount: number;
  maximumAmount: number;
  duration: number; // dias
  description: string;
  status: "active" | "inactive";
  operations?: number; // operações por dia
  requiredReferrals?: number; // indicações necessárias
  contractFee?: number; // taxa do contrato
}

interface UserInvestment {
  id: string;
  investmentId: string;
  investmentName: string;
  amount: number;
  dailyRate: number;
  startDate: string;
  endDate: string;
  totalEarned: number;
  status: "active" | "completed";
  daysRemaining: number;
  currentDayProgress: number; // 0-100 (% do dia atual)
  todayEarnings: number; // ganhos do dia atual
  dailyTarget: number; // meta de ganho diário
  currentOperation?: {
    pair: string;
    buyPrice: number;
    sellPrice?: number;
    profit?: number;
    status: "active" | "completed";
  };
  operationsCompleted: number; // operações completadas hoje
  dailyOperations: number; // operações máximas por dia
  lastOperationTime?: string;
  canOperate: boolean; // se pode fazer operação agora
  nextOperationIn?: number; // segundos para próxima operação
}

interface PlanMission {
  currentPlanId: string;
  nextPlanId?: string;
  completed: boolean;
  referralsRequired: number;
  currentReferrals: number;
  reward?: number;
}

const Investments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  // State Management
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showActivePlans, setShowActivePlans] = useState(false);
  const [activeTab, setActiveTab] = useState<'investments' | 'history'>('investments');
  const [selectedInvestmentForTrading, setSelectedInvestmentForTrading] = useState<UserInvestment | null>(null);
  const [showTradingDialog, setShowTradingDialog] = useState(false);
  const [showOperationHistory, setShowOperationHistory] = useState(false);
  const [dailyResetTimers, setDailyResetTimers] = useState<Record<string, number>>({});
  const [timerIntervals, setTimerIntervals] = useState<Record<string, NodeJS.Timeout>>({});
  const [operationHistory, setOperationHistory] = useState<any[]>([]);
  const [tradingPairs] = useState([
    'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT', 'XRP/USDT', 'DOT/USDT', 'MATIC/USDT'
  ]);
  const [hiddenTables, setHiddenTables] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchInvestments();
      fetchUserInvestments();
      fetchOperationHistory();
    }
  }, [user]);

  const fetchInvestments = async () => {
    try {
      const { data: plansData, error: plansError } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('status', 'active')
        .order('minimum_amount');

      if (plansError) throw plansError;

      const formattedPlans: Investment[] = plansData.map(plan => ({
        id: plan.id,
        name: plan.name,
        dailyRate: plan.daily_rate,
        minimumAmount: plan.minimum_amount,
        maximumAmount: plan.max_investment_amount || 999999,
        duration: plan.duration_days,
        description: plan.description || '',
        status: plan.status === 'active' ? "active" : "inactive",
        operations: 1,
        requiredReferrals: plan.minimum_indicators || 0,
        contractFee: 0
      }));

      setInvestments(formattedPlans);
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar planos de investimento",
        variant: "destructive"
      });
    }
  };

  const fetchUserInvestments = async () => {
    if (!user?.id) return;

    try {
      const { data: investmentsData, error } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      const formattedInvestments: UserInvestment[] = investmentsData.map(investment => {
        const startDate = new Date(investment.created_at);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + investment.duration_days);
        
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, investment.duration_days - daysPassed);
        
        // Calcular progresso do dia atual (0-100%)
        const currentHour = now.getHours();
        const currentDayProgress = (currentHour / 24) * 100;
        
        // Ganhos do dia atual baseado no progresso
        const dailyTarget = investment.amount * (investment.daily_rate / 100);
        const todayEarnings = dailyTarget * (currentDayProgress / 100);

        return {
          id: investment.id,
          investmentId: investment.investment_plan_id,
          investmentName: investment.plan_name || 'Plano de Investimento',
          amount: investment.amount,
          dailyRate: investment.daily_rate,
          startDate: investment.created_at,
          endDate: endDate.toISOString(),
          totalEarned: investment.total_earned || 0,
          status: investment.status,
          daysRemaining,
          currentDayProgress,
          todayEarnings,
          dailyTarget,
          operationsCompleted: investment.operations_completed || 0,
          dailyOperations: 1,
          lastOperationTime: investment.last_operation_time,
          canOperate: true,
          nextOperationIn: 0
        };
      });

      setUserInvestments(formattedInvestments);
    } catch (error) {
      console.error('Erro ao buscar investimentos do usuário:', error);
    }
  };

  const fetchOperationHistory = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('investment_operations')
        .select(`
          *,
          user_investments!inner (
            user_id,
            plan_name
          )
        `)
        .eq('user_investments.user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setOperationHistory(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico de operações:', error);
    }
  };

  const activeInvestments = userInvestments.length;

  const getTotalActiveOperations = () => {
    return userInvestments.reduce((total, investment) => total + (investment.dailyOperations || 1), 0);
  };

  const getDailyOperationsFromPlan = (planName: string) => {
    return 1; // Por agora, todas as operações são 1 por dia
  };

  const calculateTodayEarnings = (investment: UserInvestment) => {
    return investment.dailyTarget * (investment.currentDayProgress / 100);
  };

  const formatTimeRemaining = (seconds: number) => {
    if (!seconds || seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const executeOperation = async (investment: UserInvestment) => {
    if (!investment.canOperate) {
      toast({
        title: "Operação não disponível",
        description: "Aguarde o tempo de recarga para executar nova operação.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Simular operação de arbitragem
      const randomPair = tradingPairs[Math.floor(Math.random() * tradingPairs.length)];
      const buyPrice = 45000 + (Math.random() * 10000); // Preço de compra simulado
      const sellPrice = buyPrice * (1.001 + Math.random() * 0.004); // 0.1% a 0.5% de lucro
      const profit = (sellPrice - buyPrice) / buyPrice * investment.amount;

      // Simular tempo de execução
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Registrar operação no histórico
      const newOperation = {
        id: `${Date.now()}-${selectedInvestmentForTrading.operationsCompleted + 1}`,
        pair: randomPair,
        buyPrice,
        sellPrice,
        profit,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      setOperationHistory(prev => [newOperation, ...prev]);

      // Atualizar investimento
      const updatedInvestment = {
        ...investment,
        operationsCompleted: investment.operationsCompleted + 1,
        totalEarned: investment.totalEarned + profit,
        canOperate: investment.operationsCompleted + 1 >= investment.dailyOperations ? false : true
      };

      setUserInvestments(prev => 
        prev.map(inv => inv.id === investment.id ? updatedInvestment : inv)
      );

      const remaining = investment.dailyOperations - (investment.operationsCompleted + 1);
      
      if (remaining > 0) {
        toast({
          title: "Operação Concluída! 🎉",
          description: `+$${profit.toFixed(2)} ganhos. ${remaining} operação restante hoje.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Meta Diária Atingida! 🚀",
          description: `+$${profit.toFixed(2)} ganhos. Próximas operações em 24h.`,
          variant: "default"
        });
      }

      setSelectedInvestmentForTrading(updatedInvestment);
    } catch (error) {
      console.error('Erro na operação:', error);
      toast({
        title: "Erro na Operação",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivatePlan = async (planId: string, amount?: number) => {
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para ativar um plano",
        variant: "destructive"
      });
      return;
    }

    const plan = investments.find(p => p.id === planId);
    if (!plan) {
      toast({
        title: "Plano não encontrado",
        description: "O plano selecionado não foi encontrado",
        variant: "destructive"
      });
      return;
    }

    const investmentAmount = amount || plan.minimumAmount;

    try {
      setIsLoading(true);
      
      // Simular ativação do plano
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newInvestment: UserInvestment = {
        id: `inv-${Date.now()}`,
        investmentId: plan.id,
        investmentName: plan.name,
        amount: investmentAmount,
        dailyRate: plan.dailyRate,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString(),
        totalEarned: 0,
        status: "active",
        daysRemaining: plan.duration,
        currentDayProgress: 0,
        todayEarnings: 0,
        dailyTarget: investmentAmount * (plan.dailyRate / 100),
        operationsCompleted: 0,
        dailyOperations: plan.operations || 1,
        canOperate: true,
        nextOperationIn: 0
      };

      setUserInvestments(prev => [...prev, newInvestment]);

      toast({
        title: "Plano Ativado! 🎉",
        description: `${plan.name} foi ativado com investimento de $${investmentAmount.toFixed(2)}. Você pode executar operações quando quiser.`,
        variant: "default"
      });

      setSelectedPlan(null);
      setSelectedAmount("");
      setShowActivePlans(true);

    } catch (error) {
      console.error('Erro ao ativar plano:', error);
      toast({
        title: "Erro ao Ativar Plano",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Binance-style Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400/20 via-transparent to-blue-500/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-yellow-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Binance-style Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-8 h-8 text-black font-bold" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Alpha Trading Bot
              </h1>
              <p className="text-gray-300 text-sm">
                Sistema Avançado de Arbitragem Automatizada
              </p>
            </div>
          </div>
          
          {/* Aviso sobre regras de investimento */}
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-red-400 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-red-300 font-semibold">Aviso Importante sobre Investimentos</h3>
                <p className="text-red-200 text-sm mt-1">
                  Investimentos em criptomoedas envolvem riscos. Nunca invista mais do que você pode perder. 
                  Os resultados passados não garantem lucros futuros. Consulte sempre um consultor financeiro.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button
            onClick={() => setActiveTab('investments')}
            variant={activeTab === 'investments' ? 'default' : 'outline'}
            className={activeTab === 'investments' ? 
              'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700' : 
              'border-gray-600 text-gray-300 hover:text-white hover:border-yellow-500/50'}
          >
            <PiggyBank className="h-4 w-4 mr-2" />
            Investimentos
          </Button>
          <Button
            onClick={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'default' : 'outline'}
            className={activeTab === 'history' ? 
              'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700' : 
              'border-gray-600 text-gray-300 hover:text-white hover:border-yellow-500/50'}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Histórico
          </Button>
        </div>

        {/* Box de Planos Ativos - Movido para cá */}
        {activeInvestments > 0 && !showActivePlans && activeTab === 'investments' && (
          <div className="relative overflow-hidden bg-gradient-to-br from-green-950/80 via-emerald-900/60 to-green-800/80 rounded-2xl p-6 mb-6 border border-green-400/30 backdrop-blur-sm animate-fade-in">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-green-400/30 to-transparent animate-pulse"></div>
              <div className="absolute top-2 right-4 w-16 h-16 border-2 border-green-400/20 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
              <div className="absolute bottom-4 left-8 w-8 h-8 border border-green-400/30 rounded animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-12 text-xs text-green-300/60 animate-bounce" style={{ animationDelay: '0.2s' }}>
                📈 +2.4%
              </div>
              <div className="absolute top-8 right-16 text-xs text-emerald-300/50 animate-bounce" style={{ animationDelay: '1.5s' }}>
                💰 $1,247
              </div>
              <div className="absolute bottom-8 left-20 text-xs text-green-300/40 animate-bounce" style={{ animationDelay: '2.8s' }}>
                ⚡ Active
              </div>
            </div>

            {/* Market Chart Mini */}
            <div className="absolute top-0 right-0 w-32 h-20 opacity-20">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                <path d="M0,40 Q25,30 50,20 T100,10" stroke="#10b981" strokeWidth="1" fill="none" className="animate-pulse"/>
                <path d="M0,45 Q30,35 60,25 T100,15" stroke="#059669" strokeWidth="0.5" fill="none" opacity="0.7"/>
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center space-y-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center animate-pulse shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-ping">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-green-300 flex items-center space-x-2">
                    <span className="animate-pulse">🚀</span>
                    <span>TRADING ATIVO</span>
                  </h3>
                  <div className="text-green-200/80 text-sm">
                    {activeInvestments} plano{activeInvestments > 1 ? 's' : ''} gerando lucros
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => setShowActivePlans(!showActivePlans)}
                className={`${
                  showActivePlans 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                } text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 relative overflow-hidden group`}
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Activity className="h-5 w-5 mr-2 relative z-10" />
                <span className="relative z-10">
                  {showActivePlans ? 'Ver Planos de Investimento' : 'Ver Planos Ativos'}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'history' ? (
          <div className="space-y-6">
            <TradingHistoryExtrato />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Trading Dashboard - Planos Ativos */}
            {activeInvestments > 0 && (
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black rounded-3xl p-8 mb-8 border border-gray-700/50 backdrop-blur-xl animate-fade-in">
                {/* Trading Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,127,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,127,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
                
                {/* Floating Trading Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-6 left-12 text-green-400 text-xs font-mono animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}>
                    📈 BTC +3.2%
                  </div>
                  <div className="absolute top-12 right-16 text-blue-400 text-xs font-mono animate-bounce opacity-50" style={{ animationDelay: '1.5s' }}>
                    ETH $2,847
                  </div>
                  <div className="absolute bottom-16 left-20 text-yellow-400 text-xs font-mono animate-bounce opacity-40" style={{ animationDelay: '2.5s' }}>
                    ⚡ LIVE
                  </div>
                  <div className="absolute top-20 right-8 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-60"></div>
                  <div className="absolute bottom-20 left-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-50"></div>
                </div>

                {/* Trading Chart Background */}
                <div className="absolute top-0 right-0 w-80 h-40 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 200 100">
                    <defs>
                      <linearGradient id="tradingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00ff7f" stopOpacity="0.8"/>
                        <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4"/>
                      </linearGradient>
                    </defs>
                    <path 
                      d="M10,80 Q40,60 70,45 T120,30 T160,20 T190,15" 
                      stroke="url(#tradingGradient)" 
                      strokeWidth="2" 
                      fill="none"
                      className="animate-pulse"
                    />
                    <path 
                      d="M10,85 Q45,70 80,55 T130,40 T170,30 T190,25" 
                      stroke="url(#tradingGradient)" 
                      strokeWidth="1" 
                      fill="none" 
                      opacity="0.6"
                      className="animate-pulse"
                      style={{ animationDelay: '1s' }}
                    />
                  </svg>
                </div>

                {/* Main Trading Dashboard Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse shadow-2xl">
                          <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center animate-ping">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                          ALPHA TRADING DASHBOARD
                        </h2>
                        <p className="text-gray-400 text-sm flex items-center space-x-2 mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Sistema Operacional • {activeInvestments} Robôs Ativos</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        +{(userInvestments.reduce((sum, inv) => sum + inv.totalEarned, 0)).toFixed(2)} USD
                      </div>
                      <div className="text-sm text-gray-400">Total de Lucros</div>
                    </div>
                  </div>

                  {/* Trading Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Total Investido */}
                    <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-2xl p-6 border border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="text-blue-400 text-sm font-medium">CAPITAL</div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        ${userInvestments.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                      </div>
                      <div className="text-blue-300 text-sm">Total Investido</div>
                    </div>

                    {/* Planos Ativos */}
                    <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-2xl p-6 border border-green-500/30 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <Bot className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="text-green-400 text-sm font-medium">ROBÔS</div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1 flex items-center">
                        {activeInvestments}
                        <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                      </div>
                      <div className="text-green-300 text-sm">Sistemas Ativos</div>
                    </div>

                    {/* Operações Hoje */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                          <Activity className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="text-purple-400 text-sm font-medium">OPS</div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {userInvestments.reduce((sum, inv) => sum + inv.operationsCompleted, 0)}
                      </div>
                      <div className="text-purple-300 text-sm">Operações Hoje</div>
                    </div>

                    {/* Performance */}
                    <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 rounded-2xl p-6 border border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div className="text-yellow-400 text-sm font-medium">ROI</div>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        +{userInvestments.length > 0 ? 
                          ((userInvestments.reduce((sum, inv) => sum + inv.totalEarned, 0) / 
                            userInvestments.reduce((sum, inv) => sum + inv.amount, 0)) * 100).toFixed(1) 
                          : '0.0'}%
                      </div>
                      <div className="text-yellow-300 text-sm">Retorno Total</div>
                    </div>
                  </div>

                  {/* Trading Interface */}
                  <div className="bg-black/30 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <h3 className="text-xl font-bold text-white">Centro de Controle</h3>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-xs text-green-400 font-mono bg-green-400/10 px-3 py-1 rounded-full animate-pulse">
                          ● SISTEMA ATIVO
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {new Date().toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => setShowActivePlans(true)}
                        className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <div className="relative z-10 flex items-center justify-center space-x-2">
                          <BarChart3 className="w-5 h-5 group-hover:animate-pulse" />
                          <span>Gerenciar Robôs</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Button>

                      <Button
                        onClick={() => setShowOperationHistory(true)}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 py-4 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group"
                      >
                        <div className="relative z-10 flex items-center justify-center space-x-2">
                          <Activity className="w-5 h-5" />
                          <span>Ver Histórico</span>
                        </div>
                      </Button>

                      <Button
                        onClick={() => setShowActivePlans(false)}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 py-4 px-6 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group"
                      >
                        <div className="relative z-10 flex items-center justify-center space-x-2">
                          <Plus className="w-5 h-5" />
                          <span>Novos Planos</span>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Real-time Market Ticker */}
                  <div className="mt-6 bg-black/20 rounded-xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-center space-x-8 text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400">BTC/USDT: $67,234 (+2.34%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-blue-400">ETH/USDT: $3,847 (+1.87%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-purple-400">BNB/USDT: $634 (+0.92%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-yellow-400">ROI Total: +{((Math.random() * 100) + 50).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-green-400/20 rounded-tl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-blue-400/20 rounded-br-3xl"></div>
              </div>
            )}

            {showActivePlans ? (
              /* Active Trading Bots Dashboard */
              <div className="space-y-8">
                {/* Dashboard Header */}
                <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-black rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center animate-pulse">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Painel de Trading Bots</h2>
                        <p className="text-gray-400 text-sm">Gerencie seus robôs de arbitragem ativos</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400 text-sm font-medium">SISTEMAS ATIVOS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {userInvestments.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {userInvestments.map((investment, index) => (
                      <Card 
                        key={investment.id} 
                        className="bg-gradient-to-br from-slate-900/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-sm hover:border-green-500/30 transition-all duration-500 animate-fade-in hover-scale group relative overflow-hidden"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {/* Trading Bot Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/5 via-blue-900/5 to-purple-900/5 rounded-lg opacity-50"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-green-400/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Live Trading Indicator */}
                        <div className="absolute top-4 right-4 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                          <span className="text-green-400 text-xs font-mono">LIVE</span>
                        </div>

                        {/* Header */}
                        <CardHeader className="pb-4 relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                  <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              </div>
                              <div>
                                <CardTitle className="text-white text-lg font-bold group-hover:text-green-300 transition-colors">
                                  {investment.investmentName}
                                </CardTitle>
                                <div className="text-xs text-green-400 mt-1 flex items-center space-x-2">
                                  <Activity className="w-3 h-3" />
                                  <span>Arbitragem Ativa • {investment.dailyOperations} ops/dia</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        {/* Trading Metrics */}
                        <CardContent className="space-y-6 relative z-10">
                          {/* Main Stats */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl p-4 border border-blue-500/30 text-center">
                              <div className="text-xs text-blue-400 mb-1 font-medium">CAPITAL</div>
                              <div className="text-lg font-bold text-white">${investment.amount.toFixed(2)}</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-xl p-4 border border-green-500/30 text-center">
                              <div className="text-xs text-green-400 mb-1 font-medium">LUCRO</div>
                              <div className="text-lg font-bold text-green-400">+${investment.totalEarned.toFixed(2)}</div>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 rounded-xl p-4 border border-yellow-500/30 text-center">
                              <div className="text-xs text-yellow-400 mb-1 font-medium">HOJE</div>
                              <div className="text-lg font-bold text-yellow-400">+${calculateTodayEarnings(investment).toFixed(2)}</div>
                            </div>
                          </div>
                          
                          {/* Trading Progress */}
                          <div className="bg-black/30 rounded-xl p-4 border border-gray-700/30">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-gray-400 text-sm">Progresso Diário</span>
                              <span className="text-white font-bold text-sm">{investment.currentDayProgress.toFixed(1)}%</span>
                            </div>
                            <div className="relative">
                              <Progress 
                                value={investment.currentDayProgress} 
                                className="h-3 bg-gray-800/50"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-blue-500/30 to-purple-500/30 rounded-full animate-pulse opacity-60"></div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                              <span>00:00</span>
                              <span>Atual: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>23:59</span>
                            </div>
                          </div>

                          {/* Performance Metrics */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                              <div className="text-gray-400 mb-1">Taxa de Sucesso</div>
                              <div className="text-green-400 font-bold">98.7%</div>
                            </div>
                            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                              <div className="text-gray-400 mb-1">ROI Atual</div>
                              <div className="text-blue-400 font-bold">
                                +{((investment.totalEarned / investment.amount) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>

                          {/* Bot Status */}
                          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                            {investment.canOperate && investment.operationsCompleted < investment.dailyOperations ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-green-400 font-medium">Bot Pronto para Operar</span>
                                </div>
                                <div className="text-green-400 text-sm font-mono">
                                  {investment.dailyOperations - investment.operationsCompleted} ops restantes
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                                  <span className="text-yellow-400 font-medium">Aguardando Reset</span>
                                </div>
                                <div className="text-yellow-400 text-sm font-mono">
                                  {dailyResetTimers[investment.id] ? formatTimeRemaining(dailyResetTimers[investment.id]) : '24h'}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Trading Controls */}
                          <div className="space-y-3">
                            {/* Execute Operation Button */}
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (investment.canOperate && investment.operationsCompleted < investment.dailyOperations) {
                                  executeOperation(investment);
                                } else {
                                  toast({
                                    title: "Operações Concluídas",
                                    description: "Aguarde o reset diário para novas operações",
                                    variant: "default"
                                  });
                                }
                              }}
                              disabled={isLoading || !investment.canOperate || investment.operationsCompleted >= investment.dailyOperations}
                              className={`w-full relative overflow-hidden transition-all duration-300 ${
                                investment.canOperate && investment.operationsCompleted < investment.dailyOperations
                                  ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 text-white shadow-lg hover:shadow-green-500/25 transform hover:scale-105'
                                  : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
                              } group`}
                              size="lg"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                              
                              {isLoading ? (
                                <div className="relative z-10 flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                  <span>Executando Arbitragem...</span>
                                </div>
                              ) : investment.canOperate && investment.operationsCompleted < investment.dailyOperations ? (
                                <div className="relative z-10 flex items-center justify-center space-x-2">
                                  <Play className="h-5 w-5 group-hover:animate-pulse" />
                                  <span className="font-bold">EXECUTAR ARBITRAGEM</span>
                                  <Zap className="h-4 w-4 animate-pulse" />
                                </div>
                              ) : (
                                <div className="relative z-10 flex items-center justify-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span className="text-sm">Aguardando Reset Diário</span>
                                </div>
                              )}
                            </Button>

                            {/* Secondary Actions */}
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                onClick={() => setShowOperationHistory(true)}
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 group"
                                size="sm"
                              >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                <span>Histórico</span>
                              </Button>
                              
                              <Button
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 group"
                                size="sm"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                <span>Config</span>
                              </Button>
                            </div>
                          </div>

                          {/* Mini Trading Chart */}
                          <div className="bg-black/20 rounded-lg p-3 border border-gray-700/30">
                            <div className="text-xs text-gray-400 mb-2">Performance 24h</div>
                            <div className="h-12 relative">
                              <svg className="w-full h-full" viewBox="0 0 100 24">
                                <path 
                                  d="M5,20 Q15,15 25,12 T45,8 T65,6 T85,4 T95,2" 
                                  stroke="#10b981" 
                                  strokeWidth="1.5" 
                                  fill="none"
                                  className="animate-pulse"
                                />
                                <circle cx="95" cy="2" r="2" fill="#10b981" className="animate-pulse"/>
                              </svg>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-gray-600/30">
                      <Bot className="h-16 w-16 text-gray-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-400 mb-4">Nenhum Trading Bot Ativo</h3>
                    <p className="text-gray-500 mb-8 text-lg">Ative um robô de arbitragem para começar a gerar lucros automaticamente</p>
                    <Button
                      onClick={() => setShowActivePlans(false)}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-yellow-500/25 transform hover:scale-105 transition-all duration-300"
                      size="lg"
                    >
                      <Plus className="h-6 w-6 mr-2" />
                      Ativar Primeiro Robô
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Investment Plans View */
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-3">Planos de Arbitragem Automatizada</h2>
                  <p className="text-gray-400 text-lg">Escolha seu robô de trading e comece a lucrar com arbitragem de criptomoedas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {investments.map((investment, index) => (
                    <Card 
                      key={investment.id} 
                      className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-500 animate-fade-in hover-scale group relative overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Background Effects */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-yellow-400/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Bot className="w-6 h-6 text-black font-bold" />
                            </div>
                            <div>
                              <CardTitle className="text-white text-xl font-bold group-hover:text-yellow-300 transition-colors">
                                {investment.name}
                              </CardTitle>
                              <div className="text-xs text-gray-400">Sistema Automatizado</div>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold border-yellow-400/50 animate-pulse px-3 py-1"
                          >
                            {investment.dailyRate}% / dia
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6 relative z-10">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 group-hover:border-yellow-500/30 transition-colors">
                              <div className="text-xs text-gray-400 mb-1">Investimento Mín.</div>
                              <div className="text-white font-bold">{formatCurrency(investment.minimumAmount)}</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 group-hover:border-yellow-500/30 transition-colors">
                              <div className="text-xs text-gray-400 mb-1">Duração</div>
                              <div className="text-white font-bold">{investment.duration} dias</div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 border border-gray-600/50 group-hover:border-yellow-500/30 transition-colors">
                            <div className="text-xs text-yellow-400 mb-2 font-semibold">PROJEÇÃO DE RETORNO</div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-gray-400">Retorno Diário</div>
                                <div className="text-green-400 font-bold">+{investment.dailyRate}%</div>
                              </div>
                              <div>
                                <div className="text-gray-400">Retorno Total</div>
                                <div className="text-green-400 font-bold">+{(investment.dailyRate * investment.duration).toFixed(1)}%</div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Características do Robô</div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-gray-300">Arbitragem Automática</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span className="text-gray-300">Trading 24/7</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <span className="text-gray-300">Multi-Exchange</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                <span className="text-gray-300">Stop Loss Inteligente</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setSelectedPlan(investment)}
                          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group-button"
                          size="lg"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-button-hover:translate-x-full transition-transform duration-700"></div>
                          <Zap className="h-5 w-5 mr-2 relative z-10 animate-pulse" />
                          <span className="relative z-10">Ativar Robô Agora</span>
                          <ChevronRight className="h-5 w-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => setShowActivePlans(!showActivePlans)}
              className={`${
                showActivePlans 
                  ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-400 hover:via-indigo-500 hover:to-purple-500' 
                  : 'bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-400 hover:via-emerald-500 hover:to-teal-500'
              } text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 relative overflow-hidden group border border-white/10`}
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <Activity className="h-6 w-6 group-hover:animate-pulse" />
                <span className="text-lg">
                  {showActivePlans ? '🏠 Voltar aos Planos' : '⚡ Acessar Trading Dashboard'}
                </span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform animate-pulse" />
              </div>
              
              {/* Floating particles effect */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-2 left-4 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
                <div className="absolute top-4 right-8 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute bottom-3 left-12 w-1 h-1 bg-white/50 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </Button>
          </div>
        )}

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
                        <span className="text-gray-400">Investimento Mínimo:</span>
                        <span className="text-white">{formatCurrency(selectedPlan.minimumAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="amount" className="text-white mb-2 block">Valor do Investimento</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder={`Mínimo: ${formatCurrency(selectedPlan.minimumAmount)}`}
                      value={selectedAmount}
                      onChange={(e) => setSelectedAmount(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white focus:border-yellow-500"
                    />
                  </div>

                  {selectedAmount && parseFloat(selectedAmount) >= selectedPlan.minimumAmount && (
                    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30">
                      <h4 className="text-green-300 font-semibold mb-2">💰 Projeção de Ganhos</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ganho Diário Estimado:</span>
                          <span className="text-green-400 font-bold">
                            +{formatCurrency(parseFloat(selectedAmount) * (selectedPlan.dailyRate / 100))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Estimado ({selectedPlan.duration} dias):</span>
                          <span className="text-green-400 font-bold">
                            +{formatCurrency(parseFloat(selectedAmount) * (selectedPlan.dailyRate / 100) * selectedPlan.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleActivatePlan(selectedPlan.id, parseFloat(selectedAmount))}
                    disabled={isLoading || !selectedAmount || parseFloat(selectedAmount) < selectedPlan.minimumAmount}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 rounded-xl"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Ativar Robô de Trading
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Operation History Modal */}
        <Dialog open={showOperationHistory} onOpenChange={setShowOperationHistory}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gray-900 border-gray-800 text-white">
            <DialogHeader className="border-b border-gray-800 pb-4">
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
                Histórico de Operações de Arbitragem
              </DialogTitle>
            </DialogHeader>
            
            <div className="overflow-auto max-h-[70vh]">
              {operationHistory.length > 0 ? (
                <div className="space-y-3">
                  {operationHistory.map((operation, index) => (
                    <div key={operation.id || index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-green-400">{operation.pair}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(operation.started_at || operation.timestamp).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-600 text-white">
                          Concluída
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Preço Compra</div>
                          <div className="font-semibold text-blue-400">
                            ${(operation.buy_price || operation.buyPrice)?.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Preço Venda</div>
                          <div className="font-semibold text-yellow-400">
                            ${(operation.sell_price || operation.sellPrice)?.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Lucro</div>
                          <div className="font-semibold text-green-400">
                            +${(operation.profit)?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400">Nenhuma operação registrada</h3>
                  <p className="text-gray-500">Execute operações para ver o histórico aqui</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-800 pt-4 flex justify-end">
              <Button
                onClick={() => setShowOperationHistory(false)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Investments;