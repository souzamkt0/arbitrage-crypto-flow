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
  Banknote
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

interface ReferralRecord {
  id: string;
  referred_user: string;
  commission: number;
  status: string;
  created_at: string;
  level: number;
}

interface TransactionRecord {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  amount_brl: number;
  status: string;
  created_at: string;
  payment_type: string;
}

interface ProfitRecord {
  id: string;
  investment_amount: number;
  daily_rate: number;
  plan_name: string;
  total_profit: number;
  created_at: string;
  status: string;
}


const History = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  
  // State for different data types
  const [tradingHistory, setTradingHistory] = useState<TradingRecord[]>([]);
  const [referralHistory, setReferralHistory] = useState<ReferralRecord[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<TransactionRecord[]>([]);
  const [profitHistory, setProfitHistory] = useState<ProfitRecord[]>([]);
  
  // Statistics
  const [stats, setStats] = useState({
    totalProfit: 0,
    totalReferralEarnings: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activeReferrals: 0,
    successRate: 0,
    totalOperations: 0,
    thisMonthEarnings: 0
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
        .limit(100);

      if (tradingData) {
        const formattedTrades = tradingData.map(trade => ({
          id: trade.operation_id || trade.id,
          timestamp: new Date(trade.created_at).toLocaleString('pt-BR'),
          created_at: trade.created_at,
          pair: trade.pair || 'BTC/USDT',
          type: trade.type || 'Arbitrage',
          buyPrice: trade.buy_price || 0,
          sellPrice: trade.sell_price || 0,
          amount: trade.amount || 0,
          profit: trade.profit || 0,
          profitPercent: trade.profit_percent || 0,
          status: trade.status === 'completed' ? 'Completed' : 'Failed',
          exchange1: trade.exchange_1 || 'Spot Exchange',
          exchange2: trade.exchange_2 || 'Futures Exchange'
        }));
        setTradingHistory(formattedTrades);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de trading:', error);
    }
  };

  // Load referral history
  const loadReferralHistory = async () => {
    try {
      const { data: referralData } = await supabase
        .from('referrals')
        .select(`
          id,
          total_commission,
          status,
          created_at,
          profiles!referrals_referred_id_fkey(display_name, email)
        `)
        .eq('referrer_id', user?.id)
        .order('created_at', { ascending: false });

      if (referralData) {
        const formattedReferrals = referralData.map(ref => ({
          id: ref.id,
          referred_user: (ref.profiles as any)?.display_name || (ref.profiles as any)?.email || 'Usuário',
          commission: ref.total_commission || 0,
          status: ref.status,
          created_at: ref.created_at,
          level: 1
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
          commission: earning.amount,
          status: earning.status,
          created_at: earning.created_at,
          level: earning.level
        }));
        setReferralHistory(prev => [...prev, ...residualReferrals]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de referrals:', error);
    }
  };

  // Load transaction history
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

      if (digitopayData) {
        digitopayData.forEach(transaction => {
          allTransactions.push({
            id: transaction.id,
            type: transaction.type === 'deposit' ? 'deposit' : 'withdrawal',
            amount: transaction.amount || 0,
            amount_brl: transaction.amount_brl || 0,
            status: transaction.status,
            created_at: transaction.created_at,
            payment_type: 'digitopay'
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
          status: profit.status
        }));
        setProfitHistory(formattedProfits);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de lucros:', error);
    }
  };

  // Load statistics
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

      // Calculate transaction totals
      const totalDeposits = transactionHistory
        .filter(t => t.type === 'deposit' && t.status === 'paid')
        .reduce((sum, t) => sum + t.amount_brl, 0);

      const totalWithdrawals = transactionHistory
        .filter(t => t.type === 'withdrawal' && t.status === 'approved')
        .reduce((sum, t) => sum + t.amount_brl, 0);

      // Calculate trading stats
      const completedTrades = tradingHistory.filter(t => t.status === 'Completed');
      const totalTradingProfit = completedTrades.reduce((sum, t) => sum + t.profit, 0);
      const successRate = tradingHistory.length > 0 ? 
        (completedTrades.length / tradingHistory.length * 100) : 0;

      // This month earnings
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthEarnings = profitHistory
        .filter(p => new Date(p.created_at) >= thisMonth)
        .reduce((sum, p) => sum + p.total_profit, 0);

      setStats({
        totalProfit: (profile?.total_profit || 0) + totalTradingProfit,
        totalReferralEarnings: profile?.referral_balance || 0,
        totalDeposits,
        totalWithdrawals,
        activeReferrals: referralStats?.[0]?.active_referrals || 0,
        successRate: Number(successRate.toFixed(1)),
        totalOperations: tradingHistory.length + profitHistory.length,
        thisMonthEarnings
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  const handleExportCSV = () => {
    toast({
      title: "Exportando dados",
      description: "Preparando relatório completo em CSV...",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'approved':
      case 'active':
        return 'bg-emerald-500/20 text-emerald-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredTradingHistory = tradingHistory.filter(trade => {
    const matchesFilter = filter === "all" || trade.status.toLowerCase() === filter;
    const matchesSearch = trade.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFrom || !dateTo || 
      (new Date(trade.timestamp) >= new Date(dateFrom) && new Date(trade.timestamp) <= new Date(dateTo));
    return matchesFilter && matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <HistoryIcon className="h-8 w-8 mr-3 text-primary" />
              Histórico Completo
            </h1>
            <p className="text-muted-foreground">Visão consolidada de todos os seus ganhos e atividades</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={loadAllData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Total</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    R$ {stats.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-emerald-300 mt-1">
                    +R$ {stats.thisMonthEarnings.toLocaleString('pt-BR')} este mês
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ganhos por Indicação</p>
                  <p className="text-2xl font-bold text-blue-400">
                    R$ {stats.totalReferralEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-blue-300 mt-1">
                    {stats.activeReferrals} indicados ativos
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Volume de Depósitos</p>
                  <p className="text-2xl font-bold text-purple-400">
                    R$ {stats.totalDeposits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-purple-300 mt-1">
                    Saques: R$ {stats.totalWithdrawals.toLocaleString('pt-BR')}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {stats.successRate}%
                  </p>
                  <p className="text-xs text-amber-300 mt-1">
                    {stats.totalOperations} operações total
                  </p>
                </div>
                <Target className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Filter className="h-5 w-5 mr-2 text-primary" />
              Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Par, ID ou descrição"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Status</label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="failed">Falharam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Data Início</label>
                <Input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Data Fim</label>
                <Input 
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Ações</label>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Indicações
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="profits" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Lucros
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mix recent activities from all sources */}
                    {[...tradingHistory.slice(0, 3), ...transactionHistory.slice(0, 2)]
                      .sort((a: any, b: any) => {
                        const dateA = new Date(a.created_at || a.timestamp).getTime();
                        const dateB = new Date(b.created_at || b.timestamp).getTime();
                        return dateB - dateA;
                      })
                      .slice(0, 5)
                      .map((activity: any, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/20">
                              {'profit' in activity ? 
                                <Activity className="h-4 w-4 text-primary" /> :
                                <CreditCard className="h-4 w-4 text-primary" />
                              }
                            </div>
                            <div>
                              <p className="font-medium">
                                {'profit' in activity ? 
                                  `Trading ${activity.pair}` :
                                  `${activity.type === 'deposit' ? 'Depósito' : 'Saque'} ${activity.payment_type?.toUpperCase()}`
                                }
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(activity.created_at || activity.timestamp).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${'profit' in activity ? 
                              (activity.profit > 0 ? 'text-emerald-400' : 'text-red-400') :
                              (activity.type === 'deposit' ? 'text-emerald-400' : 'text-amber-400')
                            }`}>
                              {'profit' in activity ? 
                                `${activity.profit > 0 ? '+' : ''}$${activity.profit.toFixed(2)}` :
                                `${activity.type === 'deposit' ? '+' : '-'}R$ ${activity.amount_brl.toFixed(2)}`
                              }
                            </p>
                            <Badge className={getStatusColor(activity.status)} variant="outline">
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Summary */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Resumo Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/10">
                      <span className="text-emerald-300">Ganhos Trading</span>
                      <span className="font-semibold text-emerald-400">
                        +R$ {stats.thisMonthEarnings.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10">
                      <span className="text-blue-300">Indicações</span>
                      <span className="font-semibold text-blue-400">
                        +R$ {(stats.totalReferralEarnings * 0.3).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-purple-500/10">
                      <span className="text-purple-300">Investimentos</span>
                      <span className="font-semibold text-purple-400">
                        +R$ {(stats.totalProfit * 0.2).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Histórico de Trading</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Par</TableHead>
                        <TableHead>Exchanges</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Lucro</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTradingHistory.length > 0 ? (
                        filteredTradingHistory.map((trade) => (
                          <TableRow key={trade.id}>
                            <TableCell className="font-mono text-sm">{trade.id}</TableCell>
                            <TableCell className="text-sm">{trade.timestamp}</TableCell>
                            <TableCell className="font-medium">{trade.pair}</TableCell>
                            <TableCell className="text-sm">
                              <div>
                                <div>{trade.exchange1}</div>
                                <div className="text-muted-foreground">→ {trade.exchange2}</div>
                              </div>
                            </TableCell>
                            <TableCell>R$ {(trade.amount * trade.buyPrice).toFixed(2)}</TableCell>
                            <TableCell className={trade.profit > 0 ? "text-emerald-400" : "text-red-400"}>
                              {trade.profit > 0 ? "+" : ""}R$ {trade.profit.toFixed(2)}
                            </TableCell>
                            <TableCell className={trade.profitPercent > 0 ? "text-emerald-400" : "text-red-400"}>
                              {trade.profitPercent > 0 ? "+" : ""}{trade.profitPercent}%
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(trade.status)} variant="outline">
                                {trade.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Nenhum histórico de trading encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Histórico de Indicações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário Indicado</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead>Comissão</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referralHistory.length > 0 ? (
                        referralHistory.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell className="font-medium">{referral.referred_user}</TableCell>
                            <TableCell>
                              <Badge variant="outline">Nível {referral.level}</Badge>
                            </TableCell>
                            <TableCell className="text-emerald-400">
                              +R$ {referral.commission.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(referral.status)} variant="outline">
                                {referral.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Nenhuma indicação encontrada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor USD</TableHead>
                        <TableHead>Valor BRL</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionHistory.length > 0 ? (
                        transactionHistory.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {transaction.type === 'deposit' ? 
                                  <TrendingUp className="h-4 w-4 text-emerald-400" /> :
                                  <TrendingDown className="h-4 w-4 text-amber-400" />
                                }
                                <span className="capitalize">
                                  {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>$ {transaction.amount.toFixed(2)}</TableCell>
                            <TableCell className={transaction.type === 'deposit' ? "text-emerald-400" : "text-amber-400"}>
                              {transaction.type === 'deposit' ? '+' : '-'}R$ {transaction.amount_brl.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {transaction.payment_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(transaction.status)} variant="outline">
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Nenhuma transação encontrada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profits Tab */}
          <TabsContent value="profits" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Histórico de Lucros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plano</TableHead>
                        <TableHead>Investimento</TableHead>
                        <TableHead>Taxa Diária</TableHead>
                        <TableHead>Lucro Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profitHistory.length > 0 ? (
                        profitHistory.map((profit) => (
                          <TableRow key={profit.id}>
                            <TableCell className="font-medium">{profit.plan_name}</TableCell>
                            <TableCell>R$ {profit.investment_amount.toFixed(2)}</TableCell>
                            <TableCell>{profit.daily_rate}%</TableCell>
                            <TableCell className="text-emerald-400">
                              +R$ {profit.total_profit.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(profit.status)} variant="outline">
                                {profit.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(profit.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Nenhum lucro registrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default History;