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
  BarChart3,
  CreditCard,
  Wallet,
  ChevronRight,
  Shield,
  TrendingDown
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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Binance-style Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, hsl(var(--trading-green)) 0%, transparent 50%),
                           radial-gradient(circle at 40% 80%, hsl(var(--warning)) 0%, transparent 50%)`
        }} />
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)/0.1) 1px, transparent 1px),
                         linear-gradient(90deg, hsl(var(--primary)/0.1) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }} />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Binance-style Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-trading-green/20 rounded-full flex items-center justify-center border-2 border-primary/30">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Investimentos
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trading automatizado com tecnologia de ponta para maximizar seus rendimentos
          </p>
        </div>

        {/* Deposit Options - Binance Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* DigitoPay Deposit */}
          <Card className="bg-gradient-to-br from-card to-card/90 border-primary/30 hover:shadow-xl hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate('/deposit')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Depósito PIX</h3>
                    <p className="text-sm text-muted-foreground">DigitoPay • Instantâneo</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa</span>
                  <span className="text-trading-green font-medium">0%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tempo</span>
                  <span className="text-foreground font-medium">1-5 minutos</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Método</span>
                  <span className="text-foreground font-medium">PIX • QR Code</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Seguro e Confiável</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BEP20 USDT Deposit */}
          <Card className="bg-gradient-to-br from-card to-card/90 border-warning/30 hover:shadow-xl hover:border-warning/50 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate('/deposit')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                    <Wallet className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Depósito USDT</h3>
                    <p className="text-sm text-muted-foreground">BEP20 • Blockchain</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-warning transition-colors" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa</span>
                  <span className="text-trading-green font-medium">0%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tempo</span>
                  <span className="text-foreground font-medium">5-15 minutos</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rede</span>
                  <span className="text-foreground font-medium">BSC (BEP20)</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-warning/5 rounded-lg border border-warning/20">
                <div className="flex items-center gap-2 text-sm text-warning">
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-medium">Taxas Baixas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Balance and Stats Cards - Binance Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-card to-card/90 border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Investido
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${totalInvested.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeInvestments} investimentos ativos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/90 border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Ganhos Totais
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-trading-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-trading-green">
                +${totalEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Rendimento acumulado
              </p>
            </CardContent>
          </Card>

        {/* Investment Plans Section - Binance Style */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Planos de Trading
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para maximizar seus rendimentos com trading automatizado
            </p>
          </div>

          {/* Robô 4.0.0 - Binance Style */}
          <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">Robô 4.0.0</CardTitle>
                    <p className="text-sm text-muted-foreground">Plano Iniciante</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Sem Requisitos
                </Badge>
              </div>
            </CardHeader>
              
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Taxa Diária</div>
                  <div className="text-lg font-bold text-trading-green">2.5%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Operações</div>
                  <div className="text-lg font-bold text-primary">2x/dia</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Duração</div>
                  <div className="text-lg font-bold text-warning">40 dias</div>
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
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Investir Agora
                </Button>
              </div>
              </CardContent>
            </Card>

          {/* Robô 4.0.5 - Binance Style */}
          <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">Robô 4.0.5</CardTitle>
                    <p className="text-sm text-muted-foreground">Plano Intermediário</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                  10 Referrals
                </Badge>
              </div>
            </CardHeader>
              
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Taxa Diária</div>
                  <div className="text-lg font-bold text-trading-green">3.0%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Operações</div>
                  <div className="text-lg font-bold text-warning">3x/dia</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Duração</div>
                  <div className="text-lg font-bold text-primary">40 dias</div>
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
                  className="w-full sm:w-auto bg-warning hover:bg-warning/90 text-warning-foreground px-8 py-3 text-base font-medium transition-colors"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Investir Agora
                </Button>
              </div>
              </CardContent>
            </Card>

          {/* Robô 4.1.0 - Binance Style */}
          <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-trading-green/10 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-trading-green" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">Robô 4.1.0</CardTitle>
                    <p className="text-sm text-muted-foreground">Plano Premium</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-trading-green/10 text-trading-green border-trading-green/20">
                  20 Referrals
                </Badge>
              </div>
            </CardHeader>
              
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Taxa Diária</div>
                  <div className="text-lg font-bold text-trading-green">4.0%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Operações</div>
                  <div className="text-lg font-bold text-trading-green">4x/dia</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Duração</div>
                  <div className="text-lg font-bold text-primary">40 dias</div>
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
                  className="w-full sm:w-auto bg-trading-green hover:bg-trading-green/90 text-white px-8 py-3 text-base font-medium transition-colors"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Investir Agora
                </Button>
              </div>
              </CardContent>
            </Card>
        </div>

        {/* Robô 4.0.5 - Binance Style */}
        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-xl text-foreground">Robô 4.0.5</CardTitle>
                  <p className="text-sm text-muted-foreground">Plano Intermediário</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                10 Referrals
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Taxa Diária</div>
                <div className="text-lg font-bold text-trading-green">3.0%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Operações</div>
                <div className="text-lg font-bold text-warning">3x/dia</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Duração</div>
                <div className="text-lg font-bold text-primary">40 dias</div>
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
                className="w-full sm:w-auto bg-warning hover:bg-warning/90 text-warning-foreground px-8 py-3 text-base font-medium transition-colors"
              >
                <Zap className="h-4 w-4 mr-2" />
                Investir Agora
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Robô 4.1.0 - Binance Style */}
        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-trading-green/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-trading-green" />
                </div>
                <div>
                  <CardTitle className="text-xl text-foreground">Robô 4.1.0</CardTitle>
                  <p className="text-sm text-muted-foreground">Plano Premium</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-trading-green/10 text-trading-green border-trading-green/20">
                20 Referrals
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Taxa Diária</div>
                <div className="text-lg font-bold text-trading-green">4.0%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Operações</div>
                <div className="text-lg font-bold text-trading-green">4x/dia</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Duração</div>
                <div className="text-lg font-bold text-primary">40 dias</div>
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
                  ].map((plan, index) => (
                    <tr key={index} className="border-b border-border/30 hover:bg-trading-green/5 transition-colors">
                      <td className="p-3 font-bold text-trading-green">${plan.amount}</td>
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
                onClick={() => openInvestModal(investments[2] || investments[0])}
                className="w-full sm:w-auto bg-trading-green hover:bg-trading-green/90 text-white px-8 py-3 text-base font-medium transition-colors"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Investir Agora
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
            <div className="space-y-4">
              <p className="text-muted-foreground">Aqui serão exibidos seus investimentos ativos.</p>
            </div>
          ) : (
            <div className="text-center py-8">
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
                  <p>Valor mínimo: ${selectedInvestment.minimumAmount}</p>
                  <p>Valor máximo: ${selectedInvestment.maximumAmount}</p>
                  <p>Duração: {selectedInvestment.duration} dias</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="amount" className="text-sm sm:text-base">Valor do Investimento ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder={`Mínimo: $${selectedInvestment.minimumAmount}`}
                  className="mt-1"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
  );
};

export default Investments;
