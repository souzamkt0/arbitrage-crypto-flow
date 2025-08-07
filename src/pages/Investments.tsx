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
  Zap
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
  const { toast } = useToast();
  const { user } = useAuth();

  const cryptoPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "SOL/USDT", "XRP/USDT", "DOGE/USDT", "MATIC/USDT"];

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
          .order('created_at', { ascending: false });

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

  const handleInvest = () => {
    if (!selectedInvestment || !investmentAmount) return;

    const amount = parseFloat(investmentAmount);
    
    console.log('Validando investimento:', {
      investmentName: selectedInvestment.name,
      referralCount: referralCount,
      amount: amount
    });

    // Verificar se tem referrals suficientes para o robô 4.0.5 (precisa de 10 referrals usando 4.0.0)
    if (selectedInvestment.name === "Robô 4.0.5" && referralCount < 10) {
      console.log('Bloqueando investimento 4.0.5 - referrals insuficientes');
      toast({
        title: "Referrals insuficientes",
        description: `Para investir no Robô 4.0.5, você precisa ter 10 referrals usando o Robô 4.0.0. Você tem ${referralCount} referrals.`,
        variant: "destructive"
      });
      return;
    }

    // Verificar se tem referrals suficientes para o robô 4.1.0 (precisa de 20 referrals usando 4.0.5)  
    if (selectedInvestment.name === "Robô 4.1.0" && referralCount < 20) {
      console.log('Bloqueando investimento 4.1.0 - referrals insuficientes');
      toast({
        title: "Referrals insuficientes", 
        description: `Para investir no Robô 4.1.0, você precisa ter 20 referrals usando o Robô 4.0.5. Você tem ${referralCount} referrals.`,
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
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="w-full lg:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-primary" />
              <span className="truncate">Alphabot - Investimentos</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
              Bots de negociação em pares crypto com rendimento automático
            </p>
          </div>
          
          <div className="text-left lg:text-right w-full lg:w-auto flex flex-col lg:items-end">
            <div className="text-sm sm:text-lg font-semibold text-foreground">Saldo Disponível</div>
            <div className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
              ${userBalance.toLocaleString()}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="h-6 w-6 p-0"
                title="Atualizar saldo"
              >
                <Activity className="h-4 w-4" />
              </Button>
            </div>
            {userBalance === 0 && (
              <p className="text-xs text-destructive mt-1">
                Adicione saldo através do painel administrativo
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Referrals ativos: {referralCount}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Investido
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">
                ${totalInvested.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Em {activeInvestments} investimentos ativos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Ganhos Totais
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-trading-green" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-trading-green">
                +${totalEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Rendimento acumulado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Investimentos Ativos
              </CardTitle>
              <Target className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-warning">
                {activeInvestments}
              </div>
              <p className="text-xs text-muted-foreground">
                Planos em andamento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Robôs de IA - Tabelas de Investimento */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Gráfico de receita de IA por versão</h2>
            <p className="text-muted-foreground">Escolha o robô e período de investimento ideal para você</p>
          </div>

          {/* Robô 4.0.0 */}
          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-card-foreground">
                Robô 4.0.0 (nenhuma recomendação necessária)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-foreground">Investir</th>
                      <th className="text-center p-2 text-foreground">Quantificar frequência</th>
                      <th className="text-center p-2 text-foreground">Taxa de juros diária</th>
                      <th className="text-center p-2 text-foreground">1 dia</th>
                      <th className="text-center p-2 text-foreground">7 dias</th>
                      <th className="text-center p-2 text-foreground">15 dias</th>
                      <th className="text-center p-2 text-foreground">30 dias</th>
                      <th className="text-center p-2 text-foreground">40 dias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { amount: 10, freq: 2, rate: 2.5, returns: [0.25, 1.75, 3.75, 7.50, 10.00] },
                      { amount: 20, freq: 2, rate: 2.5, returns: [0.50, 3.50, 7.50, 15.00, 20.00] },
                      { amount: 30, freq: 2, rate: 2.5, returns: [0.75, 5.25, 11.25, 22.50, 30.00] },
                      { amount: 40, freq: 2, rate: 2.5, returns: [1.00, 7.00, 15.00, 30.00, 40.00] },
                      { amount: 50, freq: 2, rate: 2.5, returns: [1.25, 8.75, 18.75, 37.50, 50.00] },
                      { amount: 60, freq: 2, rate: 2.5, returns: [1.50, 10.50, 22.50, 45.00, 60.00] },
                      { amount: 70, freq: 2, rate: 2.5, returns: [1.75, 12.25, 26.25, 52.50, 70.00] },
                      { amount: 80, freq: 2, rate: 2.5, returns: [2.00, 14.00, 30.00, 60.00, 80.00] },
                      { amount: 90, freq: 2, rate: 2.5, returns: [2.25, 15.75, 33.75, 67.50, 90.00] },
                      { amount: 100, freq: 2, rate: 2.5, returns: [2.50, 17.50, 37.50, 75.00, 100.00] }
                    ].map((plan, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-2 font-medium text-foreground">${plan.amount}</td>
                        <td className="p-2 text-center text-muted-foreground">{plan.freq}</td>
                        <td className="p-2 text-center text-trading-green font-medium">{plan.rate}%</td>
                        {plan.returns.map((ret, i) => (
                          <td key={i} className="p-2 text-center text-muted-foreground">${ret.toFixed(2)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Button 
                  onClick={() => openInvestModal(investments[0])}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Investir no Robô 4.0.0
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Robô 4.0.5 */}
          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-card-foreground">
                Robôs 4.0.5 (Mínimo 10 USDT para 10 indicações, assine o contrato)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-foreground">Investir</th>
                      <th className="text-center p-2 text-foreground">Quantificar frequência</th>
                      <th className="text-center p-2 text-foreground">Taxa de juros diária</th>
                      <th className="text-center p-2 text-foreground">1 dia</th>
                      <th className="text-center p-2 text-foreground">7 dias</th>
                      <th className="text-center p-2 text-foreground">15 dias</th>
                      <th className="text-center p-2 text-foreground">30 dias</th>
                      <th className="text-center p-2 text-foreground">40 dias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { amount: 20, freq: 3, rate: 3.0, returns: [0.60, 4.20, 9.00, 18.00, 24.00] },
                      { amount: 40, freq: 3, rate: 3.0, returns: [1.20, 8.40, 18.00, 36.00, 48.00] },
                      { amount: 60, freq: 3, rate: 3.0, returns: [1.80, 12.60, 27.00, 54.00, 72.00] },
                      { amount: 80, freq: 3, rate: 3.0, returns: [2.40, 16.80, 36.00, 72.00, 96.00] },
                      { amount: 100, freq: 3, rate: 3.0, returns: [3.00, 21.00, 45.00, 90.00, 120.00] },
                      { amount: 120, freq: 3, rate: 3.0, returns: [3.60, 25.20, 54.00, 108.00, 144.00] },
                      { amount: 140, freq: 3, rate: 3.0, returns: [4.20, 29.40, 63.00, 126.00, 168.00] },
                      { amount: 160, freq: 3, rate: 3.0, returns: [4.80, 33.60, 72.00, 144.00, 192.00] },
                      { amount: 180, freq: 3, rate: 3.0, returns: [5.40, 37.80, 81.00, 162.00, 216.00] },
                      { amount: 200, freq: 3, rate: 3.0, returns: [6.00, 42.00, 90.00, 180.00, 240.00] }
                    ].map((plan, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-2 font-medium text-foreground">${plan.amount}</td>
                        <td className="p-2 text-center text-muted-foreground">{plan.freq}</td>
                        <td className="p-2 text-center text-trading-green font-medium">{plan.rate}%</td>
                        {plan.returns.map((ret, i) => (
                          <td key={i} className="p-2 text-center text-muted-foreground">${ret.toFixed(2)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Button 
                  onClick={() => openInvestModal(investments[1] || investments[0])}
                  className="bg-warning text-warning-foreground hover:bg-warning/90"
                >
                  Investir no Robô 4.0.5
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Robô 4.1.0 */}
          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-card-foreground">
                Robôs 4.1.0 (Mínimo 10 USDT para 20 indicações, assine o contrato)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-foreground">Investir</th>
                      <th className="text-center p-2 text-foreground">Quantificar frequência</th>
                      <th className="text-center p-2 text-foreground">Taxa de juros diária</th>
                      <th className="text-center p-2 text-foreground">1 dia</th>
                      <th className="text-center p-2 text-foreground">7 dias</th>
                      <th className="text-center p-2 text-foreground">15 dias</th>
                      <th className="text-center p-2 text-foreground">30 dias</th>
                      <th className="text-center p-2 text-foreground">40 dias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { amount: 500, freq: 4, rate: 4.0, returns: [20.00, 140.00, 300.00, 600.00, 800.00] },
                      { amount: 1000, freq: 4, rate: 4.0, returns: [40.00, 280.00, 600.00, 1200.00, 1600.00] },
                      { amount: 1500, freq: 4, rate: 4.0, returns: [60.00, 420.00, 900.00, 1800.00, 2400.00] },
                      { amount: 2000, freq: 4, rate: 4.0, returns: [80.00, 560.00, 1200.00, 2400.00, 3200.00] },
                      { amount: 2500, freq: 4, rate: 4.0, returns: [100.00, 700.00, 1500.00, 3000.00, 4000.00] },
                      { amount: 3000, freq: 4, rate: 4.0, returns: [120.00, 840.00, 1800.00, 3600.00, 4800.00] },
                      { amount: 3500, freq: 4, rate: 4.0, returns: [140.00, 980.00, 2100.00, 4200.00, 5600.00] },
                      { amount: 4000, freq: 4, rate: 4.0, returns: [160.00, 1120.00, 2400.00, 4800.00, 6400.00] },
                      { amount: 4500, freq: 4, rate: 4.0, returns: [180.00, 1260.00, 2700.00, 5400.00, 7200.00] },
                      { amount: 5000, freq: 4, rate: 4.0, returns: [200.00, 1400.00, 3000.00, 6000.00, 8000.00] }
                    ].map((plan, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-2 font-medium text-foreground">${plan.amount}</td>
                        <td className="p-2 text-center text-muted-foreground">{plan.freq}</td>
                        <td className="p-2 text-center text-trading-green font-medium">{plan.rate}%</td>
                        {plan.returns.map((ret, i) => (
                          <td key={i} className="p-2 text-center text-muted-foreground">${ret.toLocaleString()}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Button 
                  onClick={() => openInvestModal(investments[2] || investments[0])}
                  className="bg-trading-green text-white hover:bg-trading-green/90"
                >
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
                  
                  const handleClaimReward = async () => {
                    if (!canClaim) return;
                    
                    const rewardAmount = (investment.amount * (dailyPercentage24h / 100)) / 4; // Divide por 4 (4 claims por dia)
                    
                    try {
                      // Simular trading por 3 segundos
                      toast({
                        title: "Simulando Trading...",
                        description: "Executando operações de arbitragem",
                      });
                      
                      // Atualizar saldo do usuário
                      const { error } = await supabase
                        .from('profiles')
                        .update({ 
                          balance: userBalance + rewardAmount,
                          total_profit: userBalance + rewardAmount
                        })
                        .eq('user_id', user?.id);
                        
                      if (error) throw error;
                      
                      // Salvar último claim
                      localStorage.setItem(`lastClaim_${investment.id}`, now.toString());
                      
                      // Atualizar estado local
                      setUserBalance(prev => prev + rewardAmount);
                      
                      setTimeout(() => {
                        toast({
                          title: "Rendimento Recebido!",
                          description: `+$${rewardAmount.toFixed(2)} adicionado ao seu saldo`,
                          variant: "default"
                        });
                      }, 3000);
                      
                    } catch (error) {
                      console.error('Erro ao processar rendimento:', error);
                      toast({
                        title: "Erro",
                        description: "Erro ao processar rendimento",
                        variant: "destructive"
                      });
                    }
                  };

                  return (
                    <Card key={investment.id} className="bg-muted/30 border-border">
                      <CardContent className="p-4 space-y-4">
                        {/* Nome do Plano e Tempo de Contrato */}
                        <div className="text-center space-y-1">
                          <div className="text-lg font-bold text-foreground">
                            {planData?.name || `Plano ${investment.dailyRate}%`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Contrato: {planData?.duration || investment.daysRemaining} dias
                          </div>
                        </div>

                        {/* Percentual 24h */}
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Rendimento nas próximas 6h</div>
                          <div className="text-2xl font-bold text-trading-green">
                            +{(dailyPercentage24h / 4).toFixed(2)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ≈ ${(investment.amount * (dailyPercentage24h / 100) / 4).toFixed(2)}
                          </div>
                        </div>

                        {/* Botão de Claim */}
                        <div className="text-center">
                          <Button 
                            onClick={handleClaimReward}
                            disabled={!canClaim}
                            className={`w-full ${canClaim ? 'bg-trading-green hover:bg-trading-green/90' : 'bg-muted'}`}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            {canClaim ? 'Receber Rendimento' : `Próximo em ${Math.ceil((nextClaimTime.getTime() - now) / (1000 * 60))}min`}
                          </Button>
                        </div>

                        {/* Simulador de Trading */}
                        <div className="bg-card/50 rounded-lg p-3 space-y-3">
                          <div className="text-center">
                            <div className="text-sm font-medium text-foreground">Simulador de Trading</div>
                            <div className="text-xs text-muted-foreground">Par: {currentOperation?.pair || "BTC/USDT"}</div>
                          </div>
                          
                          {/* Preços de Compra e Venda */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-trading-red/10 rounded p-2 text-center">
                              <div className="text-xs text-muted-foreground">Compra</div>
                              <div className="text-sm font-bold text-trading-red">
                                ${currentOperation?.buyPrice.toFixed(2) || (45000 + Math.random() * 1000).toFixed(2)}
                              </div>
                            </div>
                            <div className="bg-trading-green/10 rounded p-2 text-center">
                              <div className="text-xs text-muted-foreground">Venda</div>
                              <div className="text-sm font-bold text-trading-green">
                                ${currentOperation?.sellPrice.toFixed(2) || (45500 + Math.random() * 1000).toFixed(2)}
                              </div>
                            </div>
                          </div>

                          {/* Lucro Estimado */}
                          <div className="text-center bg-trading-green/10 rounded p-2">
                            <div className="text-xs text-muted-foreground">Lucro Estimado</div>
                            <div className="text-lg font-bold text-trading-green">
                              +${currentOperation?.profit.toFixed(2) || (investment.amount * 0.02).toFixed(2)}
                            </div>
                          </div>

                          {/* Progress Bar da Operação */}
                          {currentOperation && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Operação em andamento...</span>
                                <span className="font-medium">{currentOperation.timeRemaining}s</span>
                              </div>
                              <Progress value={currentOperation.progress} className="h-2" />
                            </div>
                          )}
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
      </div>
    </div>
  );
};

export default Investments;