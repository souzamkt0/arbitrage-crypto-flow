import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw,
  MessageCircle,
  BarChart3,
  Users,
  CreditCard,
  Bot,
  Eye,
  ArrowUpDown,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface TradingRecord {
  id: string;
  timestamp: string;
  created_at?: string;
  pair: string;
  type: string;
  buyPrice: number;
  sellPrice: number;
  amount: number;
  profit: number;
  profitPercent: number;
  status: string;
  exchange1: string;
  exchange2: string;
  execution_time?: number;
}

interface ReferralRecord {
  id: string;
  referred_user: string;
  referred_email: string;
  commission: number;
  status: string;
  created_at: string;
  level: number;
  total_invested?: number;
}

interface TransactionRecord {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  amount_brl: number;
  status: string;
  created_at: string;
  payment_type: string;
  trx_id?: string;
}

interface ProfitRecord {
  id: string;
  investment_amount: number;
  daily_rate: number;
  plan_name: string;
  total_profit: number;
  created_at: string;
  status: string;
  completed_operations?: number;
  exchanges_count?: number;
}

interface UserInvestment {
  id: string;
  amount: number;
  daily_rate: number;
  total_earned: number;
  status: string;
  created_at: string;
  end_date: string;
  operations_completed: number;
  total_operations: number;
  plan: {
    name: string;
    robot_version: string;
  };
}

// Circular Progress Component
const CircularProgress = ({ percentage, color, title, subtitle }: { 
  percentage: number; 
  color: string; 
  title: string; 
  subtitle: string; 
}) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="text-center">
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{percentage}%</span>
        </div>
      </div>
      <div className="text-lg font-semibold text-white mb-2">{title}</div>
      <div className="text-xs text-gray-400 mb-2">Department of Build app</div>
      <div className="text-xs" style={{ color }}>{subtitle}</div>
    </div>
  );
};

