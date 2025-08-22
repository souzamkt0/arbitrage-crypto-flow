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
  Menu,
  ArrowLeft,
  Bell,
  LineChart,
  PieChart,
  Layers,
  Network,
  Share2,
  Globe,
  Smartphone,
  Mail,
  RefreshCw,
  Info,
  Star,
  Gift,
  Award,
  Rocket,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Tooltip,
  CartesianGrid
} from "recharts";
import TradingSimulator from "@/components/TradingSimulator";
import { TradingHistory } from "@/components/TradingHistory";
import { TradingHistoryExtrato } from "@/components/TradingHistoryExtrato";
import { useNavigate } from "react-router-dom";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { useCurrency } from "@/hooks/useCurrency";
import { MarketOverview } from "@/components/MarketOverview";
import { TradingChart } from "@/components/TradingChart";
import { CardanoChart } from "@/components/CardanoChart";
import { EthereumChart } from "@/components/EthereumChart";
import { SolanaChart } from "@/components/SolanaChart";

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
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'active' | 'history'>('overview');
  const [selectedInvestmentForTrading, setSelectedInvestmentForTrading] = useState<UserInvestment | null>(null);
  const [showTradingDialog, setShowTradingDialog] = useState(false);
  const [showOperationHistory, setShowOperationHistory] = useState(false);
  const [operationHistory, setOperationHistory] = useState<any[]>([]);
  const [userReferrals, setUserReferrals] = useState<number>(0);
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalEarned: 0,
    activeInvestments: 0,
    dailyEarnings: 0
  });

  // Generate mock trading data for charts
  const generateTradingData = () => {
    const data = [];
    const basePrice = 45000;
    for (let i = 0; i < 30; i++) {
      data.push({
        time: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        price: basePrice + (Math.random() - 0.5) * 5000,
        volume: Math.random() * 1000,
        profit: Math.random() * 500
      });
    }
    return data;
  };

  const [tradingData] = useState(generateTradingData());

  useEffect(() => {
    if (user) {
      fetchInvestments();
      fetchUserInvestments();
      fetchOperationHistory();
      fetchUserReferrals();
      calculateStats();
    }
  }, [user]);

  const fetchUserReferrals = async () => {
    if (!user?.id) return;
    
    try {
      const { data: referralsData, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .eq('status', 'active');
        
      if (error) throw error;
      
      setUserReferrals(referralsData?.length || 0);
    } catch (error) {
      console.error('Erro ao buscar indicações:', error);
    }
  };

  const fetchInvestments = async () => {
    try {
      // Definir planos fixos com as especificações solicitadas (mantendo as regras existentes)
      const predefinedPlans: Investment[] = [
        {
          id: 'robo-400',
          name: 'Robô 4.0.0',
          dailyRate: 2.0,
          minimumAmount: 100,
          maximumAmount: 10000,
          duration: 30,
          description: 'Sistema Automatizado - Paga até 2% variável. O sistema faz arbitragem e os ganhos não são garantidos fixos.',
          status: "active",
          operations: 1,
          requiredReferrals: 0,
          contractFee: 0
        },
        {
          id: 'robo-405',
          name: 'Robô 4.0.5',
          dailyRate: 3.0,
          minimumAmount: 500,
          maximumAmount: 25000,
          duration: 30,
          description: 'Paga até 3%, porém precisa ter 10 pessoas ativas no primeiro plano (Robô 4.0.0) com planos ativos.',
          status: "active",
          operations: 1,
          requiredReferrals: 10,
          contractFee: 0
        },
        {
          id: 'robo-410',
          name: 'Robô 4.1.0',
          dailyRate: 4.0,
          minimumAmount: 1000,
          maximumAmount: 50000,
          duration: 30,
          description: 'Sistema Automatizado - Pode ganhar até 4%, porém precisa ter 40 pessoas ativas no plano Robô 4.0.5.',
          status: "active",
          operations: 1,
          requiredReferrals: 40,
          contractFee: 0
        },
        {
          id: 'seja-socio',
          name: 'Seja Sócio',
          dailyRate: 2.0,
          minimumAmount: 5000,
          maximumAmount: 2000000,
          duration: 365,
          description: 'Ganhe até 2% do faturamento da empresa. Projeção de $200mil a $2milhões por dia. Para participar, entre em contato via WhatsApp. Saque todo sexta-feira.',
          status: "active",
          operations: 1,
          requiredReferrals: 0,
          contractFee: 0
        }
      ];

      setInvestments(predefinedPlans);
    } catch (error) {
      console.error('Erro ao configurar planos:', error);
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
        if (isNaN(startDate.getTime())) {
          console.warn('Data inválida para investimento:', investment.id);
          return null;
        }
        
        const endDate = new Date(startDate);
        const durationDays = investment.duration_days || 30;
        endDate.setDate(startDate.getDate() + durationDays);
        
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, durationDays - daysPassed);
        
        const currentHour = now.getHours();
        const currentDayProgress = (currentHour / 24) * 100;
        
        const dailyRate = investment.daily_rate || 0.5;
        const dailyTarget = investment.amount * (dailyRate / 100);
        const todayEarnings = dailyTarget * (currentDayProgress / 100);

        return {
          id: investment.id,
          investmentId: investment.investment_plan_id,
          investmentName: 'Robô de Arbitragem',
          amount: investment.amount,
          dailyRate: dailyRate,
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
      }).filter(Boolean);

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
            id
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

  const calculateStats = () => {
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalEarned = userInvestments.reduce((sum, inv) => sum + inv.totalEarned, 0);
    const activeInvestments = userInvestments.length;
    const dailyEarnings = userInvestments.reduce((sum, inv) => sum + inv.todayEarnings, 0);

    setStats({
      totalInvested,
      totalEarned,
      activeInvestments,
      dailyEarnings
    });
  };

  const handleInvestment = async () => {
    if (!selectedPlan || !selectedAmount || !user) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um plano e valor",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(selectedAmount);
    if (amount < selectedPlan.minimumAmount || amount > selectedPlan.maximumAmount) {
      toast({
        title: "Valor inválido",
        description: `Valor deve estar entre $${selectedPlan.minimumAmount} e $${selectedPlan.maximumAmount}`,
        variant: "destructive"
      });
      return;
    }

    if (selectedPlan.requiredReferrals && userReferrals < selectedPlan.requiredReferrals) {
      toast({
        title: "Indicações insuficientes",
        description: `Você precisa de ${selectedPlan.requiredReferrals} indicações ativas para este plano. Você tem ${userReferrals}.`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Inserir investimento
      const { data, error } = await supabase
        .from('user_investments')
        .insert({
          user_id: user.id,
          plan_id: selectedPlan.id,
          amount: amount,
          daily_rate: selectedPlan.dailyRate,
          end_date: new Date(Date.now() + selectedPlan.duration * 24 * 60 * 60 * 1000).toISOString(),
          total_operations: selectedPlan.duration * (selectedPlan.operations || 1)
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Investimento realizado!",
        description: `Investimento de $${amount} no ${selectedPlan.name} foi criado com sucesso!`,
      });

      // Recarregar dados
      fetchUserInvestments();
      setSelectedAmount("");
      setSelectedPlan(null);
      
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      toast({
        title: "Erro",
        description: "Falha ao processar investimento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'robo-400': return 'from-blue-500 to-cyan-500';
      case 'robo-405': return 'from-purple-500 to-pink-500';
      case 'robo-410': return 'from-green-500 to-emerald-500';
      case 'seja-socio': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'robo-400': return Bot;
      case 'robo-405': return Zap;
      case 'robo-410': return Rocket;
      case 'seja-socio': return Crown;
      default: return Target;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Trading Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hover:bg-purple-500/10 text-purple-400 border border-purple-500/20 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">INVESTMENT TERMINAL</h1>
                  <p className="text-xs text-gray-400">Advanced trading platform</p>
                </div>
              </div>
            </div>

            {/* Center Section - Status */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">MARKET OPEN</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full">
                <Activity className="h-4 w-4 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">LIVE DATA</span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Invested */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Invested</p>
                  <p className="text-3xl font-bold text-blue-400">{formatCurrency(stats.totalInvested)}</p>
                  <p className="text-xs text-gray-500 mt-1">Portfolio value</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Wallet className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Earned */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Earned</p>
                  <p className="text-3xl font-bold text-green-400">{formatCurrency(stats.totalEarned)}</p>
                  <p className="text-xs text-gray-500 mt-1">All time profits</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Investments */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Active Plans</p>
                  <p className="text-3xl font-bold text-purple-400">{stats.activeInvestments}</p>
                  <p className="text-xs text-gray-500 mt-1">Running robots</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Bot className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Earnings */}
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Today's Earnings</p>
                  <p className="text-3xl font-bold text-yellow-400">{formatCurrency(stats.dailyEarnings)}</p>
                  <p className="text-xs text-gray-500 mt-1">24h performance</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Calendar className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'overview', label: 'Market Overview', icon: BarChart3 },
                { id: 'plans', label: 'Investment Plans', icon: Rocket },
                { id: 'active', label: 'Active Investments', icon: Activity },
                { id: 'history', label: 'Trading History', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Market Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-purple-400" />
                        Trading Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={tradingData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#9CA3AF"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            fontSize={12}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#F3F4F6'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="profit"
                            stroke="#8B5CF6"
                            fill="url(#gradient)"
                            strokeWidth={2}
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <MarketOverview />
                </div>

                {/* Additional Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <CardanoChart />
                  <EthereumChart />
                  <SolanaChart />
                </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {investments.map((plan) => {
                    const Icon = getPlanIcon(plan.id);
                    const canInvest = !plan.requiredReferrals || userReferrals >= plan.requiredReferrals;
                    
                    return (
                      <Card key={plan.id} className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-purple-500/20 overflow-hidden hover-scale">
                        <div className={`h-2 bg-gradient-to-r ${getPlanColor(plan.id)}`}></div>
                        
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 bg-gradient-to-br ${getPlanColor(plan.id)} rounded-lg`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                                <p className="text-purple-400 font-semibold">Up to {plan.dailyRate}% daily</p>
                              </div>
                            </div>
                            
                            {plan.id === 'seja-socio' && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                                <Crown className="h-3 w-3 mr-1" />
                                VIP
                              </Badge>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <p className="text-gray-300 text-sm leading-relaxed">{plan.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-gray-400 text-xs">Investment Range</p>
                              <p className="text-white font-semibold">
                                {formatCurrency(plan.minimumAmount)} - {formatCurrency(plan.maximumAmount)}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-gray-400 text-xs">Duration</p>
                              <p className="text-white font-semibold">{plan.duration} days</p>
                            </div>
                          </div>

                          {plan.requiredReferrals && plan.requiredReferrals > 0 && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-purple-400" />
                                <span className="text-purple-400 font-medium text-sm">Referrals Required</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-white">{userReferrals} / {plan.requiredReferrals}</span>
                                {canInvest ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Lock className="h-4 w-4 text-red-400" />
                                )}
                              </div>
                              <Progress 
                                value={(userReferrals / plan.requiredReferrals) * 100} 
                                className="mt-2 h-2"
                              />
                            </div>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className={`w-full ${canInvest 
                                  ? `bg-gradient-to-r ${getPlanColor(plan.id)} hover:opacity-90` 
                                  : 'bg-gray-600 cursor-not-allowed'
                                } text-white font-semibold py-3`}
                                disabled={!canInvest}
                                onClick={() => setSelectedPlan(plan)}
                              >
                                {canInvest ? (
                                  <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Invest Now
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Unlock Required
                                  </>
                                )}
                              </Button>
                            </DialogTrigger>
                            
                            {canInvest && (
                              <DialogContent className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-purple-500/20 text-white">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Icon className="h-6 w-6 text-purple-400" />
                                    Invest in {plan.name}
                                  </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="amount" className="text-gray-300">Investment Amount</Label>
                                    <Input
                                      id="amount"
                                      type="number"
                                      value={selectedAmount}
                                      onChange={(e) => setSelectedAmount(e.target.value)}
                                      placeholder={`Min: $${plan.minimumAmount}`}
                                      className="bg-slate-700/50 border-slate-600/50 text-white mt-2"
                                    />
                                  </div>
                                  
                                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-purple-400 mb-2">Investment Summary</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Daily Rate:</span>
                                        <span className="text-white">Up to {plan.dailyRate}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Duration:</span>
                                        <span className="text-white">{plan.duration} days</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Estimated Return:</span>
                                        <span className="text-green-400">
                                          {selectedAmount ? formatCurrency(parseFloat(selectedAmount) * (plan.dailyRate / 100) * plan.duration) : '$0.00'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Button 
                                    onClick={handleInvestment} 
                                    disabled={isLoading}
                                    className={`w-full bg-gradient-to-r ${getPlanColor(plan.id)} hover:opacity-90 text-white`}
                                  >
                                    {isLoading ? 'Processing...' : 'Confirm Investment'}
                                  </Button>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'active' && (
              <div className="space-y-6">
                {userInvestments.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Active Investments</h3>
                    <p className="text-gray-400 mb-6">Start your first investment to see your trading robots in action</p>
                    <Button 
                      onClick={() => setActiveTab('plans')}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      View Investment Plans
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {userInvestments.map((investment) => (
                      <Card key={investment.id} className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-purple-500/20">
                        <CardHeader className="border-b border-purple-500/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-white flex items-center gap-2">
                                <Bot className="h-5 w-5 text-purple-400" />
                                {investment.investmentName}
                              </CardTitle>
                              <p className="text-gray-400 text-sm">
                                {formatCurrency(investment.amount)} • {investment.dailyRate}% daily
                              </p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                              Active
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Total Earned</p>
                              <p className="text-white font-semibold">{formatCurrency(investment.totalEarned)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Days Remaining</p>
                              <p className="text-white font-semibold">{investment.daysRemaining}</p>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-400 text-sm">Today's Progress</span>
                              <span className="text-purple-400 text-sm">{Math.round(investment.currentDayProgress)}%</span>
                            </div>
                            <Progress value={investment.currentDayProgress} className="h-2" />
                            <p className="text-green-400 text-sm mt-1">
                              Earned today: {formatCurrency(investment.todayEarnings)}
                            </p>
                          </div>
                          
                          <Button 
                            variant="outline"
                            size="sm"
                            className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <TradingHistoryExtrato />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Investments;