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
  CheckCircle,
  PlayCircle,
  Users,
  Crown,
  Star,
  Trophy,
  TrendingDown,
  ArrowLeft,
  PlusCircle,
  Flame,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  AreaChart,
  Tooltip
} from "recharts";
import { useNavigate } from "react-router-dom";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { PlanTradingChart } from "@/components/PlanTradingChart";

interface InvestmentPlan {
  id: string;
  name: string;
  daily_rate: number;
  minimum_amount: number;
  max_investment_amount?: number;
  duration_days: number;
  description: string;
  status: string;
  minimum_indicators: number;
  features: string[];
}

interface UserInvestment {
  id: string;
  investment_plan_id: string;
  amount: number;
  daily_rate: number;
  start_date: string;
  end_date: string;
  total_earned: number;
  status: "active" | "completed";
  operations_completed: number;
  total_operations: number;
  current_day_progress: number;
  today_earnings: number;
  daily_target: number;
  days_remaining: number;
  created_at: string;
  updated_at: string;
}

const TradingInvestments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // State Management
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'active' | 'history'>('plans');
  const [userReferrals, setUserReferrals] = useState<number>(0);
  const [showInvestDialog, setShowInvestDialog] = useState(false);
  const [processingOperations, setProcessingOperations] = useState<Set<string>>(new Set());
  const [hiddenAmounts, setHiddenAmounts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchUserInvestments();
      fetchUserReferrals();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('status', 'active')
        .order('minimum_amount');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar planos de investimento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInvestments = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserInvestments(data || []);
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
    }
  };

  const fetchUserReferrals = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .eq('status', 'active');
        
      if (error) throw error;
      setUserReferrals(data?.length || 0);
    } catch (error) {
      console.error('Erro ao buscar indicações:', error);
    }
  };

  const populateTestData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('populate-trading-data');
      
      if (error) throw error;
      
      toast({
        title: "✅ Dados Populados",
        description: "Dados de trading foram adicionados com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao popular dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao popular dados de teste",
        variant: "destructive"
      });
    }
  };

  const createInvestment = async () => {
    if (!selectedPlan || !selectedAmount || !user?.id) return;

    const amount = parseFloat(selectedAmount);
    
    if (amount < selectedPlan.minimum_amount) {
      toast({
        title: "Valor Inválido",
        description: `Valor mínimo é $${selectedPlan.minimum_amount}`,
        variant: "destructive"
      });
      return;
    }

    if (selectedPlan.max_investment_amount && amount > selectedPlan.max_investment_amount) {
      toast({
        title: "Valor Inválido", 
        description: `Valor máximo é $${selectedPlan.max_investment_amount}`,
        variant: "destructive"
      });
      return;
    }

    if (userReferrals < selectedPlan.minimum_indicators) {
      toast({
        title: "Indicações Insuficientes",
        description: `Este plano requer ${selectedPlan.minimum_indicators} indicações ativas`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + selectedPlan.duration_days);

      const { data, error } = await supabase
        .from('user_investments')
        .insert({
          user_id: user.id,
          investment_plan_id: selectedPlan.id,
          amount: amount,
          daily_rate: selectedPlan.daily_rate,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_earned: 0,
          status: 'active',
          operations_completed: 0,
          total_operations: selectedPlan.duration_days * 2, // 2 operações por dia
          current_day_progress: 0,
          today_earnings: 0,
          daily_target: amount * (selectedPlan.daily_rate / 100),
          days_remaining: selectedPlan.duration_days
        })
        .select();

      if (error) throw error;

      // Registrar operação de comissão para referrer
      if (userReferrals > 0) {
        await supabase.rpc('calculate_referral_commission_auto', {
          referred_user_id: user.id,
          investment_amount: amount
        });
      }

      toast({
        title: "✅ Investimento Criado!",
        description: `Seu plano ${selectedPlan.name} está ativo!`,
      });

      setShowInvestDialog(false);
      setSelectedAmount("");
      setSelectedPlan(null);
      fetchUserInvestments();

    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar investimento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeArbitrage = async (investment: UserInvestment) => {
    if (processingOperations.has(investment.id)) return;

    // Verificar limite de operações por dia
    if (investment.operations_completed >= 2) {
      toast({
        title: "⚠️ Limite Atingido",
        description: "Aguarde o reset diário para executar novas operações.",
        variant: "destructive"
      });
      return;
    }

    setProcessingOperations(prev => new Set(prev).add(investment.id));

    try {
      // Iniciar simulação em tempo real
      toast({
        title: "🚀 Arbitragem Iniciada!",
        description: "Executando operação em tempo real...",
      });

      // Simular tempo de execução (3-8 segundos)
      const executionTime = 3000 + Math.random() * 5000;
      
      await new Promise(resolve => setTimeout(resolve, executionTime));

      // Calcular lucro da operação baseado na daily_rate com variação
      const baseProfit = (investment.amount * investment.daily_rate) / 100 / 2;
      const variation = 0.8 + Math.random() * 0.4; // 80% a 120% da taxa base
      const operationProfit = baseProfit * variation;

      // Atualizar saldo do usuário na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('balance, total_profit')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      const newBalance = (profileData.balance || 0) + operationProfit;

      // Atualizar saldo principal
      const { error: balanceUpdateError } = await supabase
        .from('profiles')
        .update({ 
          balance: newBalance,
          total_profit: (profileData.total_profit || 0) + operationProfit 
        })
        .eq('user_id', user?.id);

      if (balanceUpdateError) throw balanceUpdateError;

      // Atualizar investimento
      const { error: updateError } = await supabase
        .from('user_investments')
        .update({
          operations_completed: investment.operations_completed + 1,
          total_earned: investment.total_earned + operationProfit,
          today_earnings: investment.today_earnings + operationProfit,
          current_day_progress: ((investment.operations_completed + 1) / 2) * 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', investment.id)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      // Registrar no histórico de trading
      await supabase
        .from('trading_profits')
        .insert({
          user_id: user?.id,
          investment_amount: investment.amount,
          daily_rate: investment.daily_rate,
          plan_name: plans.find(p => p.id === investment.investment_plan_id)?.name || 'Unknown',
          total_profit: operationProfit,
          exchanges_count: Math.floor(Math.random() * 3) + 2, // 2-4 exchanges
          completed_operations: 1,
          execution_time_seconds: Math.floor(executionTime / 1000),
          profit_per_exchange: operationProfit / (Math.floor(Math.random() * 3) + 2),
          metadata: {
            operation_number: investment.operations_completed + 1,
            operation_type: 'arbitrage_operation',
            pair: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'][Math.floor(Math.random() * 5)],
            exchanges: ['Binance', 'Coinbase', 'Kraken', 'Bitfinex'],
            profit_percentage: (operationProfit / investment.amount * 100).toFixed(4)
          }
        });

      toast({
        title: "✅ Arbitragem Concluída!",
        description: `Lucro de $${operationProfit.toFixed(2)} adicionado ao seu saldo!`,
      });

      fetchUserInvestments();

    } catch (error) {
      console.error('Erro ao executar arbitragem:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar arbitragem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setProcessingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(investment.id);
        return newSet;
      });
    }
  };

  const toggleHideAmount = (investmentId: string) => {
    setHiddenAmounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(investmentId)) {
        newSet.delete(investmentId);
      } else {
        newSet.add(investmentId);
      }
      return newSet;
    });
  };

  const getPlanDisplayName = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.name || 'Plano Desconhecido';
  };

  const activeInvestments = userInvestments.filter(inv => inv.status === 'active');
  const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = userInvestments.reduce((sum, inv) => sum + inv.total_earned, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Trading Style */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Trading Investments
              </h1>
              <p className="text-slate-300 text-lg">
                Robôs de arbitragem automatizados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 text-sm font-bold border-0">
              <Users className="h-4 w-4 mr-2" />
              {userReferrals} Indicações
            </Badge>
            <Badge className="bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-900 text-sm font-bold border-0">
              <Activity className="h-4 w-4 mr-2" />
              {activeInvestments.length} Ativos
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={populateTestData}
              className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50 text-xs"
            >
              🧪 Popular Dados
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-600/30">
          {[
            { key: 'plans', label: 'Planos Disponíveis', icon: Bot },
            { key: 'active', label: 'Investimentos Ativos', icon: Activity },
            { key: 'history', label: 'Histórico', icon: BarChart3 }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? 'default' : 'ghost'}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 flex items-center gap-2 ${
                activeTab === key 
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        {activeInvestments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Investido</p>
                    <p className="text-2xl font-bold text-white">${totalInvested.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm">Total Ganhos</p>
                    <p className="text-2xl font-bold text-emerald-400">+${totalEarnings.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">ROI Médio</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {totalInvested > 0 ? ((totalEarnings / totalInvested) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {plans.map((plan) => {
                const canInvest = userReferrals >= plan.minimum_indicators;
                const isLocked = !canInvest;
                
                return (
                  <div key={plan.id} className="space-y-6">
                    {/* Plan Card */}
                    <Card 
                      className={`relative overflow-hidden transition-all duration-300 ${
                        isLocked 
                          ? 'bg-slate-800/50 border-slate-600/50 opacity-75' 
                          : 'bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-slate-600/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10'
                      }`}
                    >
                      {/* Profit Information Box */}
                      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-emerald-500/30 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-300 text-sm font-medium">
                              💰 Lucro Diário Potencial
                            </p>
                            <p className="text-emerald-400 text-lg font-bold">
                              Até {plan.daily_rate}% ao dia
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-300 text-xs">
                              Simulação com $1,000
                            </p>
                            <p className="text-emerald-400 text-xl font-bold">
                              Até ${(1000 * plan.daily_rate / 100).toFixed(2)}/dia
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <p className="text-emerald-200 text-sm">
                            {isLocked 
                              ? `🔒 Veja abaixo a simulação em tempo real de como você poderia lucrar até ${plan.daily_rate}% hoje!`
                              : '🎯 Participe e veja seus lucros crescerem diariamente com arbitragem automática!'
                            }
                          </p>
                        </div>
                      </div>
                      {isLocked && (
                        <div className="absolute top-4 right-4 z-10">
                          <Lock className="h-5 w-5 text-red-400" />
                        </div>
                      )}
                      
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className={`text-xl font-bold flex items-center gap-2 ${
                            isLocked ? 'text-slate-400' : 'text-white'
                          }`}>
                            <Bot className={`h-5 w-5 ${isLocked ? 'text-slate-400' : 'text-emerald-400'}`} />
                            {plan.name}
                          </CardTitle>
                          <Badge 
                            variant={isLocked ? "secondary" : "default"} 
                            className={`${
                              isLocked 
                                ? 'bg-slate-600 text-slate-300' 
                                : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900'
                            } font-bold`}
                          >
                            {plan.daily_rate}% / dia
                          </Badge>
                        </div>
                        <p className={`text-sm ${isLocked ? 'text-slate-500' : 'text-slate-300'}`}>
                          {plan.description}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className={`flex items-center gap-1 text-sm ${
                              isLocked ? 'text-slate-500' : 'text-slate-400'
                            }`}>
                              <DollarSign className="w-4 h-4" />
                              Valor Mínimo
                            </div>
                            <div className={`font-semibold ${isLocked ? 'text-slate-400' : 'text-white'}`}>
                              ${plan.minimum_amount}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className={`flex items-center gap-1 text-sm ${
                              isLocked ? 'text-slate-500' : 'text-slate-400'
                            }`}>
                              <Clock className="w-4 h-4" />
                              Duração
                            </div>
                            <div className={`font-semibold ${isLocked ? 'text-slate-400' : 'text-white'}`}>
                              {plan.duration_days} dias
                            </div>
                          </div>
                        </div>

                        {plan.minimum_indicators > 0 && (
                          <div className="space-y-1">
                            <div className={`flex items-center gap-1 text-sm ${
                              isLocked ? 'text-slate-500' : 'text-slate-400'
                            }`}>
                              <Users className="w-4 h-4" />
                              Indicações Necessárias
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`font-semibold ${isLocked ? 'text-slate-400' : 'text-white'}`}>
                                {plan.minimum_indicators}
                              </div>
                              <Badge 
                                variant={canInvest ? "default" : "destructive"} 
                                className="text-xs"
                              >
                                Você tem: {userReferrals}
                              </Badge>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h4 className={`text-sm font-medium ${
                            isLocked ? 'text-slate-500' : 'text-slate-300'
                          }`}>
                            Recursos:
                          </h4>
                          <div className="space-y-1">
                            {plan.features?.slice(0, 3).map((feature, index) => (
                              <div 
                                key={index} 
                                className={`text-xs flex items-center gap-1 ${
                                  isLocked ? 'text-slate-600' : 'text-slate-400'
                                }`}
                              >
                                <div className={`w-1 h-1 rounded-full ${
                                  isLocked ? 'bg-slate-500' : 'bg-emerald-400'
                                }`}></div>
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button 
                          onClick={() => {
                            setSelectedPlan(plan);
                            setShowInvestDialog(true);
                          }}
                          disabled={isLocked}
                          className={`w-full ${
                            isLocked 
                              ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-900 font-bold'
                          }`}
                        >
                          {canInvest ? 'Investir Agora' : `Precisa de ${plan.minimum_indicators} indicações`}
                        </Button>

                        {plan.max_investment_amount && (
                          <div className={`text-xs text-center ${
                            isLocked ? 'text-slate-600' : 'text-slate-500'
                          }`}>
                            Máximo: ${plan.max_investment_amount}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Trading Chart for this plan */}
                    <PlanTradingChart 
                      planId={plan.id}
                      planName={plan.name}
                      dailyRate={plan.daily_rate}
                      isLocked={isLocked}
                      userInvestmentAmount={1000}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-6">
            {activeInvestments.length === 0 ? (
              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30">
                <CardContent className="p-12 text-center">
                  <Bot className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Nenhum Investimento Ativo
                  </h3>
                  <p className="text-slate-300 mb-6">
                    Comece a investir em nossos robôs de arbitragem!
                  </p>
                  <Button 
                    onClick={() => setActiveTab('plans')}
                    className="bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 font-bold"
                  >
                    Ver Planos Disponíveis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeInvestments.map((investment) => {
                  const isHidden = hiddenAmounts.has(investment.id);
                  const isProcessing = processingOperations.has(investment.id);
                  const canExecuteOperation = investment.operations_completed < 2;
                  const planName = getPlanDisplayName(investment.investment_plan_id);
                  
                  return (
                    <Card 
                      key={investment.id} 
                      className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30 hover:border-emerald-500/50 transition-all duration-300"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-emerald-400" />
                            <CardTitle className="text-white">{planName}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleHideAmount(investment.id)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                            >
                              {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              {investment.daily_rate}% / dia
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-slate-400 text-sm">Valor Investido</p>
                            <p className="text-xl font-bold text-white">
                              {isHidden ? '•••••' : `$${investment.amount.toFixed(2)}`}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-400 text-sm">Total Ganhos</p>
                            <p className="text-xl font-bold text-emerald-400">
                              {isHidden ? '•••••' : `+$${investment.total_earned.toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Progresso Diário</span>
                            <span className="text-white">{investment.current_day_progress}%</span>
                          </div>
                          <Progress 
                            value={investment.current_day_progress} 
                            className="h-2 bg-slate-700"
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="space-y-1">
                            <p className="text-slate-400 text-xs">Operações</p>
                            <p className="text-white font-bold">
                              {investment.operations_completed}/2
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-400 text-xs">Dias Restantes</p>
                            <p className="text-white font-bold">{investment.days_remaining}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-400 text-xs">Hoje</p>
                            <p className="text-emerald-400 font-bold">
                              {isHidden ? '•••' : `$${investment.today_earnings.toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => executeArbitrage(investment)}
                            disabled={!canExecuteOperation || isProcessing}
                            className={`flex-1 ${
                              canExecuteOperation 
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-900' 
                                : 'bg-slate-600 text-slate-400'
                            } font-bold transition-all duration-300`}
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                                Executando Arbitragem...
                              </>
                            ) : canExecuteOperation ? (
                              <>
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                Executar Arbitragem
                              </>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 mr-2" />
                                Aguardar Reset (24h)
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {/* Gráfico de Trading em Tempo Real */}
                        <div className="mt-4">
                          <PlanTradingChart 
                            planId={investment.investment_plan_id}
                            planName={planName}
                            dailyRate={investment.daily_rate}
                            isLocked={false}
                            userInvestmentAmount={investment.amount}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Histórico de Operações
              </h3>
              <p className="text-slate-300">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Investment Dialog */}
      <Dialog open={showInvestDialog} onOpenChange={setShowInvestDialog}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Investir em {selectedPlan?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4 p-4 bg-slate-700/50 rounded-lg">
              <h4 className="font-bold text-emerald-400">Detalhes do Plano:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>Taxa Diária: <span className="text-emerald-400 font-bold">{selectedPlan?.daily_rate}%</span></div>
                <div>Duração: <span className="text-white font-bold">{selectedPlan?.duration_days} dias</span></div>
                <div>Mínimo: <span className="text-white font-bold">${selectedPlan?.minimum_amount}</span></div>
                <div>Máximo: <span className="text-white font-bold">${selectedPlan?.max_investment_amount || 'Ilimitado'}</span></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-emerald-400 font-bold">
                Valor do Investimento
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Digite o valor"
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                min={selectedPlan?.minimum_amount}
                max={selectedPlan?.max_investment_amount}
              />
            </div>
            
            {selectedAmount && selectedPlan && (
              <div className="space-y-2 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                <h4 className="font-bold text-emerald-400">Projeção de Ganhos:</h4>
                <div className="text-sm space-y-1">
                  <div>Ganho Diário: <span className="text-emerald-400 font-bold">
                    ${((parseFloat(selectedAmount) * selectedPlan.daily_rate) / 100).toFixed(2)}
                  </span></div>
                  <div>Ganho Total: <span className="text-emerald-400 font-bold">
                    ${((parseFloat(selectedAmount) * selectedPlan.daily_rate * selectedPlan.duration_days) / 100).toFixed(2)}
                  </span></div>
                  <div>ROI: <span className="text-emerald-400 font-bold">
                    {((selectedPlan.daily_rate * selectedPlan.duration_days)).toFixed(1)}%
                  </span></div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowInvestDialog(false)}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button 
                onClick={createInvestment}
                disabled={!selectedAmount || isLoading}
                className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 font-bold"
              >
                {isLoading ? 'Criando...' : 'Confirmar Investimento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradingInvestments;