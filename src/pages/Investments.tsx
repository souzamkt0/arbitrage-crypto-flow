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
  ArrowDown
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
  duration: number;
  description: string;
  status: "active" | "inactive";
  operations?: number;
  requiredReferrals?: number;
  contractFee?: number;
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
  currentDayProgress: number;
  todayEarnings: number;
  dailyTarget: number;
  currentOperation?: {
    pair: string;
    buyPrice: number;
    sellPrice?: number;
    profit?: number;
    status: "active" | "completed";
  };
  operationsCompleted: number;
  dailyOperations: number;
  lastOperationTime?: string;
  canOperate: boolean;
  nextOperationIn?: number;
}

const Investments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showActivePlans, setShowActivePlans] = useState(false);
  const [activeTab, setActiveTab] = useState<'investments' | 'history'>('investments');
  const [userReferrals, setUserReferrals] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchInvestments();
      fetchUserInvestments();
      fetchUserReferrals();
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

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6 max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header responsivo */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Investimentos Ativos</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gerencie seus planos de investimento e operações de trading
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={() => setActiveTab('history')}
              variant={activeTab === 'history' ? 'default' : 'outline'}
              className="flex-1 sm:flex-none"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Histórico
            </Button>
            <Button
              onClick={() => setActiveTab('investments')}
              variant={activeTab === 'investments' ? 'default' : 'outline'}  
              className="flex-1 sm:flex-none"
            >
              <Activity className="w-4 h-4 mr-2" />
              Investimentos Ativos
            </Button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'investments' ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Investimentos Ativos - Mostrar apenas os planos ativos */}
            {userInvestments.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {userInvestments.map((investment) => (
                    <Card key={investment.id} className="bg-card border-border">
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <CardTitle className="text-base sm:text-lg">{investment.investmentName}</CardTitle>
                          <Badge variant="default">{investment.status}</Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <div className="text-xs sm:text-sm text-muted-foreground">Valor Investido</div>
                            <div className="font-bold text-sm sm:text-base">{formatCurrency(investment.amount)}</div>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-muted-foreground">Total Ganho</div>
                            <div className="font-bold text-sm sm:text-base text-green-500">{formatCurrency(investment.totalEarned)}</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs sm:text-sm mb-2">
                            <span>Progresso do Dia</span>
                            <span>{investment.currentDayProgress.toFixed(1)}%</span>
                          </div>
                          <Progress value={investment.currentDayProgress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <div className="text-muted-foreground">Dias Restantes</div>
                            <div className="font-semibold">{investment.daysRemaining}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Ganho Hoje</div>
                            <div className="font-semibold text-green-500">{formatCurrency(investment.todayEarnings)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-8 bg-muted/50 border border-border rounded-xl inline-block">
                  <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-xl font-medium mb-2">Nenhum investimento ativo encontrado</p>
                  <p className="text-muted-foreground mb-4">Você ainda não possui investimentos ativos</p>
                  <Button onClick={() => navigate('/investments')} className="bg-primary text-primary-foreground font-semibold">
                    <PiggyBank className="h-4 w-4 mr-2" /> Ver Planos de Investimento
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <TradingHistory />
          </div>
        )}
      </div>
    </div>
  );
};

export default Investments;