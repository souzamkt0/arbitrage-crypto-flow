import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DollarSign,
  CreditCard,
  Coins
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
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'usdt' | null>(null);

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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black p-2 sm:p-4">
        {/* Header simplificado amarelo/preto - Responsivo */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">Saque PIX</h1>
            </div>
                <div className="flex items-center gap-2">
              <div className="text-base sm:text-lg font-bold text-yellow-400">
                    {showBalance ? `$${totalBalance.toFixed(2)}` : '••••••'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                className="text-yellow-400 hover:text-yellow-300"
                  >
                    {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-yellow-300/70 mt-1">Saques instantâneos • Processamento rápido</p>
        </div>

        {/* Stats Cards - Responsivo com tema amarelo/preto */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-yellow-500/20 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                  </div>
                <div className="flex-1">
                  <p className="text-xs text-yellow-300/70">Principal</p>
                  <p className="text-sm sm:text-lg font-bold text-yellow-400">
                    {showBalance ? `$${userBalance.toFixed(2)}` : '••••'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-yellow-500/20 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                  </div>
                <div className="flex-1">
                  <p className="text-xs text-yellow-300/70">Referral</p>
                  <p className="text-sm sm:text-lg font-bold text-yellow-400">
                    {showBalance ? `$${referralBalance.toFixed(2)}` : '••••'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-yellow-500/20 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                  </div>
                <div className="flex-1">
                  <p className="text-xs text-yellow-300/70">Concluídos</p>
                  <p className="text-sm sm:text-lg font-bold text-yellow-400">{totalWithdrawals}</p>
                </div>
                </div>
              </CardContent>
            </Card>

          <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-yellow-500/20 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                  </div>
                <div className="flex-1">
                  <p className="text-xs text-yellow-300/70">Pendentes</p>
                  <p className="text-sm sm:text-lg font-bold text-yellow-400">{pendingWithdrawals}</p>
                </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Main Withdrawal Card - Tema amarelo/preto */}
        <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-sm border border-yellow-500/20 shadow-2xl shadow-yellow-500/10">
          <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg border border-yellow-500/30">
                  <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-yellow-400">
                    Saque PIX Instantâneo
                  </CardTitle>
                  <CardDescription className="text-yellow-300/70 text-xs sm:text-sm">
                    Processamento rápido • Sem taxas ocultas
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-400 text-xs sm:text-sm font-medium">ATIVO</span>
                </div>
              </div>
            </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/25 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Limite: 1 saque por dia</span>
              </div>
              </div>

              {user ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Seleção do Método de Saque */}
                  {!selectedMethod && (
                    <div className="space-y-4">
                      <h3 className="text-center text-yellow-400 font-semibold text-sm sm:text-base mb-4">
                        Escolha o método de saque
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Opção PIX */}
                        <Card 
                          className="cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br from-zinc-900/90 to-black/90 border border-yellow-500/20 hover:border-yellow-400 hover:ring-2 hover:ring-yellow-400/30"
                          onClick={() => setSelectedMethod('pix')}
                        >
                          <CardContent className="p-4 sm:p-6 text-center">
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg mx-auto mb-3 w-fit">
                              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                            </div>
                            <h4 className="text-base sm:text-lg font-bold text-yellow-400 mb-2">Saque PIX</h4>
                            <p className="text-xs sm:text-sm text-yellow-300/70 mb-3">
                              Receba em sua conta bancária
                            </p>
                            <div className="space-y-1 text-xs text-yellow-300/50">
                              <p>✓ Processamento em 24h</p>
                              <p>✓ Taxa: 5%</p>
                              <p>✓ Mínimo: $20 USD</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Opção USDT */}
                        <Card 
                          className="cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br from-zinc-900/90 to-black/90 border border-yellow-500/20 hover:border-yellow-400 hover:ring-2 hover:ring-yellow-400/30"
                          onClick={() => setSelectedMethod('usdt')}
                        >
                          <CardContent className="p-4 sm:p-6 text-center">
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg mx-auto mb-3 w-fit">
                              <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                            </div>
                            <h4 className="text-base sm:text-lg font-bold text-yellow-400 mb-2">Saque USDT</h4>
                            <p className="text-xs sm:text-sm text-yellow-300/70 mb-3">
                              Receba em sua carteira crypto
                            </p>
                            <div className="space-y-1 text-xs text-yellow-300/50">
                              <p>✓ Processamento instantâneo</p>
                              <p>✓ Taxa: 2%</p>
                              <p>✓ Mínimo: $10 USD</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Formulário de Saque PIX */}
                  {selectedMethod === 'pix' && (
                    <div className="space-y-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMethod(null)}
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20"
                      >
                        ← Voltar
                      </Button>
                  <DigitoPayWithdrawal 
                    userBalance={userBalance}
                    referralBalance={referralBalance}
                    onSuccess={() => {
                      toast({
                            title: "✅ SAQUE PIX ENVIADO!",
                        description: "Seu saque foi processado com sucesso",
                      });
                      loadWithdrawalData();
                          setSelectedMethod(null);
                        }} 
                      />
                    </div>
                  )}

                  {/* Formulário de Saque USDT */}
                  {selectedMethod === 'usdt' && (
                    <div className="space-y-4">
                        <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMethod(null)}
                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20"
                      >
                        ← Voltar
                        </Button>
                      <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border-yellow-500/20">
                        <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-b border-yellow-500/20">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg">
                              <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                            </div>
                            <div>
                              <CardTitle className="text-base sm:text-lg text-yellow-400">Saque USDT (TRC-20)</CardTitle>
                              <CardDescription className="text-xs sm:text-sm text-yellow-300/70">
                                Receba USDT em sua carteira
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          <div className="text-center py-8">
                            <Coins className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                            <p className="text-yellow-400 font-semibold mb-2">Em Breve</p>
                            <p className="text-yellow-300/70 text-sm">
                              Funcionalidade de saque em USDT será liberada em breve.
                            </p>
                            <p className="text-yellow-300/50 text-xs mt-2">
                              Por enquanto, utilize o saque via PIX.
                            </p>
                      </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="p-4 sm:p-6 bg-red-500/10 border border-red-500/20 rounded-xl inline-block">
                    <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 text-base sm:text-lg font-medium">Autenticação Necessária</p>
                    <p className="text-red-300/70 mt-2 text-xs sm:text-sm">Faça login para acessar o sistema de saques</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </ErrorBoundary>
  );
};

export default Withdrawal;