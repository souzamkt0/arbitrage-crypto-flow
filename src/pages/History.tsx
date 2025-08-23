import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Filter, 
  History as HistoryIcon, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  ArrowUpDown,
  Activity,
  Wallet,
  Award,
  Target,
  BarChart3,
  PieChart,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote,
  Share,
  MessageCircle,
  Send,
  Phone,
  Eye,
  Bot,
  LineChart,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PerformanceCharts } from "@/components/PerformanceCharts";

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

const History = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
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
    successRate: 0,
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

  // Load all data
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

  // Load referral history with complete data
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

      // Load residual earnings
      const { data: residualData } = await supabase
        .from('residual_earnings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (residualData) {
        const residualReferrals = residualData.map(earning => ({
          id: earning.id,
          referred_user: 'Ganho Residual',
          referred_email: '',
          commission: earning.amount,
          status: earning.status,
          created_at: earning.created_at,
          level: earning.level,
          total_invested: 0
        }));
        setReferralHistory(prev => [...prev, ...residualReferrals]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de referrals:', error);
    }
  };

  // Load complete transaction history
  const loadTransactionHistory = async () => {
    try {
      // Load deposits
      const { data: depositsData } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      // Load withdrawals
      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
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

      // Process withdrawals
      if (withdrawalsData) {
        withdrawalsData.forEach(withdrawal => {
          allTransactions.push({
            id: withdrawal.id,
            type: 'withdrawal',
            amount: withdrawal.amount_usd || 0,
            amount_brl: withdrawal.amount_brl || 0,
            status: withdrawal.status,
            created_at: withdrawal.created_at,
            payment_type: withdrawal.type || 'pix'
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

  // Load profit history
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

  // Load user investments
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

  // Load enhanced statistics
  const loadStatistics = async () => {
    try {
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance, total_profit, referral_balance')
        .eq('user_id', user?.id)
        .single();

      // Get referral stats
      const { data: referralStats } = await supabase
        .rpc('get_user_referral_stats', { target_user_id: user?.id });

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
        (completedTrades.length / tradingHistory.length * 100) : 0;

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
        activeReferrals: referralStats?.[0]?.active_referrals || 0,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800/40 to-purple-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl">
                  <HistoryIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                Histórico & Análises
              </h1>
              <p className="text-blue-200 mt-2 text-sm md:text-base">
                Dashboard completo de performance e estatísticas
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={loadAllData} 
                disabled={isLoading}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/25"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
                <span className="sm:hidden">Sync</span>
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white border-0 shadow-lg shadow-green-500/25" 
                onClick={shareViaWhatsApp}
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                <Smartphone className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6 bg-white dark:bg-background rounded-lg">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Total Profit */}
            <Card className="bg-gradient-to-br from-emerald-500/20 to-green-600/30 backdrop-blur-xl border border-emerald-400/20 shadow-xl shadow-emerald-500/10">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                    +{((stats.thisMonthEarnings / stats.totalProfit) * 100 || 0).toFixed(1)}%
                  </Badge>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-emerald-200/80 truncate">Lucro Total</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">
                    R$ {stats.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-emerald-300 mt-1 truncate">
                    +R$ {stats.thisMonthEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mês
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Current Balance */}
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-600/30 backdrop-blur-xl border border-blue-400/20 shadow-xl shadow-blue-500/10">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Wallet className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                    Disponível
                  </Badge>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-blue-200/80 truncate">Saldo Atual</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">
                    R$ {stats.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-blue-300 mt-1 truncate">
                    {stats.activeInvestments} investimentos ativos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Referral Earnings */}
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/30 backdrop-blur-xl border border-purple-400/20 shadow-xl shadow-purple-500/10">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-xl">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                    {stats.activeReferrals}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-purple-200/80 truncate">Indicações</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">
                    R$ {stats.totalReferralEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-purple-300 mt-1 truncate">
                    {stats.activeReferrals} indicados ativos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/30 backdrop-blur-xl border border-orange-400/20 shadow-xl shadow-orange-500/10">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-500/20 rounded-xl">
                    <Target className="h-5 w-5 md:h-6 md:w-6 text-orange-400" />
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">
                    ROI {stats.averageROI}%
                  </Badge>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-orange-200/80 truncate">Taxa de Sucesso</p>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white truncate">
                    {stats.successRate}%
                  </p>
                  <p className="text-xs text-orange-300 mt-1 truncate">
                    {stats.totalOperations} operações
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
            <Card className="bg-gradient-to-br from-slate-700/40 to-slate-800/60 backdrop-blur-xl border border-slate-500/20">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="p-2 bg-blue-500/20 rounded-lg mx-auto w-fit mb-2">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 truncate">Investido</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                  R$ {stats.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-700/40 to-slate-800/60 backdrop-blur-xl border border-slate-500/20">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="p-2 bg-emerald-500/20 rounded-lg mx-auto w-fit mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 truncate">Ativos</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                  {stats.activeInvestments}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-700/40 to-slate-800/60 backdrop-blur-xl border border-slate-500/20">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="p-2 bg-green-500/20 rounded-lg mx-auto w-fit mb-2">
                  <Banknote className="h-4 w-4 text-green-400" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 truncate">Depósitos</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                  R$ {stats.totalDeposits.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-700/40 to-slate-800/60 backdrop-blur-xl border border-slate-500/20">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="p-2 bg-red-500/20 rounded-lg mx-auto w-fit mb-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 truncate">Saques</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                  R$ {stats.totalWithdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-700/40 to-slate-800/60 backdrop-blur-xl border border-slate-500/20">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="p-2 bg-purple-500/20 rounded-lg mx-auto w-fit mb-2">
                  <Award className="h-4 w-4 text-purple-400" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 truncate">Comissões</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                  R$ {stats.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-700/40 to-slate-800/60 backdrop-blur-xl border border-slate-500/20">
              <CardContent className="p-3 md:p-4 text-center">
                <div className="p-2 bg-orange-500/20 rounded-lg mx-auto w-fit mb-2">
                  <Activity className="h-4 w-4 text-orange-400" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 truncate">ROI Médio</p>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                  {stats.averageROI}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 backdrop-blur-xl border border-slate-500/20 rounded-2xl p-4">
              <TabsList className="grid grid-cols-5 gap-1 bg-slate-800/60 backdrop-blur-xl border border-slate-600/30 rounded-xl p-1">
                <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-1 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Visão Geral</span>
                  <span className="sm:hidden">Geral</span>
                </TabsTrigger>
                <TabsTrigger value="trading" className="text-xs sm:text-sm py-2 px-1 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Trading</span>
                  <span className="sm:hidden">Bot</span>
                </TabsTrigger>
                <TabsTrigger value="investments" className="text-xs sm:text-sm py-2 px-1 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Investimentos</span>
                  <span className="sm:hidden">Invest</span>
                </TabsTrigger>
                <TabsTrigger value="referrals" className="text-xs sm:text-sm py-2 px-1 sm:px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Indicações</span>
                  <span className="sm:hidden">Refs</span>
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2 px-1 sm:px-3 col-span-2 sm:col-span-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Transações</span>
                  <span className="sm:hidden">Transações</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Contents */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/60 backdrop-blur-xl border border-slate-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-blue-400" />
                    Gráfico de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 md:h-64 lg:h-80 flex items-center justify-center">
                    <p className="text-slate-400">Gráficos de performance em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trading" className="mt-4 space-y-4">
              <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/60 backdrop-blur-xl border border-slate-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bot className="h-5 w-5 text-emerald-400" />
                    Histórico de Trading ({tradingHistory.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-auto">
                    {tradingHistory.slice(0, 10).map((trade) => (
                      <div key={trade.id} className="bg-slate-700/40 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 md:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                                {trade.pair}
                              </Badge>
                              <span className="text-xs text-slate-400">{trade.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-300 truncate">
                              {trade.exchange1} → {trade.exchange2}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className={`font-semibold text-xs md:text-sm ${trade.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {trade.profit > 0 ? '+' : ''}R$ {trade.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(trade.status)} border-current`}>
                              {trade.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrals" className="mt-4 space-y-4">
              <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/60 backdrop-blur-xl border border-slate-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    Sistema de Indicações ({referralHistory.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-auto">
                    {referralHistory.slice(0, 10).map((referral) => (
                      <div key={referral.id} className="bg-slate-700/40 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 md:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm text-white truncate">
                                {referral.referred_user}
                              </p>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                                Nível {referral.level}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 truncate">
                              {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="font-semibold text-emerald-400 text-xs md:text-sm">
                              R$ {referral.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-slate-400">
                              {referral.status === 'active' ? 'Ativo' : 'Inativo'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investments" className="mt-4 space-y-4">
              <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/60 backdrop-blur-xl border border-slate-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-400" />
                    Investimentos Ativos ({userInvestments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-auto">
                    {userInvestments.slice(0, 10).map((investment) => (
                      <div key={investment.id} className="bg-slate-700/40 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 md:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm text-white truncate">
                                {investment.plan.name}
                              </p>
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                                {investment.plan.robot_version}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400">
                              R$ {investment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • {investment.daily_rate}% dia
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="font-semibold text-emerald-400 text-xs md:text-sm">
                              R$ {investment.total_earned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <Badge className={`text-xs ${investment.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-slate-500/20 text-slate-300 border-slate-400/30'}`}>
                              {investment.status === 'active' ? 'Ativo' : 'Finalizado'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="mt-4 space-y-4">
              <Card className="bg-gradient-to-br from-slate-800/40 to-slate-700/60 backdrop-blur-xl border border-slate-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-400" />
                    Transações Financeiras ({transactionHistory.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-auto">
                    {transactionHistory.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="bg-slate-700/40 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 md:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`text-xs ${transaction.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-red-500/20 text-red-300 border-red-400/30'}`}>
                                {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                              </Badge>
                              <span className="text-xs text-slate-400">
                                {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate">
                              {transaction.payment_type} {transaction.trx_id && `• ${transaction.trx_id}`}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className={`font-semibold text-xs md:text-sm ${transaction.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {transaction.type === 'deposit' ? '+' : '-'}R$ {transaction.amount_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <Badge className={`text-xs ${getTransactionStatusColor(transaction.status)} border-current`}>
                              {getTransactionStatusText(transaction.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default History;