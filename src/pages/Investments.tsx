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
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    const defaultPlans: Investment[] = [
      {
        id: "1",
        name: "Alphabot Básico",
        dailyRate: 0.3,
        minimumAmount: 100,
        maximumAmount: 1000,
        duration: 30,
        description: "Bot básico para iniciantes. Operações simples com baixo risco.",
        status: "active"
      },
      {
        id: "2",
        name: "Alphabot Intermediário",
        dailyRate: 0.5,
        minimumAmount: 500,
        maximumAmount: 5000,
        duration: 45,
        description: "Bot intermediário com estratégias moderadas de arbitragem.",
        status: "active"
      },
      {
        id: "3",
        name: "Alphabot Avançado",
        dailyRate: 1.0,
        minimumAmount: 1000,
        maximumAmount: 10000,
        duration: 60,
        description: "Bot avançado com múltiplas estratégias de trading.",
        status: "active"
      },
      {
        id: "4",
        name: "Alphabot Premium",
        dailyRate: 1.6,
        minimumAmount: 5000,
        maximumAmount: 25000,
        duration: 75,
        description: "Bot premium com algoritmos otimizados para máximo retorno.",
        status: "active"
      },
      {
        id: "5",
        name: "Alphabot VIP",
        dailyRate: 2.0,
        minimumAmount: 10000,
        maximumAmount: 100000,
        duration: 90,
        description: "Bot VIP com as melhores estratégias disponíveis.",
        status: "active"
      },
      {
        id: "6",
        name: "Robô 4.0",
        dailyRate: 2.5,
        minimumAmount: 10,
        maximumAmount: 100,
        duration: 40,
        description: "Robô de alta performance com 2,5% de retorno diário. Ideal para investimentos menores.",
        status: "active"
      }
    ];

    const savedPlans = localStorage.getItem("alphabit_investment_plans");
    if (savedPlans) {
      try {
        const parsedPlans = JSON.parse(savedPlans) as Investment[];
        setInvestments(parsedPlans);
      } catch (error) {
        console.error("Erro ao carregar planos salvos:", error);
        localStorage.setItem("alphabit_investment_plans", JSON.stringify(defaultPlans));
        setInvestments(defaultPlans);
      }
    } else {
      localStorage.setItem("alphabit_investment_plans", JSON.stringify(defaultPlans));
      setInvestments(defaultPlans);
    }

    loadUserData();
  }, [user]);

  // Escutar mudanças no localStorage (quando Admin alterar planos)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "alphabit_investment_plans" && e.newValue) {
        try {
          const updatedPlans = JSON.parse(e.newValue) as Investment[];
          setInvestments(updatedPlans);
        } catch (error) {
          console.error("Erro ao sincronizar planos:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
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
        description: "Você não possui saldo suficiente para este investimento",
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
          
          <div className="text-left lg:text-right w-full lg:w-auto">
            <div className="text-sm sm:text-lg font-semibold text-foreground">Saldo Disponível</div>
            <div className="text-xl sm:text-2xl font-bold text-primary">${userBalance.toLocaleString()}</div>
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

        {/* Available Investments */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Timer className="h-5 w-5 mr-2 text-primary" />
              Bots Alphabot Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {investments.filter(inv => inv.status === "active").map((investment, index) => {
                const pairs = ["ETH/USDT", "BTC/FDUSD", "BTC/USDT", "XRP/FDUSD", "XRP/USDC"];
                const indicators = [166, 16, 108, 0, 10];
                
                return (
                  <Card key={investment.id} className="bg-muted/30 border-border hover:bg-muted/50 transition-colors">
                    <CardContent className="p-3 sm:p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="text-base sm:text-lg font-bold text-foreground">{pairs[index] || "BTC/USDT"}</div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-muted-foreground">↗ {indicators[index] || 50}</span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => openInvestModal(investment)}
                          className="bg-warning text-warning-foreground hover:bg-warning/90 px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium"
                        >
                          Create
                        </Button>
                      </div>

                      {/* PNL - agora mostra nome do plano e valores min/max */}
                      <div>
                        <div className="text-xs text-muted-foreground truncate">{investment.name}</div>
                        <div className="text-lg sm:text-xl font-bold text-trading-green">
                          ${investment.minimumAmount.toLocaleString()} - ${investment.maximumAmount.toLocaleString()}
                        </div>
                      </div>

                      {/* Gráfico Animado */}
                      <div className="h-20 bg-transparent rounded-lg overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--trading-green))" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="hsl(var(--trading-green))" stopOpacity={0.1} />
                              </linearGradient>
                              <linearGradient id={`gradient-red-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['dataMin - 500', 'dataMax + 500']} hide />
                            
                            {/* Linha de Suporte */}
                            <ReferenceLine y={chartData[0]?.support} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeOpacity={0.7} />
                            
                            {/* Linha de Resistência */}
                            <ReferenceLine y={chartData[0]?.resistance} stroke="hsl(var(--trading-green))" strokeDasharray="3 3" strokeOpacity={0.7} />
                            
                            {/* Área Principal */}
                            <Area 
                              type="monotone" 
                              dataKey="price" 
                              stroke="hsl(var(--trading-green))" 
                              strokeWidth={2}
                              fill={`url(#gradient-${index})`}
                              animationDuration={2000}
                              className="animate-fade-in"
                            />
                            
                            {/* Linha vermelha para quedas */}
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="hsl(var(--destructive))" 
                              strokeWidth={1}
                              dot={false}
                              animationDuration={2000}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="text-muted-foreground">ROI</div>
                          <div className="font-semibold text-trading-green">{investment.dailyRate}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Tempo de execução</div>
                          <div className="font-semibold">3d 7h 34m</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Investimento mínimo</div>
                          <div className="font-semibold">{investment.minimumAmount}.74 USDT</div>
                        </div>
                      </div>

                      {/* Operations Stats */}
                      <div className="grid grid-cols-2 gap-4 text-xs border-t border-border pt-3">
                        <div>
                          <div className="text-muted-foreground">24H Total Matched Trades</div>
                          <div className="font-semibold">30/178</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">7D MDD</div>
                          <div className="font-semibold text-trading-red">1.15%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
                  
                  return (
                    <Card key={investment.id} className="bg-muted/30 border-border">
                      <CardContent className="p-3 sm:p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="text-base sm:text-lg font-bold text-foreground">{currentOperation?.pair || "BTC/USDT"}</div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-muted-foreground">↗ {investment.operationsCompleted}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">Trading up</Badge>
                        </div>

                        {/* PNL */}
                        <div>
                          <div className="text-xs text-muted-foreground">PNL (USD)</div>
                          <div className="text-lg sm:text-xl font-bold text-trading-green">${investment.totalEarned.toFixed(2)}</div>
                        </div>

                        {/* Gráfico dos Investimentos Ativos */}
                        <div className="h-20 bg-transparent rounded-lg overflow-hidden">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id={`invest-gradient-${investment.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                  <stop offset="50%" stopColor="hsl(var(--trading-green))" stopOpacity={0.6} />
                                  <stop offset="100%" stopColor="hsl(var(--trading-green))" stopOpacity={0.1} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="time" hide />
                              <YAxis domain={['dataMin - 200', 'dataMax + 200']} hide />
                              
                              {/* Linhas de suporte e resistência */}
                              <ReferenceLine y={chartData[0]?.support} stroke="hsl(var(--destructive))" strokeDasharray="2 2" strokeOpacity={0.5} />
                              <ReferenceLine y={chartData[0]?.resistance} stroke="hsl(var(--trading-green))" strokeDasharray="2 2" strokeOpacity={0.5} />
                              
                              {/* Área do gráfico */}
                              <Area 
                                type="monotone" 
                                dataKey="price" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={2}
                                fill={`url(#invest-gradient-${investment.id})`}
                                animationDuration={2000}
                                className="animate-fade-in"
                              />
                              
                              {/* Indicador de progresso da operação */}
                              <Line 
                                type="monotone" 
                                dataKey="volume" 
                                stroke="hsl(var(--warning))" 
                                strokeWidth={1}
                                strokeOpacity={currentOperation ? (currentOperation.progress / 100) : 0.3}
                                dot={false}
                                animationDuration={1000}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="text-muted-foreground">ROI</div>
                            <div className="font-semibold text-trading-green">{((investment.totalEarned / investment.amount) * 100).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Tempo de execução</div>
                            <div className="font-semibold">{investment.daysRemaining}d {Math.floor(Math.random() * 24)}h {Math.floor(Math.random() * 60)}m</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Investimento mínimo</div>
                            <div className="font-semibold">{investment.amount.toFixed(2)} USDT</div>
                          </div>
                        </div>

                        {/* Current Operation */}
                        {currentOperation && (
                          <div className="border-t border-border pt-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="text-xs text-muted-foreground">Operação Atual</div>
                              <div className="text-xs font-medium">{currentOperation.timeRemaining}s</div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Compra:</span>
                                <span className="font-medium text-trading-red">${currentOperation.buyPrice.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Venda:</span>
                                <span className="font-medium text-trading-green">${currentOperation.sellPrice.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Lucro:</span>
                                <span className="font-medium text-trading-green">+${currentOperation.profit.toFixed(2)}</span>
                              </div>
                            </div>
                            <Progress value={currentOperation.progress} className="h-2" />
                          </div>
                        )}

                        {/* Operations Stats */}
                        <div className="grid grid-cols-2 gap-4 text-xs border-t border-border pt-3">
                          <div>
                            <div className="text-muted-foreground">24H Total Matched Trades</div>
                            <div className="font-semibold">{investment.operationsCompleted}/{investment.totalOperations}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">7D MDD</div>
                            <div className="font-semibold text-trading-red">{(Math.random() * 2).toFixed(2)}%</div>
                          </div>
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