const History = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activePeriod, setActivePeriod] = useState("Month");
  const [activeTab, setActiveTab] = useState("overview");
  
  // State for different data types
  const [tradingHistory, setTradingHistory] = useState<TradingRecord[]>([]);
  const [referralHistory, setReferralHistory] = useState<ReferralRecord[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<TransactionRecord[]>([]);
  const [profitHistory, setProfitHistory] = useState<ProfitRecord[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  
  // Statistics
  const [stats, setStats] = useState({
    totalProfit: 0,
    totalReferralEarnings: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activeReferrals: 0,
    successRate: 75,
    totalOperations: 0,
    thisMonthEarnings: 0,
    totalInvested: 0,
    currentBalance: 0,
    activeInvestments: 0,
    completedInvestments: 0,
    totalCommissions: 0,
    averageROI: 0
  });

  const { user } = useAuth();
  const { toast } = useToast();

  // Chart Data
  const catalogData = [
    { name: 'Enterprise Technology', value: 68, color: '#3b82f6' },
    { name: 'School Information', value: 45, color: '#10b981' },
    { name: 'Supervisor Engineer', value: 7000, color: '#f59e0b' }
  ];

  const exchangeData = [
    { month: 'Jan', input: 200, output: 180 },
    { month: 'Fev', input: 300, output: 280 },
    { month: 'Mar', input: 400, output: 350 },
    { month: 'Abr', input: 450, output: 420 },
    { month: 'Mai', input: 380, output: 400 },
    { month: 'Jun', input: 320, output: 350 },
    { month: 'Jul', input: 180, output: 200 },
    { month: 'Ago', input: 150, output: 170 },
    { month: 'Set', input: 250, output: 280 },
    { month: 'Out', input: 400, output: 380 },
    { month: 'Nov', input: 420, output: 400 },
    { month: 'Dez', input: 380, output: 360 }
  ];

  const statusData = [
    { name: 'Release', value: 30, color: '#3b82f6' },
    { name: 'Submit', value: 25, color: '#10b981' },
    { name: 'Sign In', value: 25, color: '#f59e0b' },
    { name: 'Verify', value: 20, color: '#ef4444' }
  ];

  const departmentData = [
    { subject: 'Office of Science', A: 3 },
    { subject: 'Treasury', A: 4 },
    { subject: 'Education', A: 2 },
    { subject: 'Security Council', A: 5 },
    { subject: 'Transportation', A: 3 },
    { subject: 'Housing', A: 4 }
  ];

  const barData = [
    { day: 'Mon', volume: 80 },
    { day: 'Tue', volume: 60 },
    { day: 'Wed', volume: 65 },
    { day: 'Thu', volume: 55 },
    { day: 'Fri', volume: 70 },
    { day: 'Sat', volume: 85 },
    { day: 'Sun', volume: 75 }
  ];

  const interfaces = [
    { name: 'Resident Information', value: 50, percentage: 83 },
    { name: 'Personnel Information', value: 40, percentage: 67 },
    { name: 'Social Security Info', value: 36, percentage: 60 },
    { name: 'School Information', value: 30, percentage: 50 }
  ];

  // Load all data functions
  const loadAllData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        loadTradingHistory(),
        loadReferralHistory(),
        loadTransactionHistory(),
        loadProfitHistory(),
        loadUserInvestments(),
        loadStatistics()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico completo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load trading history
  const loadTradingHistory = async () => {
    try {
      const { data: tradingData } = await supabase
        .from('trading_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(200);

      if (tradingData) {
        const formattedTrades = tradingData.map(trade => ({
          id: trade.operation_id || trade.id,
          timestamp: new Date(trade.created_at).toLocaleString('pt-BR'),
          created_at: trade.created_at,
          pair: trade.pair || 'BTC/USDT',
          type: trade.type || 'Arbitragem',
          buyPrice: trade.buy_price || 0,
          sellPrice: trade.sell_price || 0,
          amount: trade.amount || 0,
          profit: trade.profit || 0,
          profitPercent: trade.profit_percent || 0,
          status: trade.status === 'completed' ? 'Concluída' : 'Pendente',
          exchange1: trade.exchange_1 || 'Binance Spot',
          exchange2: trade.exchange_2 || 'Binance Futures',
          execution_time: trade.execution_time || 0
        }));
        setTradingHistory(formattedTrades);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de trading:', error);
    }
  };

  const loadReferralHistory = async () => {
    try {
      const { data: referralData } = await supabase
        .from('referrals')
        .select(`
          id,
          total_commission,
          status,
          created_at,
          profiles!referrals_referred_id_fkey(display_name, email, total_profit)
        `)
        .eq('referrer_id', user?.id)
        .order('created_at', { ascending: false });

      if (referralData) {
        const formattedReferrals = referralData.map(ref => ({
          id: ref.id,
          referred_user: (ref.profiles as any)?.display_name || 'Usuário',
          referred_email: (ref.profiles as any)?.email || '',
          commission: ref.total_commission || 0,
          status: ref.status,
          created_at: ref.created_at,
          level: 1,
          total_invested: (ref.profiles as any)?.total_profit || 0
        }));
        setReferralHistory(formattedReferrals);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de referrals:', error);
    }
  };

  const loadTransactionHistory = async () => {
    try {
      // Load deposits
      const { data: depositsData } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      // Load digitopay transactions
      const { data: digitopayData } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      const allTransactions: TransactionRecord[] = [];

      // Process deposits
      if (depositsData) {
        depositsData.forEach(deposit => {
          allTransactions.push({
            id: deposit.id,
            type: 'deposit',
            amount: deposit.amount_usd || 0,
            amount_brl: deposit.amount_brl || 0,
            status: deposit.status,
            created_at: deposit.created_at,
            payment_type: deposit.type || 'pix'
          });
        });
      }

      // Process digitopay transactions
      if (digitopayData) {
        digitopayData.forEach(transaction => {
          allTransactions.push({
            id: transaction.id,
            type: transaction.type === 'deposit' ? 'deposit' : 'withdrawal',
            amount: transaction.amount || 0,
            amount_brl: transaction.amount_brl || 0,
            status: transaction.status,
            created_at: transaction.created_at,
            payment_type: 'digitopay',
            trx_id: transaction.trx_id
          });
        });
      }

      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransactionHistory(allTransactions);
    } catch (error) {
      console.error('Erro ao carregar histórico de transações:', error);
    }
  };

  const loadProfitHistory = async () => {
    try {
      const { data: profitsData } = await supabase
        .from('trading_profits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (profitsData) {
        const formattedProfits = profitsData.map(profit => ({
          id: profit.id,
          investment_amount: profit.investment_amount,
          daily_rate: profit.daily_rate,
          plan_name: profit.plan_name,
          total_profit: profit.total_profit,
          created_at: profit.created_at,
          status: profit.status,
          completed_operations: profit.completed_operations || 0,
          exchanges_count: profit.exchanges_count || 0
        }));
        setProfitHistory(formattedProfits);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de lucros:', error);
    }
  };

  const loadUserInvestments = async () => {
    try {
      const { data: investmentsData } = await supabase
        .from('user_investments')
        .select(`
          *,
          investment_plans!user_investments_plan_id_fkey(name, robot_version)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (investmentsData) {
        const formattedInvestments = investmentsData.map(inv => ({
          id: inv.id,
          amount: inv.amount,
          daily_rate: inv.daily_rate,
          total_earned: inv.total_earned || 0,
          status: inv.status,
          created_at: inv.created_at,
          end_date: inv.end_date,
          operations_completed: inv.operations_completed || 0,
          total_operations: inv.total_operations || 0,
          plan: {
            name: (inv.investment_plans as any)?.name || 'Plano Desconhecido',
            robot_version: (inv.investment_plans as any)?.robot_version || '4.0.0'
          }
        }));
        setUserInvestments(formattedInvestments);
      }
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance, total_profit, referral_balance')
        .eq('user_id', user?.id)
        .single();

      // Calculate totals from loaded data
      const totalDeposits = transactionHistory
        .filter(t => t.type === 'deposit' && (t.status === 'paid' || t.status === 'completed'))
        .reduce((sum, t) => sum + t.amount_brl, 0);

      const totalWithdrawals = transactionHistory
        .filter(t => t.type === 'withdrawal' && (t.status === 'approved' || t.status === 'completed'))
        .reduce((sum, t) => sum + t.amount_brl, 0);

      const completedTrades = tradingHistory.filter(t => t.status === 'Concluída');
      const totalTradingProfit = completedTrades.reduce((sum, t) => sum + t.profit, 0);
      const successRate = tradingHistory.length > 0 ? 
        (completedTrades.length / tradingHistory.length * 100) : 75;

      const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      const totalEarned = userInvestments.reduce((sum, inv) => sum + inv.total_earned, 0);
      const averageROI = totalInvested > 0 ? (totalEarned / totalInvested * 100) : 0;

      const activeInvestments = userInvestments.filter(inv => inv.status === 'active').length;
      const completedInvestments = userInvestments.filter(inv => inv.status === 'completed').length;

      // This month earnings
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthEarnings = profitHistory
        .filter(p => new Date(p.created_at) >= thisMonth)
        .reduce((sum, p) => sum + p.total_profit, 0);

      const totalCommissions = referralHistory.reduce((sum, ref) => sum + ref.commission, 0);

      setStats({
        totalProfit: (profile?.total_profit || 0) + totalTradingProfit + totalEarned,
        totalReferralEarnings: profile?.referral_balance || 0,
        totalDeposits,
        totalWithdrawals,
        activeReferrals: referralHistory.filter(r => r.status === 'active').length,
        successRate: Number(successRate.toFixed(1)),
        totalOperations: tradingHistory.length + profitHistory.length,
        thisMonthEarnings,
        totalInvested,
        currentBalance: profile?.balance || 0,
        activeInvestments,
        completedInvestments,
        totalCommissions,
        averageROI: Number(averageROI.toFixed(2))
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const message = `
🤖 *RELATÓRIO DE PERFORMANCE - ROBÔ DE ARBITRAGEM*

💰 *RESUMO FINANCEIRO*
• Lucro Total: R$ ${stats.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Saldo Atual: R$ ${stats.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Ganhos por Indicação: R$ ${stats.totalReferralEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

📊 *INVESTIMENTOS*
• Total Investido: R$ ${stats.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Investimentos Ativos: ${stats.activeInvestments}
• ROI Médio: ${stats.averageROI}%

🎯 *TRADING*
• Taxa de Sucesso: ${stats.successRate}%
• Total de Operações: ${stats.totalOperations}
• Lucro Este Mês: R$ ${stats.thisMonthEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

👥 *INDICAÇÕES*
• Indicados Ativos: ${stats.activeReferrals}
• Total em Comissões: R$ ${stats.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

🔥 *Robô de alta performance gerando resultados consistentes!*

#RobôArbitragem #TradingBot #InvestimentoInteligente
`.trim();

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "🚀 Compartilhado!",
      description: "Relatório preparado para WhatsApp",
    });
  };

  // Helper functions for status styling
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluída':
      case 'completed':
        return 'text-emerald-400';
      case 'pendente':
      case 'pending':
        return 'text-yellow-400';
      case 'erro':
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
      case 'approved':
        return 'text-emerald-400';
      case 'pending':
        return 'text-yellow-400';
      case 'cancelled':
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getTransactionStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'Pago';
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Analytics</h1>
            <p className="text-gray-400">Dashboard completo de performance e estatísticas</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={loadAllData} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={shareViaWhatsApp}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-4 gap-1 bg-blue-900/50 border border-white/10 p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="trading" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Bot className="h-4 w-4 mr-2" />
              Trading
            </TabsTrigger>
            <TabsTrigger 
              value="referrals" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Indicações
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Transações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_300px] grid-rows-[auto_auto_auto] gap-5">
              
              {/* Catalog Distribution */}
              <div className="bg-blue-900/70 backdrop-blur-lg rounded-xl p-5 border border-white/10 shadow-2xl row-span-2">
                <h3 className="text-gray-200 font-semibold mb-4">Catalog Distribution</h3>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={catalogData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {catalogData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">Certification Results of</div>
                  <div className="text-sm">68% Enterprise Technology</div>
                  <div className="text-sm">45% School Information</div>
                  <div className="text-sm">7000 Supervisor Engineer</div>
                </div>
              </div>

              {/* Data Exchange */}
              <div className="bg-blue-900/70 backdrop-blur-lg rounded-xl p-5 border border-white/10 shadow-2xl row-span-2">
                <h3 className="text-gray-200 font-semibold mb-4">Data Exchange</h3>
                <div className="flex justify-between mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">850,00</div>
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-lg mb-2">20% ↑</div>
                    <div className="text-green-400 font-semibold">● Input</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">970,30</div>
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-lg mb-2">20% ↑</div>
                    <div className="text-red-400 font-semibold">● Output</div>
                  </div>
                </div>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={exchangeData}>
                      <defs>
                        <linearGradient id="inputGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="outputGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Area
                        type="monotone"
                        dataKey="input"
                        stroke="#10b981"
                        fill="url(#inputGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="output"
                        stroke="#ef4444"
                        fill="url(#outputGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-center">
                  <div>
                    <div className="font-bold">850,00</div>
                    <div className="text-xs text-gray-400">No.1<br/>February</div>
                  </div>
                  <div>
                    <div className="font-bold">750,00</div>
                    <div className="text-xs text-gray-400">No.2<br/>October</div>
                  </div>
                  <div>
                    <div className="font-bold">650,00</div>
                    <div className="text-xs text-gray-400">No.3<br/>November</div>
                  </div>
                  <div>
                    <div className="font-bold">550,00</div>
                    <div className="text-xs text-gray-400">No.4<br/>August</div>
                  </div>
                  <div>
                    <div className="font-bold">450,00</div>
                    <div className="text-xs text-gray-400">No.5<br/>March</div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="bg-blue-900/70 backdrop-blur-lg rounded-xl p-5 border border-white/10 shadow-2xl row-span-3">
                <div className="flex bg-white/10 rounded-lg p-1 mb-5">
                  {['Month', 'Quarter', 'Year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setActivePeriod(period)}
                      className={`flex-1 py-2 px-3 rounded text-sm transition-all ${
                        activePeriod === period 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
                
                <div className="mb-8">
                  <div className="text-gray-400 text-sm">Last</div>
                  <div className="text-base my-1">2019-08-</div>
                  <div className="text-gray-400 text-sm">Department of Build</div>
                  <div className="text-blue-400 text-sm">Supervisor Engineer</div>
                  <div className="text-blue-400 text-sm">Certificate</div>
                  <div className="text-gray-400 text-xs mt-2">Interface of Certificate Apply</div>
                </div>

                <h3 className="text-gray-200 font-semibold mb-3">Catalog Status</h3>
                <div className="h-24 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={40}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-around text-xs mb-8">
                  <span className="text-blue-400">Release</span>
                  <span className="text-green-400">Submit</span>
                  <span className="text-yellow-400">Sign In</span>
                  <span className="text-red-400">Verify</span>
                </div>

                <h3 className="text-gray-200 font-semibold mb-3">Interfaces Rank</h3>
                <div className="space-y-3">
                  {interfaces.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-sm">{item.name}</span>
                      <div className="flex items-center">
                        <span className="text-sm mr-2">{item.value}</span>
                        <div className="w-16 h-1 bg-white/20 rounded">
                          <div 
                            className="h-full bg-blue-600 rounded"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Radar */}
              <div className="bg-blue-900/70 backdrop-blur-lg rounded-xl p-5 border border-white/10 shadow-2xl">
                <h3 className="text-gray-200 font-semibold mb-4">Department</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={departmentData}>
                      <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                      />
                      <PolarRadiusAxis 
                        tick={false}
                        tickCount={6}
                        angle={30}
                      />
                      <Radar
                        name="Department"
                        dataKey="A"
                        stroke="#10b981"
                        fill="rgba(16, 185, 129, 0.2)"
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data Sampling */}
              <div className="bg-blue-900/70 backdrop-blur-lg rounded-xl p-5 border border-white/10 shadow-2xl">
                <h3 className="text-gray-200 font-semibold mb-4">Data Sampling</h3>
                <div className="h-32 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <Bar 
                        dataKey="volume" 
                        fill="#3b82f6"
                        radius={[2, 2, 0, 0]}
                      />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Monday</span>
                  <span>Tuesday</span>
                  <span>Wednesday</span>
                  <span>Thursday</span>
                  <span>Friday</span>
                  <span>Saturday</span>
                  <span>Sunday</span>
                </div>
                <div className="mt-4 text-xs text-gray-400 space-y-1">
                  <div>300</div>
                  <div>200</div>
                  <div>100</div>
                  <div>0</div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="bg-blue-900/70 backdrop-blur-lg rounded-xl p-5 border border-white/10 shadow-2xl col-span-full">
                <div className="flex justify-center gap-12">
                  <CircularProgress 
                    percentage={75}
                    color="#3b82f6"
                    title="Succeed"
                    subtitle="Information Exchange Succeed"
                  />
                  <CircularProgress 
                    percentage={63}
                    color="#ef4444"
                    title="Fail"
                    subtitle="Information Exchange Succeed"
                  />
                  <CircularProgress 
                    percentage={45}
                    color="#f59e0b"
                    title="Exchanging"
                    subtitle="Information Exchange Succeed"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Trading Tab */}
          <TabsContent value="trading" className="mt-6">
            <div className="bg-blue-900/70 backdrop-blur-lg rounded-xl p-5 border border-white/10">
              <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-green-400" />
                Histórico de Trading ({tradingHistory.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-auto">
                {tradingHistory.slice(0, 10).map((trade) => (
                  <div key={trade.id} className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <ArrowUpDown className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{trade.pair}</p>
                          <p className="text-gray-400 text-sm">{trade.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white">
                          R$ {trade.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-sm ${getStatusColor(trade.status)}`}>
                          {trade.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Compra:</span>
                        <span className="text-white ml-2">
                          ${trade.buyPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Venda:</span>
                        <span className="text-white ml-2">
                          ${trade.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Exchange 1:</span>
                        <span className="text-white ml-2">{trade.exchange1}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Exchange 2:</span>
                        <span className="text-white ml-2">{trade.exchange2}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="mt-6">
            <div className="bg-blue-900/70 backdrop-blur-lg rounded-xl p-5 border border-white/10">
              <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Histórico de Indicações ({referralHistory.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-auto">
                {referralHistory.map((referral) => (
                  <div key={referral.id} className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Users className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{referral.referred_user}</p>
                          <p className="text-gray-400 text-sm">{referral.referred_email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white">
                          R$ {referral.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-purple-300 text-sm">
                          Nível {referral.level}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-6">
            <div className="bg-blue-900/70 backdrop-blur-lg rounded-xl p-5 border border-white/10">
              <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-400" />
                Histórico de Transações ({transactionHistory.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-auto">
                {transactionHistory.map((transaction) => (
                  <div key={transaction.id} className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'deposit' 
                            ? 'bg-green-500/20' 
                            : 'bg-red-500/20'
                        }`}>
                          {transaction.type === 'deposit' ? (
                            <TrendingUp className="h-4 w-4 text-green-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {transaction.payment_type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white">
                          R$ {transaction.amount_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-sm ${getTransactionStatusColor(transaction.status)}`}>
                          {getTransactionStatusText(transaction.status)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                      {transaction.trx_id && (
                        <span className="ml-2">• TRX: {transaction.trx_id}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default History;