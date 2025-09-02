import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Users,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  BarChart3,
  Star,
  Zap
} from "lucide-react";
import { SuperPartnerBox } from "@/components/SuperPartnerBox";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PartnerData {
  user_id: string;
  email: string;
  display_name: string;
  username: string;
  role: string;
  balance: number;
  total_profit: number;
  partner_balance: number;
  last_withdrawal: string;
  total_commission: number;
  status: string;
}

const Partners = () => {
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [nextWithdrawalDate, setNextWithdrawalDate] = useState<Date | null>(null);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Verificar se é sexta-feira
  const isFriday = () => {
    const today = new Date();
    return today.getDay() === 5; // 5 = Sexta-feira
  };

  // Calcular próxima sexta-feira
  const getNextFriday = () => {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    nextFriday.setHours(0, 0, 0, 0);
    return nextFriday;
  };

  // Verificar se pode sacar (sexta-feira e tem saldo)
  const checkWithdrawalEligibility = () => {
    const friday = isFriday();
    const hasBalance = partnerData?.partner_balance && partnerData.partner_balance > 0;
    setCanWithdraw(friday && hasBalance);
    setNextWithdrawalDate(getNextFriday());
  };

  useEffect(() => {
    if (user && profile) {
      loadPartnerData();
    }
  }, [user, profile]);

  useEffect(() => {
    if (partnerData) {
      checkWithdrawalEligibility();
    }
  }, [partnerData]);

  const loadPartnerData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('🔄 Carregando dados do sócio...');

      // Buscar dados do sócio
      const { data: partner, error: partnerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'partner')
        .single();

      if (partnerError) {
        console.error('❌ Erro ao carregar dados do sócio:', partnerError);
        toast({
          title: "Erro",
          description: "Você não possui permissão de sócio.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Dados do sócio carregados:', partner);
      setPartnerData(partner);

      // Calcular saldo de sócio (1% dos depósitos)
      await calculatePartnerBalance(partner);

      // Carregar histórico de depósitos
      await loadDeposits();

      // Carregar histórico de saques
      await loadWithdrawals();

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do sócio.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePartnerBalance = async (partner: any) => {
    try {
      // Buscar todos os depósitos (DigitoPay + USDT)
      const { data: digitopayDeposits } = await supabase
        .from('digitopay_transactions')
        .select('amount_brl')
        .eq('type', 'deposit')
        .eq('status', 'completed');

      const { data: usdtDeposits } = await supabase
        .from('deposits')
        .select('amount_brl')
        .eq('status', 'completed');

      // Calcular total de depósitos
      const digitopayTotal = digitopayDeposits?.reduce((sum, deposit) => sum + (deposit.amount_brl || 0), 0) || 0;
      const usdtTotal = usdtDeposits?.reduce((sum, deposit) => sum + (deposit.amount_brl || 0), 0) || 0;
      const totalDeposits = digitopayTotal + usdtTotal;

      // Calcular comissão do sócio (1%)
      const commission = totalDeposits * 0.01;

      // Buscar saques já realizados
      const { data: withdrawals } = await supabase
        .from('partner_withdrawals')
        .select('amount')
        .eq('partner_id', user.id);

      const totalWithdrawn = withdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;

      // Saldo disponível = comissão total - saques realizados
      const availableBalance = commission - totalWithdrawn;

      // Atualizar dados do sócio
      const updatedPartner = {
        ...partner,
        partner_balance: Math.max(0, availableBalance),
        total_commission: commission,
        total_deposits: totalDeposits
      };

      setPartnerData(updatedPartner);

      console.log('💰 Cálculos do sócio:', {
        totalDeposits,
        commission,
        totalWithdrawn,
        availableBalance
      });

    } catch (error) {
      console.error('❌ Erro ao calcular saldo:', error);
    }
  };

  const loadDeposits = async () => {
    try {
      // Buscar depósitos recentes
      const { data: digitopayDeposits } = await supabase
        .from('digitopay_transactions')
        .select('*')
        .eq('type', 'deposit')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: usdtDeposits } = await supabase
        .from('deposits')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      // Combinar e formatar depósitos
      const allDeposits = [
        ...(digitopayDeposits?.map(d => ({
          ...d,
          type: 'DigitoPay',
          amount: d.amount_brl
        })) || []),
        ...(usdtDeposits?.map(d => ({
          ...d,
          type: 'USDT',
          amount: d.amount_brl
        })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setDeposits(allDeposits.slice(0, 10));

    } catch (error) {
      console.error('❌ Erro ao carregar depósitos:', error);
    }
  };

  const loadWithdrawals = async () => {
    try {
      const { data: withdrawals } = await supabase
        .from('partner_withdrawals')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setWithdrawals(withdrawals || []);

    } catch (error) {
      console.error('❌ Erro ao carregar saques:', error);
    }
  };

  const handleWithdrawal = async () => {
    if (!canWithdraw || !partnerData) return;

    try {
      setIsWithdrawing(true);

      // Registrar saque
      const { error: withdrawalError } = await supabase
        .from('partner_withdrawals')
        .insert({
          partner_id: user.id,
          amount: partnerData.partner_balance,
          status: 'pending',
          withdrawal_date: new Date().toISOString()
        });

      if (withdrawalError) {
        throw withdrawalError;
      }

      // Atualizar saldo do sócio
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          partner_balance: 0,
          last_withdrawal: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "✅ Saque solicitado!",
        description: `Saque de R$ ${partnerData.partner_balance.toFixed(2)} solicitado com sucesso.`,
      });

      // Recarregar dados
      await loadPartnerData();

    } catch (error) {
      console.error('❌ Erro ao solicitar saque:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao solicitar saque. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!partnerData) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Crown className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Acesso Restrito
              </h2>
              <p className="text-muted-foreground">
                Esta área é exclusiva para sócios do sistema.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Área do Sócio
              </h1>
              <p className="text-muted-foreground">
                Bem-vindo, {partnerData.display_name || partnerData.username}!
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Crown className="h-4 w-4 mr-2" />
            Sócio Premium
          </Badge>
        </div>

        {/* Super Partner Box */}
        <SuperPartnerBox
          partnerBalance={partnerData.partner_balance || 0}
          totalCommission={partnerData.total_commission || 0}
          canWithdraw={canWithdraw}
          nextWithdrawalDate={nextWithdrawalDate}
          isWithdrawing={isWithdrawing}
          onWithdraw={handleWithdrawal}
        />

        {/* Recent Deposits */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Depósitos Recentes (1% de Comissão)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Comissão (1%)</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((deposit, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">
                          {deposit.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(deposit.amount || 0)}</TableCell>
                      <TableCell className="text-yellow-500 font-semibold">
                        {formatCurrency((deposit.amount || 0) * 0.01)}
                      </TableCell>
                      <TableCell>{formatDate(deposit.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {deposits.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum depósito encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Histórico de Saques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatCurrency(withdrawal.amount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={withdrawal.status === 'completed' ? 'default' : 'secondary'}
                          className={withdrawal.status === 'completed' ? 'bg-trading-green' : ''}
                        >
                          {withdrawal.status === 'completed' ? 'Concluído' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(withdrawal.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {withdrawals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Nenhum saque realizado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Partners;
