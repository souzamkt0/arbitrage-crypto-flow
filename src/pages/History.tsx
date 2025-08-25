import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  History as HistoryIcon, 
  Search, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Wallet,
  ArrowUpDown,
  Download,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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

interface ReferralRecord {
  id: string;
  referred_user: string;
  commission: number;
  status: string;
  created_at: string;
}

interface InvestmentRecord {
  id: string;
  amount: number;
  total_earned: number;
  status: string;
  created_at: string;
  plan_name: string;
}

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("transactions");
  const [isLoading, setIsLoading] = useState(false);
  
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [investments, setInvestments] = useState<InvestmentRecord[]>([]);
  
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalEarnings: 0,
    totalReferrals: 0
  });

  const { user } = useAuth();
  const { toast } = useToast();

  // Load all data
  const loadAllData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        loadTransactions(),
        loadReferrals(),
        loadInvestments()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load transactions
  const loadTransactions = async () => {
    try {
      const { data: digitopayData } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      const { data: depositsData } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      const allTransactions: TransactionRecord[] = [];

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
            payment_type: 'pix',
            trx_id: transaction.trx_id
          });
        });
      }

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

      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransactions(allTransactions);

      // Calculate stats
      const deposits = allTransactions.filter(t => t.type === 'deposit' && (t.status === 'completed' || t.status === 'paid'));
      const withdrawals = allTransactions.filter(t => t.type === 'withdrawal' && (t.status === 'completed' || t.status === 'approved'));
      
      setStats(prev => ({
        ...prev,
        totalDeposits: deposits.reduce((sum, t) => sum + t.amount_brl, 0),
        totalWithdrawals: withdrawals.reduce((sum, t) => sum + t.amount_brl, 0)
      }));

    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  // Load referrals
  const loadReferrals = async () => {
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
          created_at: ref.created_at
        }));
        setReferrals(formattedReferrals);

        setStats(prev => ({
          ...prev,
          totalReferrals: formattedReferrals.reduce((sum, r) => sum + r.commission, 0)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar referrals:', error);
    }
  };

  // Load investments
  const loadInvestments = async () => {
    try {
      const { data: investmentsData } = await supabase
        .from('user_investments')
        .select(`
          *,
          investment_plans!user_investments_investment_plan_id_fkey(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (investmentsData) {
        const formattedInvestments = investmentsData.map(inv => ({
          id: inv.id,
          amount: inv.amount,
          total_earned: inv.total_earned || 0,
          status: inv.status,
          created_at: inv.created_at,
          plan_name: (inv.investment_plans as any)?.name || 'Plano Desconhecido'
        }));
        setInvestments(formattedInvestments);

        setStats(prev => ({
          ...prev,
          totalEarnings: formattedInvestments.reduce((sum, i) => sum + i.total_earned, 0)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; text: string } } = {
      'completed': { color: 'bg-green-100 text-green-800', text: 'Concluído' },
      'paid': { color: 'bg-green-100 text-green-800', text: 'Pago' },
      'approved': { color: 'bg-green-100 text-green-800', text: 'Aprovado' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
      'active': { color: 'bg-blue-100 text-blue-800', text: 'Ativo' },
      'cancelled': { color: 'bg-red-100 text-red-800', text: 'Cancelado' }
    };
    
    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return <Badge className={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  const filteredTransactions = transactions.filter(t => 
    t.trx_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.payment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReferrals = referrals.filter(r => 
    r.referred_user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvestments = investments.filter(i => 
    i.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 rounded-lg p-3">
                <HistoryIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Histórico Completo</h1>
                <p className="text-muted-foreground">Visualize todas suas transações e atividades</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={loadAllData}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Depósitos</p>
                    <p className="text-xl font-bold text-foreground">R$ {stats.totalDeposits.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 dark:bg-red-900 rounded-lg p-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Saques</p>
                    <p className="text-xl font-bold text-foreground">R$ {stats.totalWithdrawals.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Ganhos</p>
                    <p className="text-xl font-bold text-foreground">$ {stats.totalEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-2">
                    <Wallet className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Comissões Referral</p>
                    <p className="text-xl font-bold text-foreground">$ {stats.totalReferrals.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Histórico de Atividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="transactions">Transações</TabsTrigger>
                  <TabsTrigger value="investments">Investimentos</TabsTrigger>
                  <TabsTrigger value="referrals">Referrals</TabsTrigger>
                </TabsList>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.length > 0 ? (
                          filteredTransactions.slice(0, 50).map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {transaction.type === 'deposit' ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                  )}
                                  {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">R$ {transaction.amount_brl.toFixed(2)}</div>
                                  <div className="text-sm text-muted-foreground">$ {transaction.amount.toFixed(2)}</div>
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                              <TableCell className="capitalize">{transaction.payment_type}</TableCell>
                              <TableCell>{new Date(transaction.created_at).toLocaleDateString('pt-BR')}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <div className="text-muted-foreground">Nenhuma transação encontrada</div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Investments Tab */}
                <TabsContent value="investments" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plano</TableHead>
                          <TableHead>Investido</TableHead>
                          <TableHead>Ganho</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvestments.length > 0 ? (
                          filteredInvestments.map((investment) => (
                            <TableRow key={investment.id}>
                              <TableCell className="font-medium">{investment.plan_name}</TableCell>
                              <TableCell>$ {investment.amount.toFixed(2)}</TableCell>
                              <TableCell className="text-green-600">$ {investment.total_earned.toFixed(2)}</TableCell>
                              <TableCell>{getStatusBadge(investment.status)}</TableCell>
                              <TableCell>{new Date(investment.created_at).toLocaleDateString('pt-BR')}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <div className="text-muted-foreground">Nenhum investimento encontrado</div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Referrals Tab */}
                <TabsContent value="referrals" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário Indicado</TableHead>
                          <TableHead>Comissão</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReferrals.length > 0 ? (
                          filteredReferrals.map((referral) => (
                            <TableRow key={referral.id}>
                              <TableCell className="font-medium">{referral.referred_user}</TableCell>
                              <TableCell className="text-green-600">$ {referral.commission.toFixed(2)}</TableCell>
                              <TableCell>{getStatusBadge(referral.status)}</TableCell>
                              <TableCell>{new Date(referral.created_at).toLocaleDateString('pt-BR')}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8">
                              <div className="text-muted-foreground">Nenhum referral encontrado</div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default History;