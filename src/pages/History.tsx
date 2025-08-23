import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Download, 
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
  FileText,
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  const reportRef = useRef<HTMLDivElement>(null);
  
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

  // Generate comprehensive PDF report
  const generatePDFReport = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    toast({
      title: "Gerando Relatório",
      description: "Preparando seu relatório completo em PDF...",
    });

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `relatorio-completo-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "✅ Relatório Gerado",
        description: `PDF salvo como ${fileName}`,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

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

💳 *MOVIMENTAÇÃO*
• Depósitos: R$ ${stats.totalDeposits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Saques: R$ ${stats.totalWithdrawals.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

📅 Relatório gerado em: ${new Date().toLocaleString('pt-BR')}
    `.trim();

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "✅ Compartilhando",
      description: "Relatório enviado para WhatsApp",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'approved':
      case 'active':
      case 'concluída':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'pending':
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const filteredTradingHistory = tradingHistory.filter(trade => {
    const matchesFilter = filter === "all" || trade.status.toLowerCase().includes(filter);
    const matchesSearch = trade.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFrom || !dateTo || 
      (new Date(trade.created_at || trade.timestamp) >= new Date(dateFrom) && 
       new Date(trade.created_at || trade.timestamp) <= new Date(dateTo));
    return matchesFilter && matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Container */}
      <div className="w-full px-2 sm:px-4 md:px-6 py-3 md:py-6">
        <div className="max-w-7xl mx-auto space-y-3 md:space-y-6">
          {/* Responsive Header */}
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center">
                  <HistoryIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mr-2 md:mr-3 text-primary" />
                  Histórico Completo
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Relatório consolidado de ganhos, operações e atividades
                </p>
              </div>
              
              {/* Action Buttons - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={loadAllData}
                  disabled={isLoading}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Atualizar</span>
                  <span className="sm:hidden">Sync</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={generatePDFReport}
                  disabled={isExporting}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <FileText className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                  PDF
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none" 
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

          {/* PDF Report Container */}
          <div ref={reportRef} className="space-y-4 md:space-y-6 bg-white dark:bg-background rounded-lg">
            {/* PDF Header */}
            <div className="hidden print:block bg-primary text-primary-foreground p-6 rounded-t-lg">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">RELATÓRIO DE PERFORMANCE</h1>
                <h2 className="text-lg">Robô de Arbitragem - Análise Completa</h2>
                <p className="text-sm opacity-90">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
                <p className="text-sm opacity-90">Usuário: {user?.email}</p>
              </div>
            </div>

            {/* Responsive Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 p-3 md:p-0">
              {/* Total Profit */}
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Lucro Total</p>
                      <p className="text-sm sm:text-lg md:text-xl font-bold text-emerald-400 truncate">
                        R$ {stats.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-emerald-300 mt-1 truncate">
                        +R$ {stats.thisMonthEarnings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mês
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              {/* Current Balance */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Saldo Atual</p>
                      <p className="text-sm sm:text-lg md:text-xl font-bold text-blue-400 truncate">
                        R$ {stats.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-blue-300 mt-1 truncate">
                        {stats.activeInvestments} ativos
                      </p>
                    </div>
                    <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              {/* Referral Earnings */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Indicações</p>
                      <p className="text-sm sm:text-lg md:text-xl font-bold text-purple-400 truncate">
                        R$ {stats.totalReferralEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-purple-300 mt-1 truncate">
                        {stats.activeReferrals} ativos
                      </p>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              {/* Success Rate */}
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Taxa Sucesso</p>
                      <p className="text-sm sm:text-lg md:text-xl font-bold text-amber-400 truncate">
                        {stats.successRate}%
                      </p>
                      <p className="text-xs text-amber-300 mt-1 truncate">
                        {stats.totalOperations} ops
                      </p>
                    </div>
                    <Target className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Stats - Mobile Optimized */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4 px-3 md:px-0">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto text-green-400 mb-1 md:mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Investido</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold truncate">
                    R$ {stats.totalInvested.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto text-blue-400 mb-1 md:mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">ROI Médio</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-emerald-400 truncate">
                    {stats.averageROI}%
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto text-purple-400 mb-1 md:mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Depósitos</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold truncate">
                    R$ {stats.totalDeposits.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                  <Banknote className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto text-orange-400 mb-1 md:mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Saques</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold truncate">
                    R$ {stats.totalWithdrawals.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto text-cyan-400 mb-1 md:mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Inv. Ativos</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold truncate">
                    {stats.activeInvestments}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto text-yellow-400 mb-1 md:mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Comissões</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold truncate">
                    R$ {stats.totalCommissions.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Charts for PDF */}
            <div className="w-full px-3 md:px-0">
              <PerformanceCharts
                tradingHistory={tradingHistory}
                profitHistory={profitHistory}
                referralHistory={referralHistory}
                transactionHistory={transactionHistory}
                stats={stats}
              />
            </div>
          </div>

          {/* Responsive Tabs Navigation */}
          <div className="px-3 md:px-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto p-1">
                <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Resumo</span>
                  <span className="sm:hidden">Home</span>
                </TabsTrigger>
                <TabsTrigger value="trading" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
                  <LineChart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Trading</span>
                  <span className="sm:hidden">Trade</span>
                </TabsTrigger>
                <TabsTrigger value="investments" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Investimentos</span>
                  <span className="sm:hidden">Invest</span>
                </TabsTrigger>
                <TabsTrigger value="referrals" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Indicações</span>
                  <span className="sm:hidden">Refs</span>
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs sm:text-sm py-2 px-1 sm:px-3 col-span-2 sm:col-span-1">
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Transações</span>
                  <span className="sm:hidden">Transações</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab - Mobile Optimized */}
              <TabsContent value="overview" className="space-y-3 md:space-y-6 px-3 md:px-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                  {/* Recent Trading Operations */}
                  <Card>
                    <CardHeader className="pb-2 md:pb-6">
                      <CardTitle className="flex items-center text-sm md:text-base">
                        <LineChart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        Operações Recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 md:space-y-3">
                        {tradingHistory.slice(0, 5).map((trade) => (
                          <div key={trade.id} className="flex items-center justify-between p-2 md:p-3 bg-muted/50 rounded-lg">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm md:text-base truncate">{trade.pair}</p>
                              <p className="text-xs md:text-sm text-muted-foreground">
                                {new Date(trade.timestamp).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <p className={`font-semibold text-xs md:text-sm ${trade.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {trade.profit > 0 ? '+' : ''}R$ {trade.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 0 })}
                              </p>
                              <Badge variant="outline" className={`text-xs ${getStatusColor(trade.status)}`}>
                                {trade.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {tradingHistory.length === 0 && (
                          <div className="text-center py-6 text-muted-foreground">
                            <LineChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma operação de trading encontrada</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Referrals */}
                  <Card>
                    <CardHeader className="pb-2 md:pb-6">
                      <CardTitle className="flex items-center text-sm md:text-base">
                        <Users className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        Indicações Recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 md:space-y-3">
                        {referralHistory.slice(0, 5).map((referral) => (
                          <div key={referral.id} className="flex items-center justify-between p-2 md:p-3 bg-muted/50 rounded-lg">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm md:text-base truncate">{referral.referred_user}</p>
                              <p className="text-xs md:text-sm text-muted-foreground truncate">
                                {referral.referred_email || 'Email não informado'}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <p className="font-semibold text-emerald-400 text-xs md:text-sm">
                                R$ {referral.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 0 })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Nível {referral.level}
                              </p>
                            </div>
                          </div>
                        ))}
                        {referralHistory.length === 0 && (
                          <div className="text-center py-6 text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma indicação encontrada</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Trading Tab - Mobile Optimized */}
              <TabsContent value="trading" className="space-y-3 md:space-y-4 px-3 md:px-0">
                {/* Mobile-First Filters */}
                <Card className="p-3 md:p-4">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex items-center space-x-2 flex-1">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por par ou ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1 text-sm"
                        />
                      </div>
                      
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="concluída">Concluídas</SelectItem>
                          <SelectItem value="pendente">Pendentes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex gap-2 flex-1">
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="flex-1 text-sm"
                          placeholder="Data início"
                        />
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="flex-1 text-sm"
                          placeholder="Data fim"
                        />
                      </div>
                      {(searchTerm || filter !== "all" || dateFrom || dateTo) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSearchTerm("");
                            setFilter("all");
                            setDateFrom("");
                            setDateTo("");
                          }}
                          className="w-full sm:w-auto"
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Trading History Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Trading ({filteredTradingHistory.length} operações)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data/Hora</TableHead>
                            <TableHead>Par</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Preço Compra</TableHead>
                            <TableHead>Preço Venda</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Lucro</TableHead>
                            <TableHead>%</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Exchanges</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTradingHistory.map((trade) => (
                            <TableRow key={trade.id}>
                              <TableCell className="font-mono text-xs">
                                {trade.timestamp}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {trade.pair}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{trade.type}</Badge>
                              </TableCell>
                              <TableCell>
                                R$ {trade.buyPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                R$ {trade.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                R$ {trade.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className={trade.profit > 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                                {trade.profit > 0 ? '+' : ''}R$ {trade.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className={trade.profitPercent > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                {trade.profitPercent > 0 ? '+' : ''}{trade.profitPercent.toFixed(2)}%
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getStatusColor(trade.status)}>
                                  {trade.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs">
                                {trade.exchange1} → {trade.exchange2}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Investments Tab */}
              <TabsContent value="investments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Seus Investimentos ({userInvestments.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Taxa Diária</TableHead>
                            <TableHead>Ganho Total</TableHead>
                            <TableHead>Operações</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>ROI</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userInvestments.map((investment) => (
                            <TableRow key={investment.id}>
                              <TableCell>
                                {new Date(investment.created_at).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-semibold">{investment.plan.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Robô v{investment.plan.robot_version}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="font-semibold">
                                R$ {investment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-emerald-400">
                                {(investment.daily_rate * 100).toFixed(2)}%
                              </TableCell>
                              <TableCell className="text-emerald-400 font-semibold">
                                R$ {investment.total_earned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <div className="text-center">
                                  <p className="font-semibold">{investment.operations_completed}</p>
                                  <p className="text-xs text-muted-foreground">
                                    de {investment.total_operations}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getStatusColor(investment.status)}>
                                  {investment.status === 'active' ? 'Ativo' : 'Concluído'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-emerald-400 font-semibold">
                                {investment.amount > 0 ? 
                                  ((investment.total_earned / investment.amount) * 100).toFixed(2) : 0}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Referrals Tab */}
              <TabsContent value="referrals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Indicações ({referralHistory.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Usuário Indicado</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Investimento Total</TableHead>
                            <TableHead>Comissão Ganha</TableHead>
                            <TableHead>Nível</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referralHistory.map((referral) => (
                            <TableRow key={referral.id}>
                              <TableCell>
                                {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {referral.referred_user}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {referral.referred_email}
                              </TableCell>
                              <TableCell>
                                R$ {(referral.total_invested || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-emerald-400 font-semibold">
                                R$ {referral.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  Nível {referral.level}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getStatusColor(referral.status)}>
                                  {referral.status === 'active' ? 'Ativo' : referral.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Transações ({transactionHistory.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Valor USD</TableHead>
                            <TableHead>Valor BRL</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead>TRX ID</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactionHistory.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                {new Date(transaction.created_at).toLocaleString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={
                                  transaction.type === 'deposit' ? 
                                  'bg-emerald-500/20 text-emerald-300' : 
                                  'bg-orange-500/20 text-orange-300'
                                }>
                                  {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold">
                                $ {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="font-semibold">
                                R$ {transaction.amount_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {transaction.payment_type.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {transaction.trx_id || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getStatusColor(transaction.status)}>
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
