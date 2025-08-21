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
            {/* Box de Planos Ativos - Trading Style */}
            {activeInvestments > 0 && !showActivePlans && (
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/80 via-green-900/60 to-teal-950/80 rounded-2xl p-6 mb-6 border border-emerald-400/30 backdrop-blur-sm animate-fade-in">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent animate-pulse"></div>
                  <div className="absolute top-2 right-4 w-16 h-16 border-2 border-emerald-400/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                  <div className="absolute bottom-4 left-8 w-8 h-8 border border-green-400/40 rounded animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 left-4 w-2 h-2 bg-emerald-400/60 rounded-full animate-ping"></div>
                  <div className="absolute top-1/4 right-8 w-3 h-3 bg-green-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Trading Chart Background */}
                <div className="absolute inset-0 opacity-5">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                        <stop offset="50%" stopColor="#059669" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#047857" stopOpacity="0.3"/>
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0,150 Q50,120 100,100 T200,80 T300,60 T400,40" 
                      stroke="url(#chartGradient)" 
                      strokeWidth="2" 
                      fill="none"
                      className="animate-pulse"
                    />
                    <path 
                      d="M0,160 Q60,140 120,120 T240,100 T360,80 T400,60" 
                      stroke="url(#chartGradient)" 
                      strokeWidth="1" 
                      fill="none" 
                      opacity="0.6"
                      className="animate-pulse"
                      style={{ animationDelay: '0.5s' }}
                    />
                  </svg>
                </div>

                {/* Floating Numbers Animation */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-8 text-xs font-mono text-emerald-400/60 animate-bounce" style={{ animationDelay: '0.2s' }}>
                    +{(Math.random() * 10).toFixed(2)}%
                  </div>
                  <div className="absolute top-8 right-12 text-xs font-mono text-green-400/50 animate-bounce" style={{ animationDelay: '1.2s' }}>
                    ${(Math.random() * 1000).toFixed(2)}
                  </div>
                  <div className="absolute bottom-8 left-16 text-xs font-mono text-teal-400/40 animate-bounce" style={{ animationDelay: '2s' }}>
                    ↗ {(Math.random() * 5).toFixed(1)}%
                  </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 text-center space-y-6">
                  {/* Header with Trading Icon */}
                  <div className="flex items-center justify-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center animate-pulse">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-emerald-300 flex items-center space-x-2">
                        <span className="animate-pulse">📈</span>
                        <span>TRADING ATIVO</span>
                      </h3>
                      <div className="text-sm text-emerald-200/80 font-mono animate-fade-in">
                        Real-time profit generation
                      </div>
                    </div>
                  </div>

                  {/* Stats Display */}
                  <div className="bg-black/20 rounded-xl p-4 border border-emerald-400/20 backdrop-blur-sm">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-emerald-300 animate-pulse">
                          {activeInvestments}
                        </div>
                        <div className="text-xs text-emerald-200/70 uppercase tracking-wider">
                          {activeInvestments === 1 ? 'Plano Ativo' : 'Planos Ativos'}
                        </div>
                      </div>
                      <div className="space-y-1 border-x border-emerald-400/20">
                        <div className="text-2xl font-bold text-green-300 animate-pulse flex items-center justify-center">
                          <Activity className="w-4 h-4 mr-1" />
                          {getTotalActiveOperations()}
                        </div>
                        <div className="text-xs text-green-200/70 uppercase tracking-wider">
                          Operações/dia
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-teal-300 flex items-center justify-center animate-pulse">
                          <Sparkles className="w-4 h-4 mr-1" />
                          ON
                        </div>
                        <div className="text-xs text-teal-200/70 uppercase tracking-wider">
                          Status
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => setShowActivePlans(true)}
                    className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 hover-scale group"
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 group-hover:animate-pulse" />
                      <span>Acessar Dashboard Trading</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </Button>

                  {/* Real-time Ticker */}
                  <div className="text-xs text-emerald-300/60 font-mono animate-pulse">
                    <div className="flex items-center justify-center space-x-4">
                      <span>BTC/USDT: +2.34%</span>
                      <span className="text-emerald-400">•</span>
                      <span>ETH/USDT: +1.87%</span>
                      <span className="text-emerald-400">•</span>
                      <span>Lucro: +{((Math.random() * 100) + 50).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-emerald-400/30 rounded-tl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-emerald-400/30 rounded-br-2xl"></div>
              </div>
            )}

            {showActivePlans ? (
              /* Active Plans View */
              <div className="space-y-6">

                {userInvestments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userInvestments.map((investment) => (
                      <Card key={investment.id} className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-sm hover:border-green-500/30 transition-all duration-300 animate-fade-in group hover-scale">
                        {/* Background pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/5 to-blue-900/5 rounded-lg"></div>
                        
                        {/* Header */}
                        <CardHeader className="pb-3 relative">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-white text-lg font-bold flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>{investment.investmentName}</span>
                              </CardTitle>
                              <div className="text-xs text-green-400 mt-1 flex items-center space-x-2">
                                <Activity className="w-3 h-3" />
                                <span>
                                  {getDailyOperationsFromPlan(investment.investmentName)} operações diárias
                                </span>
                              </div>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="bg-gradient-to-r from-green-600/80 to-green-500/80 text-white border-green-400/50 animate-pulse"
                            >
                              ATIVO
                            </Badge>
                          </div>
                        </CardHeader>

                        {/* Content */}
                        <CardContent className="space-y-4 relative">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                              <p className="text-xs text-gray-400 mb-1">Investido</p>
                              <span className={`font-bold text-white ${isMobile ? 'text-lg' : ''}`}>${investment.amount.toFixed(2)}</span>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                              <p className="text-xs text-gray-400 mb-1">Ganho Total</p>
                              <span className={`font-bold text-green-400 ${isMobile ? 'text-lg' : ''}`}>+${investment.totalEarned.toFixed(2)}</span>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                              <p className="text-xs text-gray-400 mb-1">Hoje</p>
                              <span className={`font-bold text-yellow-400 ${isMobile ? 'text-lg' : ''}`}>+${calculateTodayEarnings(investment).toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Progresso do Dia</span>
                                <span className="text-white font-medium">{investment.currentDayProgress.toFixed(1)}%</span>
                              </div>
                              <div className="relative">
                                <Progress 
                                  value={investment.currentDayProgress} 
                                  className="h-3 bg-gray-700/50"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded-full animate-pulse opacity-50"></div>
                              </div>
                            </div>

                            {/* Timer de Reset Diário */}
                            {dailyResetTimers[investment.id] > 0 && (
                              <div className="bg-gray-800/30 rounded-lg p-3 border border-yellow-500/30">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-yellow-400 flex items-center space-x-1">
                                    <Timer className="w-4 h-4" />
                                    <span>Reset Diário</span>
                                  </span>
                                  <span className="text-yellow-300 font-mono">
                                    {formatTimeRemaining(dailyResetTimers[investment.id])}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Status quando operações estão disponíveis */}
                            {investment.canOperate && investment.operationsCompleted < investment.dailyOperations && (
                              <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-lg p-3 border border-green-500/40">
                                <div className="flex items-center space-x-2 text-green-300">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                                  <span className="text-sm font-medium">
                                    Operação disponível • {investment.dailyOperations - investment.operationsCompleted} restante{investment.dailyOperations - investment.operationsCompleted !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Box de Trading Melhorado para Mobile */}
                            <div className="space-y-3">
                              {/* Botão Principal de Arbitragem */}
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
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-green-500/25 transform hover:scale-105'
                                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
                                } group`}
                                size={isMobile ? "lg" : "default"}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                
                                {isLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    <span className="relative z-10">Executando...</span>
                                  </>
                                ) : investment.canOperate && investment.operationsCompleted < investment.dailyOperations ? (
                                  <>
                                    <Play className="h-4 w-4 mr-2 relative z-10 group-hover:animate-pulse" />
                                    <span className="relative z-10 font-semibold">
                                      Executar Arbitragem
                                    </span>
                                    <Zap className="h-4 w-4 ml-2 relative z-10 animate-pulse" />
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-4 w-4 mr-2 relative z-10" />
                                    <span className="relative z-10 text-sm">
                                      {dailyResetTimers[investment.id] > 0 
                                        ? `⏰ ${formatTimeRemaining(dailyResetTimers[investment.id])}` 
                                        : 'Aguarde Reset Diário'}
                                    </span>
                                  </>
                                )}
                              </Button>

                              {/* Botão de Histórico */}
                              <Button
                                onClick={() => setShowOperationHistory(true)}
                                variant="outline"
                                className="w-full border-gray-600 text-gray-300 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 relative overflow-hidden group"
                                size={isMobile ? "default" : "sm"}
                              >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                <span>Histórico de Operações</span>
                                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center">
                      <PiggyBank className="h-12 w-12 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-400 mb-2">Nenhum Investimento Ativo</h3>
                    <p className="text-gray-500 mb-6">Ative um plano para começar a gerar lucros com arbitragem automática</p>
                    <Button
                      onClick={() => setShowActivePlans(false)}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-8 py-3 rounded-xl"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Ver Planos Disponíveis
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
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              } text-white font-bold px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group`}
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Activity className="h-5 w-5 mr-2 relative z-10" />
              <span className="relative z-10">
                {showActivePlans ? 'Ver Planos de Investimento' : 'Ver Planos Ativos'}
              </span>
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