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

  useEffect(() => {
    if (user) {
      fetchInvestments();
      fetchUserInvestments();
    }
  }, [user]);

  const fetchInvestments = async () => {
    try {
      const { data: plansData, error: plansError } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('is_active', true)
        .order('minimum_amount');

      if (plansError) throw plansError;

      const formattedPlans: Investment[] = plansData.map(plan => ({
        id: plan.id,
        name: plan.name,
        dailyRate: plan.daily_rate,
        minimumAmount: plan.minimum_amount,
        maximumAmount: plan.maximum_amount || 999999,
        duration: plan.duration_days,
        description: plan.description || '',
        status: plan.is_active ? "active" : "inactive",
        operations: plan.daily_operations || 1,
        requiredReferrals: plan.required_referrals || 0,
        contractFee: plan.contract_fee || 0
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
          investmentName: investment.plan_name,
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
          dailyOperations: investment.daily_operations || 1,
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

  const activeInvestments = userInvestments.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
            Sistema de Investimentos
          </h1>
          <p className="text-gray-300">
            Gerencie seus investimentos e acompanhe os resultados
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button
            onClick={() => setActiveTab('investments')}
            variant={activeTab === 'investments' ? 'default' : 'outline'}
            className={activeTab === 'investments' ? 
              'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 
              'border-gray-600 text-gray-300 hover:text-white'}
          >
            <PiggyBank className="h-4 w-4 mr-2" />
            Investimentos
          </Button>
          <Button
            onClick={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'default' : 'outline'}
            className={activeTab === 'history' ? 
              'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 
              'border-gray-600 text-gray-300 hover:text-white'}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Histórico
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'history' ? (
          <div className="space-y-6">
            <TradingHistory />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Plans Box */}
            {activeInvestments > 0 && (
              <Card className="bg-gradient-to-r from-emerald-900/50 to-green-800/50 border-emerald-500/30">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-emerald-300">
                          TRADING ATIVO
                        </h3>
                        <div className="text-sm text-emerald-200/80">
                          {activeInvestments} plano{activeInvestments > 1 ? 's' : ''} ativo{activeInvestments > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setShowActivePlans(!showActivePlans)}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold px-8 py-3 rounded-xl"
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      {showActivePlans ? 'Ver Planos Disponíveis' : 'Acessar Dashboard'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Plans Display */}
            {showActivePlans ? (
              <div className="space-y-6">
                {userInvestments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userInvestments.map((investment) => (
                      <Card key={investment.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-white flex items-center justify-between">
                            <span>{investment.investmentName}</span>
                            <Badge variant="secondary" className="bg-green-600 text-white">
                              Ativo
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Investido</p>
                              <p className="font-bold text-white">{formatCurrency(investment.amount)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Total Ganho</p>
                              <p className="font-bold text-green-400">{formatCurrency(investment.totalEarned)}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Progresso do Dia</span>
                              <span className="text-white">{investment.currentDayProgress.toFixed(1)}%</span>
                            </div>
                            <Progress 
                              value={investment.currentDayProgress} 
                              className="h-2 bg-gray-700"
                            />
                          </div>

                          <Button
                            onClick={() => {
                              setSelectedInvestmentForTrading(investment);
                              setShowTradingDialog(true);
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Executar Operação
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PiggyBank className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400">Nenhum investimento ativo</h3>
                    <p className="text-gray-500">Escolha um plano abaixo para começar</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Planos de Investimento</h2>
                  <p className="text-gray-400">Escolha o plano ideal para seus objetivos</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {investments.map((investment) => (
                    <Card key={investment.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>{investment.name}</span>
                          <Badge variant="secondary" className="bg-blue-600 text-white">
                            {investment.dailyRate}% ao dia
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Mínimo:</span>
                            <span className="text-white">{formatCurrency(investment.minimumAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Máximo:</span>
                            <span className="text-white">{formatCurrency(investment.maximumAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Duração:</span>
                            <span className="text-white">{investment.duration} dias</span>
                          </div>
                          {investment.operations && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Operações/dia:</span>
                              <span className="text-white">{investment.operations}</span>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => setSelectedPlan(investment)}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Investir Agora
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Investment Dialog */}
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                Investir em {selectedPlan?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-white">Valor do Investimento</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={`Mínimo: ${formatCurrency(selectedPlan?.minimumAmount || 0)}`}
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2 p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-white">Resumo do Investimento:</h4>
                <div className="text-sm text-gray-300">
                  <p>Taxa diária: {selectedPlan?.dailyRate}%</p>
                  <p>Duração: {selectedPlan?.duration} dias</p>
                  <p>Retorno total estimado: {selectedPlan ? (parseFloat(selectedAmount || "0") * (1 + selectedPlan.dailyRate / 100) ** selectedPlan.duration).toFixed(2) : "0"}</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  // Handle investment logic here
                  toast({
                    title: "Investimento Realizado",
                    description: "Seu investimento foi processado com sucesso!",
                  });
                  setSelectedPlan(null);
                  setSelectedAmount("");
                }}
                disabled={isLoading || !selectedAmount || parseFloat(selectedAmount) < (selectedPlan?.minimumAmount || 0)}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
              >
                {isLoading ? 'Processando...' : 'Confirmar Investimento'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Trading Dialog */}
        <Dialog open={showTradingDialog} onOpenChange={setShowTradingDialog}>
          <DialogContent className="max-w-4xl bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                Trading - {selectedInvestmentForTrading?.investmentName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center p-8">
                <Bot className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white">Sistema de Trading</h3>
                <p className="text-gray-400">Execute operações de arbitragem para gerar lucros</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Investments;
