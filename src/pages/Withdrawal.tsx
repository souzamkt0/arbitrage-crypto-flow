import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DigitoPayWithdrawal } from "@/components/DigitoPayWithdrawal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowDown,
  Wallet,
  AlertTriangle,
  Activity,
  TrendingDown,
  Eye,
  EyeOff,
  ArrowUpRight,
  QrCode
} from "lucide-react";

const Withdrawal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [userBalance, setUserBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [showBalance, setShowBalance] = useState(true);

  // Load withdrawal data
  const loadWithdrawalData = async () => {
    if (!user) return;

    try {
      // Load user balances
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance, referral_balance')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserBalance(profile.balance || 0);
        setReferralBalance(profile.referral_balance || 0);
      }

      // Load withdrawal data
      const { data: withdrawals } = await supabase
        .from('digitopay_transactions')
        .select('amount, amount_brl, status')
        .eq('user_id', user.id)
        .eq('type', 'withdrawal');

      if (withdrawals) {
        const completed = withdrawals.filter(d => d.status === 'completed');
        const pending = withdrawals.filter(d => d.status === 'pending');
        
        setTotalWithdrawals(completed.length);
        setPendingWithdrawals(pending.length);
      }
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
    }
  };

  useEffect(() => {
    loadWithdrawalData();
  }, [user]);

  const totalBalance = userBalance + referralBalance;

  const handleBNB20Navigate = () => {
    navigate('/bnb20');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 rounded-lg p-3">
                <ArrowDown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sistema de Saques</h1>
                <p className="text-muted-foreground">Realize seus saques de forma segura</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-blue-500">
                    {showBalance ? `$${totalBalance.toFixed(2)}` : '••••••'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">Saldo Disponível</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Balance Cards */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2">
                    <Wallet className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Principal</p>
                    <p className="text-xl font-bold text-foreground">
                      {showBalance ? `$${userBalance.toFixed(2)}` : '••••••'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Referral</p>
                    <p className="text-xl font-bold text-foreground">
                      {showBalance ? `$${referralBalance.toFixed(2)}` : '••••••'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
                    <TrendingDown className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saques Concluídos</p>
                    <p className="text-xl font-bold text-foreground">{totalWithdrawals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-2">
                    <Activity className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-xl font-bold text-foreground">{pendingWithdrawals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Withdrawal Interface */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-2">
                    <ArrowDown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Sistema de Saque</CardTitle>
                    <p className="text-muted-foreground">Escolha o tipo de saque desejado</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-500 text-sm font-medium">SISTEMA ATIVO</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-4 py-2 rounded-full text-sm">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">Limite: 1 saque por dia</span>
                </div>
              </div>

              {user ? (
                <div className="space-y-6">
                  {/* PIX Withdrawal */}
                  <DigitoPayWithdrawal 
                    userBalance={userBalance}
                    referralBalance={referralBalance}
                    onSuccess={() => {
                      toast({
                        title: "✅ SAQUE ENVIADO!",
                        description: "Seu saque foi processado com sucesso",
                      });
                      loadWithdrawalData();
                    }} 
                  />

                  {/* Additional Withdrawal Options */}
                  <div className="border-t border-border pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* USDT Withdrawal */}
                      <div className="text-center">
                        <div className="p-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl">
                          <QrCode className="h-10 w-10 text-green-600 mx-auto mb-3" />
                          <h3 className="text-lg font-bold text-foreground mb-2">Saque USDT</h3>
                          <p className="text-muted-foreground mb-4 text-sm">
                            Saque direto para carteira USDT (TRC20/ERC20)
                          </p>
                          <Button 
                            onClick={handleBNB20Navigate}
                            variant="outline"
                            className="border-green-200 dark:border-green-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                          >
                            <ArrowUpRight className="h-4 w-4 mr-2" />
                            Saque USDT
                          </Button>
                        </div>
                      </div>

                      {/* BNB20 Withdrawal */}
                      <div className="text-center">
                        <div className="p-6 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-xl">
                          <Wallet className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                          <h3 className="text-lg font-bold text-foreground mb-2">Saque BNB20</h3>
                          <p className="text-muted-foreground mb-4 text-sm">
                            Realize saques para carteiras BNB20 via BSC
                          </p>
                          <Button 
                            onClick={handleBNB20Navigate}
                            variant="outline"
                            className="border-orange-200 dark:border-orange-800 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                          >
                            <ArrowUpRight className="h-4 w-4 mr-2" />
                            Saque BNB20
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl inline-block">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive text-lg font-medium">Autenticação Necessária</p>
                    <p className="text-muted-foreground mt-2">Faça login para acessar o sistema de saques</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Withdrawal;