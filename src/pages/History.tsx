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
  LineChart
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
      pdf.save(`alphabit-relatorio-${new Date().toLocaleDateString('pt-BR')}.pdf`);
      
      toast({
        title: "Relatório Gerado!",
        description: "Download iniciado automaticamente",
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

  // WhatsApp share function
  const generateWhatsAppMessage = (userName: string, userEmail: string) => {
    const message = `🎯 *Update sobre ${userName}* - Alphabit Team

📊 *RELATÓRIO DE PERFORMANCE*

👤 Usuário: ${userName}
📧 Email: ${userEmail}
🕒 Data: ${new Date().toLocaleDateString('pt-BR')}

💰 *ESTATÍSTICAS:*
• Total de operações: ${stats.totalOperations}
• Taxa de sucesso: ${stats.successRate}%
• Lucro total: R$ ${stats.totalProfit.toFixed(2)}

🚀 Continue acompanhando o progresso em nosso dashboard!

*Alphabit Team*
💎 Excelência em Trading Automatizado`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-2">
          <HistoryIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          Histórico Completo
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Acompanhe todo seu histórico de trading, referrals e transações
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">Visão Geral</TabsTrigger>
          <TabsTrigger value="trading" className="text-xs sm:text-sm px-2 py-2">Trading</TabsTrigger>
          <TabsTrigger value="referrals" className="text-xs sm:text-sm px-2 py-2">Referrals</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm px-2 py-2">Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-green-400">Lucro Total</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-300">
                      R$ {stats.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-green-500 mt-1">+{stats.averageROI}% ROI</p>
                  </div>
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-blue-400">Comissões</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-300">
                      R$ {stats.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">{stats.activeReferrals} ativos</p>
                  </div>
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-purple-400">Investimentos</p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-300">
                      R$ {stats.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-purple-500 mt-1">{stats.activeInvestments} ativos</p>
                  </div>
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-orange-400">Operações</p>
                    <p className="text-lg sm:text-2xl font-bold text-orange-300">{stats.totalOperations}</p>
                    <p className="text-xs text-orange-500 mt-1">{stats.successRate}% taxa de sucesso</p>
                  </div>
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col gap-4 p-3 sm:p-4 bg-card rounded-lg border">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar transações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="referrals">Referrals</SelectItem>
                  <SelectItem value="transactions">Transações</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 text-sm"
                placeholder="Data inicial"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 text-sm"
                placeholder="Data final"
              />
              <Button
                onClick={generatePDFReport}
                disabled={isExporting}
                className="w-full sm:w-auto text-sm"
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Exportar PDF
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold">Histórico de Trading</h2>
            <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
              {tradingHistory.length} operações
            </Badge>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px] text-xs sm:text-sm whitespace-nowrap">Data/Hora</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Par</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Tipo</TableHead>
                    <TableHead className="min-w-[70px] text-xs sm:text-sm">Compra</TableHead>
                    <TableHead className="min-w-[70px] text-xs sm:text-sm">Venda</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Quantidade</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Lucro</TableHead>
                    <TableHead className="min-w-[50px] text-xs sm:text-sm">%</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="min-w-[120px] text-xs sm:text-sm">Exchanges</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tradingHistory.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap">
                        {trade.timestamp}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{trade.pair}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{trade.type}</Badge>
                      </TableCell>
                      <TableCell className="text-green-400 font-mono text-xs sm:text-sm">
                        ${trade.buyPrice.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-red-400 font-mono text-xs sm:text-sm">
                        ${trade.sellPrice.toFixed(4)}
                      </TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm">
                        {trade.amount.toFixed(6)}
                      </TableCell>
                      <TableCell className={`font-mono text-xs sm:text-sm ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${trade.profit.toFixed(2)}
                      </TableCell>
                      <TableCell className={`font-mono text-xs sm:text-sm ${trade.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.profitPercent.toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={trade.status === 'Concluída' ? 'default' : 'secondary'} className="text-xs">
                          {trade.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">{trade.exchange1}</div>
                          <div className="text-xs text-muted-foreground">{trade.exchange2}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold">Histórico de Referrals</h2>
            <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
              {referralHistory.length} indicações
            </Badge>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px] text-xs sm:text-sm">Usuário</TableHead>
                    <TableHead className="min-w-[150px] text-xs sm:text-sm">Email</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Comissão</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="min-w-[100px] text-xs sm:text-sm">Data</TableHead>
                    <TableHead className="min-w-[60px] text-xs sm:text-sm">Nível</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Investido</TableHead>
                    <TableHead className="min-w-[100px] text-xs sm:text-sm">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralHistory.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {referral.referred_user}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm">
                        {referral.referred_email}
                      </TableCell>
                      <TableCell className="text-green-400 font-mono text-xs sm:text-sm">
                        R$ {referral.commission.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={referral.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {referral.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm">
                        {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          Nível {referral.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm">
                        R$ {(referral.total_invested || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateWhatsAppMessage(referral.referred_user, referral.referred_email)}
                          className="text-xs h-8 px-2"
                        >
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          WhatsApp
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold">Histórico de Transações</h2>
            <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
              {transactionHistory.length} transações
            </Badge>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px] text-xs sm:text-sm">Data</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Tipo</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Valor (USD)</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Valor (BRL)</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="min-w-[80px] text-xs sm:text-sm">Método</TableHead>
                    <TableHead className="min-w-[120px] text-xs sm:text-sm">ID Transação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionHistory.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm">
                        {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.type === 'deposit' ? 'default' : 'destructive'}
                          className="flex items-center gap-1 text-xs"
                        >
                          {transaction.type === 'deposit' ? (
                            <ArrowUpDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 rotate-180" />
                          )}
                          {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm">
                        ${transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm">
                        R$ {transaction.amount_brl.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            transaction.status === 'paid' || transaction.status === 'completed' || transaction.status === 'approved' 
                              ? 'default' 
                              : transaction.status === 'pending' 
                              ? 'secondary' 
                              : 'destructive'
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {transaction.payment_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {transaction.trx_id || transaction.id.substring(0, 8)}...
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;