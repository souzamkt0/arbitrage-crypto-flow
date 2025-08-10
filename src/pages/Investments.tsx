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
  BarChart3
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

interface Investment {
  id: string;
  name: string;
  dailyRate: number;
  minimumAmount: number;
  maximumAmount: number;
  duration: number; // dias
  description: string;
  status: "active" | "inactive";
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
    sellPrice: number;
    profit: number;
    progress: number; // 0-100
    timeRemaining: number; // segundos
  };
  operationsCompleted: number;
  totalOperations: number;
}

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [isTradingSimulatorOpen, setIsTradingSimulatorOpen] = useState(false);
  const [selectedInvestmentForTrading, setSelectedInvestmentForTrading] = useState<UserInvestment | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const cryptoPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "SOL/USDT", "XRP/USDT", "DOGE/USDT", "MATIC/USDT"];

  // Função para calcular operações de um plano
  const getDailyOperationsFromPlan = (planName: string): number => {
    if (planName?.includes('4.0.0') || planName?.includes('4.0')) {
      return 2;
    } else if (planName?.includes('4.0.5')) {
      return 3;
    } else if (planName?.includes('4.1.0')) {
      return 4;
    }
    return 2; // padrão
  };

  // Calcular total de operações de todos os planos ativos
  const getTotalActiveOperations = (): number => {
    return userInvestments
      .filter(inv => inv.status === "active")
      .reduce((total, inv) => total + getDailyOperationsFromPlan(inv.investmentName), 0);
  };

  // Gerar dados do gráfico
  const generateChartData = () => {
    const data = [];
    const basePrice = 43000;
    let currentPrice = basePrice;
    
    for (let i = 0; i < 50; i++) {
      const variation = (Math.random() - 0.5) * 1000;
      currentPrice += variation;
      
      data.push({
        time: i,
        price: Math.max(currentPrice, basePrice * 0.8),
        volume: Math.random() * 100000 + 50000,
        support: basePrice * 0.95,
        resistance: basePrice * 1.05
      });
    }
    
    return data;
  };

  // Atualizar dados do gráfico a cada 3 segundos
  useEffect(() => {
    setChartData(generateChartData());
    
    const interval = setInterval(() => {
      setChartData(generateChartData());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Load user data and investment plans
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Fetch user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setUserBalance(profile.balance || 0);
        }

        // Fetch user investments
        const { data: userInvs } = await supabase
          .from('user_investments')
          .select(`
            *,
            investment_plan:investment_plans(name),
            current_operations(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (userInvs) {
          const formattedInvestments = userInvs.map(inv => ({
            id: inv.id,
            investmentId: inv.investment_plan_id,
            investmentName: inv.investment_plan?.name || 'Plano',
            amount: inv.amount,
            dailyRate: inv.daily_rate,
            startDate: inv.start_date?.split('T')[0] || '',
            endDate: inv.end_date?.split('T')[0] || '',
            totalEarned: inv.total_earned || 0,
            status: inv.status as "active" | "completed",
            daysRemaining: inv.days_remaining || 0,
            currentDayProgress: inv.current_day_progress || 0,
            todayEarnings: inv.today_earnings || 0,
            dailyTarget: inv.daily_target,
            currentOperation: inv.current_operations?.[0] ? {
              pair: inv.current_operations[0].pair,
              buyPrice: inv.current_operations[0].buy_price,
              sellPrice: inv.current_operations[0].sell_price,
              profit: inv.current_operations[0].profit,
              progress: inv.current_operations[0].progress || 0,
              timeRemaining: inv.current_operations[0].time_remaining || 0
            } : undefined,
            operationsCompleted: inv.operations_completed || 0,
            totalOperations: inv.total_operations || 15
          }));
          setUserInvestments(formattedInvestments);
        }

        // Fetch referral count
        const { data: referrals } = await supabase
          .from('referrals')
          .select('id')
          .eq('referrer_id', user.id)
          .eq('status', 'active');
        
        if (referrals) {
          setReferralCount(referrals.length);
          console.log('Referrals encontrados:', referrals.length);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    // Load investment plans from Supabase
    const loadInvestmentPlans = async () => {
      try {
        const { data: plans, error } = await supabase
          .from('investment_plans')
          .select('*')
          .eq('status', 'active')
          .order('daily_rate', { ascending: true });

        if (error) {
          console.error('Error loading investment plans:', error);
          return;
        }

        if (plans) {
          const formattedPlans = plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            dailyRate: plan.daily_rate,
            minimumAmount: plan.minimum_amount,
            maximumAmount: plan.maximum_amount,
            duration: plan.duration_days,
            description: plan.description || '',
            status: plan.status as "active" | "inactive"
          }));
          setInvestments(formattedPlans);
        }
      } catch (error) {
        console.error('Error loading investment plans:', error);
      }
    };

    loadInvestmentPlans();

    loadUserData();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUserInvestments(prev => prev.map(investment => {
        if (investment.status !== "active") return investment;
        
        const speedMultiplier = investment.amount >= 10000 ? 3 : investment.amount >= 5000 ? 2 : 1;
        
        let newTotalEarned = investment.totalEarned;
        let newOperationsCompleted = investment.operationsCompleted;
        let newCurrentOperation = investment.currentOperation;

        // Atualizar operação atual
        if (newCurrentOperation) {
          const newOperationProgress = Math.min(newCurrentOperation.progress + (speedMultiplier * 2), 100);
          const newTimeRemaining = Math.max(newCurrentOperation.timeRemaining - 1, 0);

          if (newOperationProgress >= 100 || newTimeRemaining === 0) {
            // Operação completada
            newTotalEarned += newCurrentOperation.profit;
            newOperationsCompleted += 1;

            // Nova operação
            const randomPair = cryptoPairs[Math.floor(Math.random() * cryptoPairs.length)];
            const basePrice = Math.random() * 50000 + 1000;
            const buyPrice = basePrice;
            const sellPrice = buyPrice * (1 + (Math.random() * 0.002 + 0.001)); // 0.1% a 0.3% de lucro
            const profit = (investment.dailyTarget / investment.totalOperations) * (0.8 + Math.random() * 0.4);

            newCurrentOperation = {
              pair: randomPair,
              buyPrice: buyPrice,
              sellPrice: sellPrice,
              profit: profit,
              progress: 0,
              timeRemaining: Math.floor(Math.random() * 60 + 30) // 30-90 segundos
            };
          } else {
            newCurrentOperation = {
              ...newCurrentOperation,
              progress: newOperationProgress,
              timeRemaining: newTimeRemaining
            };
          }
        }
        
        return {
          ...investment,
          totalEarned: newTotalEarned,
          currentOperation: newCurrentOperation,
          operationsCompleted: newOperationsCompleted
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = userInvestments.reduce((sum, inv) => sum + inv.totalEarned, 0);
  const activeInvestments = userInvestments.filter(inv => inv.status === "active").length;

  const handleTradingComplete = async (profit: number) => {
    try {
      // Buscar dados atuais do usuário
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('balance, total_profit')
        .eq('user_id', user?.id)
        .single();

      const newBalance = (currentProfile?.balance || 0) + profit;
      const newTotalProfit = (currentProfile?.total_profit || 0) + profit;

      // Registrar operação de trading na tabela trading_history
      if (selectedInvestmentForTrading) {
        const operationId = `OP_${Date.now()}_${selectedInvestmentForTrading.investmentName}`;
        const buyPrice = 43000 + (Math.random() - 0.5) * 1000; // Preço base com variação
        const sellPrice = buyPrice * (1 + (Math.random() * 0.002 + 0.001)); // 0.1% a 0.3% lucro
        
        await supabase
          .from('trading_history')
          .insert({
            user_id: user?.id,
            buy_price: buyPrice,
            sell_price: sellPrice,
            amount: selectedInvestmentForTrading.amount,
            profit: profit,
            profit_percent: ((sellPrice - buyPrice) / buyPrice) * 100,
            execution_time: Math.floor(Math.random() * 60 + 30), // 30-90 segundos
            status: 'completed',
            exchange_1: 'Binance Spot',
            exchange_2: 'Binance Futures',
            operation_id: operationId,
            pair: 'BTC/USDT',
            type: 'investment_trading',
            strategy: selectedInvestmentForTrading.investmentName
          });
      }

      // Atualizar saldo do usuário
      const { error } = await supabase
        .from('profiles')
        .update({ 
          balance: newBalance,
          total_profit: newTotalProfit
        })
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      // Salvar último claim
      if (selectedInvestmentForTrading) {
        localStorage.setItem(`lastClaim_${selectedInvestmentForTrading.id}`, Date.now().toString());
      }
      
      // Atualizar estado local
      setUserBalance(newBalance);
      
      toast({
        title: "✅ Rendimento Creditado!",
        description: `+$${profit.toFixed(2)} foi adicionado ao seu saldo disponível. Novo saldo: $${newBalance.toFixed(2)}`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Erro ao processar rendimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar rendimento",
        variant: "destructive"
      });
    }
  };

  const handleInvest = async () => {
    if (!selectedInvestment || !investmentAmount) return;

    const amount = parseFloat(investmentAmount);
    
    console.log('Validando investimento:', {
      investmentName: selectedInvestment.name,
      referralCount: referralCount,
      amount: amount
    });

    // Buscar o plano de investimento com required_referrals
    try {
      const { data: plan, error } = await supabase
        .from('investment_plans')
        .select('required_referrals')
        .eq('name', selectedInvestment.name)
        .single();

      if (error) {
        console.error('Erro ao buscar plano:', error);
        toast({
          title: "Erro",
          description: "Erro ao validar plano de investimento.",
          variant: "destructive"
        });
        return;
      }

      const requiredReferrals = plan?.required_referrals || 0;

      // Verificar se o usuário já tem investimentos ativos
      const hasActiveInvestments = userInvestments.some(inv => inv.status === "active");

      // Se já tem investimentos ativos, pode investir em qualquer plano superior
      if (!hasActiveInvestments && referralCount < requiredReferrals) {
        console.log(`Bloqueando investimento ${selectedInvestment.name} - referrals insuficientes`);
        toast({
          title: "Referrals insuficientes",
          description: `Para o primeiro investimento no ${selectedInvestment.name}, você precisa ter ${requiredReferrals} referrals ativos. Você tem ${referralCount} referrals.`,
          variant: "destructive"
        });
        return;
      }

      // Se já tem investimentos, mostrar que pode expandir quantificação
      if (hasActiveInvestments && referralCount < requiredReferrals) {
        toast({
          title: "Expandindo Quantificação",
          description: `Você já tem investimentos ativos! Este plano adicionará mais ${getDailyOperationsFromPlan(selectedInvestment.name)} operações simultâneas.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Erro na validação de referrals:', error);
      toast({
        title: "Erro",
        description: "Erro ao validar requisitos de referrals.",
        variant: "destructive"
      });
      return;
    }
    
    if (amount < selectedInvestment.minimumAmount) {
      toast({
        title: "Valor insuficiente",
        description: `O valor mínimo para este investimento é $${selectedInvestment.minimumAmount}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > selectedInvestment.maximumAmount) {
      toast({
        title: "Valor excede o limite",
        description: `O valor máximo para este investimento é $${selectedInvestment.maximumAmount}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > userBalance) {
      toast({
        title: "Saldo insuficiente",
        description: `Saldo atual: $${userBalance.toFixed(2)}. Valor necessário: $${amount.toFixed(2)}. Adicione saldo através do painel administrativo.`,
        variant: "destructive"
      });
      return;
    }

    const dailyTarget = (amount * selectedInvestment.dailyRate) / 100;
    const totalOps = selectedInvestment.dailyRate === 2.5 ? 30 : selectedInvestment.dailyRate === 2.0 ? 20 : 15;
    
    const newInvestment: UserInvestment = {
      id: (userInvestments.length + 1).toString(),
      investmentId: selectedInvestment.id,
      investmentName: selectedInvestment.name,
      amount: amount,
      dailyRate: selectedInvestment.dailyRate,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + selectedInvestment.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalEarned: 0,
      status: "active",
      daysRemaining: selectedInvestment.duration,
      currentDayProgress: 0,
      todayEarnings: 0,
      dailyTarget: dailyTarget,
      currentOperation: {
        pair: cryptoPairs[0],
        buyPrice: 67420.50,
        sellPrice: 67451.20,
        profit: dailyTarget / totalOps,
        progress: 0,
        timeRemaining: 60
      },
      operationsCompleted: 0,
      totalOperations: totalOps
    };

    setUserInvestments([...userInvestments, newInvestment]);
    setIsInvestModalOpen(false);
    setInvestmentAmount("");
    setSelectedInvestment(null);

    toast({
      title: "Investimento realizado!",
      description: `Você investiu $${amount} no ${selectedInvestment.name}`,
    });
  };

  const openInvestModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setIsInvestModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-trading-green/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-trading-green/10 to-transparent rounded-full blur-3xl opacity-30" />
      
      <div className="relative z-10 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg animate-float-glow">
                <Bot className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-trading-green bg-clip-text text-transparent">
                  AlphaBot AI
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Sistema de Investimento Automatizado
                </p>
              </div>
            </div>
            
            {/* Balance Card */}
            <Card className="max-w-md mx-auto bg-gradient-to-br from-card via-card to-card/90 border border-primary/20 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Saldo Disponível</div>
                  <div className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    ${userBalance.toLocaleString()}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                      title="Atualizar saldo"
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span>Referrals: {referralCount}</span>
                    {userBalance === 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Adicione saldo
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-in-up">
            <Card className="bg-gradient-to-br from-card via-card to-card/90 border-primary/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Total Investido
                </CardTitle>
                <div className="p-2 rounded-full bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  ${totalInvested.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Em {activeInvestments} investimentos ativos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card via-card to-card/90 border-trading-green/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-trading-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Ganhos Totais
                </CardTitle>
                <div className="p-2 rounded-full bg-trading-green/10">
                  <TrendingUp className="h-4 w-4 text-trading-green" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-trading-green">
                  +${totalEarnings.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Rendimento acumulado
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card via-card to-card/90 border-warning/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  Investimentos Ativos
                </CardTitle>
                <div className="p-2 rounded-full bg-warning/10">
                  <Target className="h-4 w-4 text-warning" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-warning">
                  {activeInvestments}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  Planos em andamento
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Investment Plans Section */}
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary to-trading-green bg-clip-text text-transparent">
                Planos de Investimento AI
              </h2>
              <p className="text-muted-foreground text-lg">
                Escolha o robô e período de investimento ideal para você
              </p>
            </div>

            {/* Robô 4.0.0 - Enhanced */}
            <Card className="bg-gradient-to-br from-card via-card to-card/90 border-primary/30 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
              
              <CardHeader className="text-center relative z-10">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                    Iniciante
                  </Badge>
                </div>
                <CardTitle className="text-2xl text-card-foreground">
                  Robô 4.0.0
                </CardTitle>
                <p className="text-sm text-muted-foreground">Nenhuma recomendação necessária</p>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Taxa Diária</div>
                      <div className="text-lg font-bold text-trading-green">2.5%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Frequência</div>
                      <div className="text-lg font-bold text-primary">2x/dia</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Duração</div>
                      <div className="text-lg font-bold text-warning">40 dias</div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 rounded-lg">
                        <th className="text-left p-3 text-foreground font-semibold">Investir</th>
                        <th className="text-center p-3 text-foreground font-semibold">1 dia</th>
                        <th className="text-center p-3 text-foreground font-semibold">7 dias</th>
                        <th className="text-center p-3 text-foreground font-semibold">15 dias</th>
                        <th className="text-center p-3 text-foreground font-semibold">30 dias</th>
                        <th className="text-center p-3 text-foreground font-semibold">40 dias</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { amount: 10, returns: [0.25, 1.75, 3.75, 7.50, 10.00] },
                        { amount: 20, returns: [0.50, 3.50, 7.50, 15.00, 20.00] },
                        { amount: 30, returns: [0.75, 5.25, 11.25, 22.50, 30.00] },
                        { amount: 40, returns: [1.00, 7.00, 15.00, 30.00, 40.00] },
                        { amount: 50, returns: [1.25, 8.75, 18.75, 37.50, 50.00] },
                        { amount: 60, returns: [1.50, 10.50, 22.50, 45.00, 60.00] },
                        { amount: 70, returns: [1.75, 12.25, 26.25, 52.50, 70.00] },
                        { amount: 80, returns: [2.00, 14.00, 30.00, 60.00, 80.00] },
                        { amount: 90, returns: [2.25, 15.75, 33.75, 67.50, 90.00] },
                        { amount: 100, returns: [2.50, 17.50, 37.50, 75.00, 100.00] }
                      ].map((plan, index) => (
                        <tr key={index} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                          <td className="p-3 font-bold text-primary">${plan.amount}</td>
                          {plan.returns.map((ret, i) => (
                            <td key={i} className="p-3 text-center text-trading-green font-medium">
                              ${ret.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => openInvestModal(investments[0])}
                    className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Investir no Robô 4.0.0
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Robô 4.0.5 - Enhanced */}
            <Card className="bg-gradient-to-br from-card via-card to-card/90 border-warning/30 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-50" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-warning/20 to-transparent rounded-full blur-3xl" />
              
              <CardHeader className="text-center relative z-10">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-warning/10">
                    <Zap className="h-6 w-6 text-warning" />
                  </div>
                  <Badge className="bg-warning/20 text-warning border-warning/30 px-3 py-1">
                    Intermediário
                  </Badge>
                </div>
                <CardTitle className="text-2xl text-card-foreground">
                  Robô 4.0.5
                </CardTitle>
                <p className="text-sm text-muted-foreground">Mínimo 10 referrals necessários</p>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Taxa Diária</div>
                      <div className="text-lg font-bold text-trading-green">3.0%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Frequência</div>
                      <div className="text-lg font-bold text-warning">3x/dia</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Duração</div>
                      <div className="text-lg font-bold text-primary">40 dias</div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 rounded-lg">
                        <th className="text-left p-3 text-foreground font-semibold">Investir</th>
                        <th className="text-center p-3 text-foreground font-semibold">1 dia</th>
                        <th className="text-center p-3 text-foreground font-semibold">7 dias</th>
                        <th className="text-center p-3 text-foreground font-semibold">15 dias</th>
                        <th className="text-center p-3 text-foreground font-semibold">30 dias</th>
                        <th className="text-center p-3 text-foreground font-semibold">40 dias</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { amount: 20, returns: [0.60, 4.20, 9.00, 18.00, 24.00] },
                        { amount: 40, returns: [1.20, 8.40, 18.00, 36.00, 48.00] },
                        { amount: 60, returns: [1.80, 12.60, 27.00, 54.00, 72.00] },
                        { amount: 80, returns: [2.40, 16.80, 36.00, 72.00, 96.00] },
                        { amount: 100, returns: [3.00, 21.00, 45.00, 90.00, 120.00] },
                        { amount: 120, returns: [3.60, 25.20, 54.00, 108.00, 144.00] },
                        { amount: 140, returns: [4.20, 29.40, 63.00, 126.00, 168.00] },
                        { amount: 160, returns: [4.80, 33.60, 72.00, 144.00, 192.00] },
                        { amount: 180, returns: [5.40, 37.80, 81.00, 162.00, 216.00] },
                        { amount: 200, returns: [6.00, 42.00, 90.00, 180.00, 240.00] }
                      ].map((plan, index) => (
                        <tr key={index} className="border-b border-border/30 hover:bg-warning/5 transition-colors">
                          <td className="p-3 font-bold text-warning">${plan.amount}</td>
                          {plan.returns.map((ret, i) => (
                            <td key={i} className="p-3 text-center text-trading-green font-medium">
                              ${ret.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => openInvestModal(investments[1] || investments[0])}
                    className="bg-gradient-to-r from-warning to-warning/80 text-warning-foreground hover:from-warning/90 hover:to-warning/70 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Investir no Robô 4.0.5
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Robô 4.1.0 - Enhanced */}
            <Card className="bg-gradient-to-br from-card via-card to-card/90 border-trading-green/30 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-trading-green/5 to-transparent opacity-50" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-trading-green/20 to-transparent rounded-full blur-3xl" />
              
              <CardHeader className="text-center relative z-10">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-trading-green/10">
                    <Sparkles className="h-6 w-6 text-trading-green" />
                  </div>
                  <Badge className="bg-trading-green/20 text-trading-green border-trading-green/30 px-3 py-1">
                    Premium
                  </Badge>
                </div>
                <CardTitle className="text-2xl text-card-foreground">
                  Robô 4.1.0
                </CardTitle>
                <p className="text-sm text-muted-foreground">Mínimo 20 referrals necessários</p>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Taxa Diária</div>
                      <div className="text-lg font-bold text-trading-green">4.0%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Frequência</div>
                      <div className="text-lg font-bold text-trading-green">4x/dia</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Duração</div>
                      <div className="text-lg font-bold text-primary">40 dias</div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 rounded-lg">
                        <th className="text-left p-3 text-foreground font-semibold">Investir</th>
                        <th className="text-center p-3 text-foreground font-semibold">1 dia</th>
                        <th className="text-center p-3 text-foreground font-semibold">7 dias</th>
                        <th className="text-center p-3 text-foreground font-semibold">15 dias</th>
                        <th className="text-center p-3 text-foreground font-semibold">30 dias</th>
                        <th className="text-center p-3 text-foreground font-semibold">40 dias</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { amount: 500, returns: [20.00, 140.00, 300.00, 600.00, 800.00] },
                        { amount: 1000, returns: [40.00, 280.00, 600.00, 1200.00, 1600.00] },
                        { amount: 1500, returns: [60.00, 420.00, 900.00, 1800.00, 2400.00] },
                        { amount: 2000, returns: [80.00, 560.00, 1200.00, 2400.00, 3200.00] },
                        { amount: 2500, returns: [100.00, 700.00, 1500.00, 3000.00, 4000.00] },
                        { amount: 3000, returns: [120.00, 840.00, 1800.00, 3600.00, 4800.00] },
                        { amount: 3500, returns: [140.00, 980.00, 2100.00, 4200.00, 5600.00] },
                        { amount: 4000, returns: [160.00, 1120.00, 2400.00, 4800.00, 6400.00] },
                        { amount: 4500, returns: [180.00, 1260.00, 2700.00, 5400.00, 7200.00] },
                        { amount: 5000, returns: [200.00, 1400.00, 3000.00, 6000.00, 8000.00] }
                      ].map((plan, index) => (
                        <tr key={index} className="border-b border-border/30 hover:bg-trading-green/5 transition-colors">
                          <td className="p-3 font-bold text-trading-green">${plan.amount.toLocaleString()}</td>
                          {plan.returns.map((ret, i) => (
                            <td key={i} className="p-3 text-center text-trading-green font-medium">
                              ${ret.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => openInvestModal(investments[2] || investments[0])}
                    className="bg-gradient-to-r from-trading-green to-green-600 text-white hover:from-trading-green/90 hover:to-green-600/90 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Investir no Robô 4.1.0
                  </Button>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* My Investments */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Meus Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {userInvestments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {userInvestments.map((investment) => {
                  const currentOperation = investment.currentOperation;
                  const planData = investments.find(inv => inv.id === investment.investmentId);
                  const dailyPercentage24h = planData?.dailyRate || investment.dailyRate;
                  
                  // Calcular tempo desde último claim (6 horas = 21600000 ms)
                  const lastClaimTime = localStorage.getItem(`lastClaim_${investment.id}`);
                  const now = Date.now();
                  const sixHoursInMs = 6 * 60 * 60 * 1000;
                  const canClaim = !lastClaimTime || (now - parseInt(lastClaimTime)) >= sixHoursInMs;
                  const nextClaimTime = lastClaimTime ? new Date(parseInt(lastClaimTime) + sixHoursInMs) : new Date();
                  
                  const handleClaimReward = () => {
                    if (!canClaim) return;
                    
                    // Abrir simulador de trading
                    setSelectedInvestmentForTrading(investment);
                    setIsTradingSimulatorOpen(true);
                  };


                  return (
                     <Card key={investment.id} className="bg-gradient-to-br from-card to-card/80 border-border hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                       {/* Background Effect */}
                       <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-trading-green/5 opacity-50" />
                       <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-trading-green/20 to-transparent rounded-full blur-2xl" />
                       
                       <CardContent className="p-4 space-y-4 relative z-10">
                         {/* Header com Badge */}
                         <div className="text-center space-y-2">
                           <div className="flex items-center justify-center gap-2">
                             <Badge className="bg-primary/20 text-primary border-primary/30">
                               <Bot className="h-3 w-3 mr-1" />
                               {planData?.name || `Bot ${investment.dailyRate}%`}
                             </Badge>
                           </div>
                           <div className="text-sm text-muted-foreground">
                             <Calendar className="h-3 w-3 inline mr-1" />
                             Contrato: {planData?.duration || investment.daysRemaining} dias
                           </div>
                         </div>

                         {/* Valor Investido e Status */}
                         <div className="grid grid-cols-2 gap-3">
                           <div className="bg-card/80 rounded-lg p-3 text-center">
                             <div className="text-xs text-muted-foreground">Investido</div>
                             <div className="text-lg font-bold text-primary">${investment.amount}</div>
                           </div>
                           <div className="bg-card/80 rounded-lg p-3 text-center">
                             <div className="text-xs text-muted-foreground">Taxa</div>
                             <div className="text-lg font-bold text-trading-green">{dailyPercentage24h}%/dia</div>
                           </div>
                         </div>

                         {/* Rendimento 6h */}
                         <div className="text-center bg-gradient-to-r from-trading-green/10 to-primary/10 rounded-lg p-4 border border-trading-green/20">
                           <div className="flex items-center justify-center gap-2 mb-2">
                             <Sparkles className="h-4 w-4 text-trading-green" />
                             <div className="text-sm font-medium text-foreground">Próximo Rendimento (6h)</div>
                           </div>
                           <div className="text-3xl font-bold text-trading-green mb-1">
                             +{(dailyPercentage24h / 4).toFixed(2)}%
                           </div>
                           <div className="text-lg font-semibold text-foreground">
                             ${(investment.amount * (dailyPercentage24h / 100) / 4).toFixed(2)}
                           </div>
                         </div>

                         {/* Botão de Claim Melhorado */}
                         <div className="text-center">
                           <Button 
                             onClick={handleClaimReward}
                             disabled={!canClaim}
                             className={`w-full py-3 text-base font-semibold transition-all duration-300 ${
                               canClaim 
                                 ? 'bg-gradient-to-r from-trading-green to-green-600 hover:from-trading-green/90 hover:to-green-600/90 shadow-lg hover:shadow-xl text-white' 
                                 : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                             }`}
                           >
                             {canClaim ? (
                               <>
                                 <BarChart3 className="h-5 w-5 mr-2" />
                                 Executar Trading & Receber
                               </>
                             ) : (
                               <>
                                 <Timer className="h-4 w-4 mr-2" />
                                 Próximo em {Math.ceil((nextClaimTime.getTime() - now) / (1000 * 60))}min
                               </>
                             )}
                           </Button>
                         </div>

                       </CardContent>
                     </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Você ainda não possui investimentos</p>
                <p className="text-sm text-muted-foreground mt-2">Escolha um plano acima para começar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Modal */}
        <Dialog open={isInvestModalOpen} onOpenChange={setIsInvestModalOpen}>
          <DialogContent className="max-w-sm sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Realizar Investimento</DialogTitle>
            </DialogHeader>
            {selectedInvestment && (
              <div className="space-y-4">
                <div className="p-3 sm:p-4 bg-secondary rounded-lg">
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">{selectedInvestment.name}</h3>
                  <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                    <p>Taxa diária: {selectedInvestment.dailyRate}%</p>
                    <p>Duração: {selectedInvestment.duration} dias</p>
                    <p>Limite: ${selectedInvestment.minimumAmount.toLocaleString()} - ${selectedInvestment.maximumAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm">Valor do Investimento</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Digite o valor"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    min={selectedInvestment.minimumAmount}
                    max={selectedInvestment.maximumAmount}
                    className="text-base" // Better touch target on mobile
                  />
                  <p className="text-xs text-muted-foreground">
                    Saldo disponível: ${userBalance.toLocaleString()}
                  </p>
                </div>

                {investmentAmount && parseFloat(investmentAmount) >= selectedInvestment.minimumAmount && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">Projeção de ganhos:</p>
                      <p className="font-medium">
                        Ganho diário: ${(parseFloat(investmentAmount) * selectedInvestment.dailyRate / 100).toFixed(2)}
                      </p>
                      <p className="font-medium">
                        Total estimado: ${(parseFloat(investmentAmount) * selectedInvestment.dailyRate / 100 * selectedInvestment.duration).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsInvestModalOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleInvest} 
                    disabled={!investmentAmount}
                    className="w-full sm:w-auto"
                  >
                    Confirmar Investimento
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Trading Simulator */}
        {selectedInvestmentForTrading && (
          <TradingSimulator
            isOpen={isTradingSimulatorOpen}
            onClose={() => {
              setIsTradingSimulatorOpen(false);
              setSelectedInvestmentForTrading(null);
            }}
            investmentAmount={selectedInvestmentForTrading.amount}
            dailyRate={selectedInvestmentForTrading.dailyRate}
            planName={selectedInvestmentForTrading.investmentName}
            totalActiveOperations={getTotalActiveOperations()}
            onComplete={handleTradingComplete}
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default Investments;