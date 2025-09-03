import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DigitoPayDeposit } from "@/components/DigitoPayDeposit";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Smartphone, 
  Wallet,
  AlertTriangle,
  Zap,
  Activity,
  TrendingUp,
  ArrowUpRight,
  QrCode,
  Copy,
  TestTube,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("digitopay");
  const [depositBalance, setDepositBalance] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [pendingDeposits, setPendingDeposits] = useState(0);
  
  // BNB20 deposit states
  const [bnbAmount, setBnbAmount] = useState("");
  const [bnbPaymentData, setBnbPaymentData] = useState<any>(null);
  const [showBnbQR, setShowBnbQR] = useState(false);
  const [bnbLoading, setBnbLoading] = useState(false);
  
  // Test states
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [detailedTestResult, setDetailedTestResult] = useState<any>(null);
  const [detailedTestLoading, setDetailedTestLoading] = useState(false);

  // Load deposit data
  const loadDepositData = async () => {
    if (!user) return;

    try {
      // Buscar depósitos de ambas as tabelas
      const [digitopayResult, depositsResult] = await Promise.all([
        supabase
        .from('digitopay_transactions')
        .select('amount, amount_brl, status')
        .eq('user_id', user.id)
          .eq('type', 'deposit'),
        supabase
          .from('deposits')
          .select('amount_usd, amount_brl, status')
          .eq('user_id', user.id)
      ]);

      const allDeposits = [];
      
      // Adicionar transações do DigitoPay
      if (digitopayResult.data) {
        digitopayResult.data.forEach(d => {
          allDeposits.push({
            amount: d.amount,
            amount_brl: d.amount_brl,
            status: d.status
          });
        });
      }
      
      // Adicionar depósitos da tabela deposits
      if (depositsResult.data) {
        depositsResult.data.forEach(d => {
          allDeposits.push({
            amount: d.amount_usd,
            amount_brl: d.amount_brl,
            status: d.status === 'paid' ? 'completed' : d.status
          });
        });
      }

      if (allDeposits.length > 0) {
        const completed = allDeposits.filter(d => d.status === 'completed' || d.status === 'paid');
        const pending = allDeposits.filter(d => d.status === 'pending');
        
        const totalUSD = completed.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        
        setDepositBalance(totalUSD);
        setTotalDeposits(completed.length);
        setPendingDeposits(pending.length);
      } else {
        setDepositBalance(0);
        setTotalDeposits(0);
        setPendingDeposits(0);
      }
    } catch (error) {
      console.error('Error loading deposit data:', error);
    }
  };

  useEffect(() => {
    loadDepositData();
  }, [user]);

  const handleBNB20Navigate = () => {
    navigate('/bnb20');
  };

  const handleBnbDeposit = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para realizar depósitos",
        variant: "destructive"
      });
      return;
    }

    if (!bnbAmount || parseFloat(bnbAmount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido em USD",
        variant: "destructive"
      });
      return;
    }

    setBnbLoading(true);
    try {
      // Call NOWPayments create payment endpoint with correct parameters
      const { data, error } = await supabase.functions.invoke('nowpayments-create-payment', {
        body: {
          price_amount: parseFloat(bnbAmount),
          price_currency: 'usd',
          pay_currency: 'bnbbsc', // BNB on BSC network
          order_id: `bnbbsc_${Date.now()}`,
          order_description: `Depósito BNB20 (BSC) - ${bnbAmount} USD`,
          ipn_callback_url: `${window.location.origin}/api/nowpayments-webhook`,
          success_url: `${window.location.origin}/deposit?success=true`,
          cancel_url: `${window.location.origin}/deposit?cancelled=true`
        }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        throw new Error(error.message || 'Erro na função');
      }

      if (data && data.success && data.pay_address) {
        setBnbPaymentData(data);
        setShowBnbQR(true);

        toast({
          title: "QR Code Gerado!",
          description: `Escaneie o QR code para fazer o pagamento de ${data.pay_amount} BNB`
        });
      } else {
        throw new Error(data?.error || 'Dados de pagamento inválidos');
      }
    } catch (error: any) {
      console.error('Error creating BNB deposit:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar QR code. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setBnbLoading(false);
    }
  };

  const testNowPayments = async () => {
    setTestLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-nowpayments');
      
      if (error) {
        console.error('Test Error:', error);
        setTestResult({
          success: false,
          error: error.message,
          details: 'Erro ao chamar função de teste'
        });
      } else {
        console.log('Test Result:', data);
        setTestResult(data);
      }

      toast({
        title: data?.success ? "✅ Teste Passou!" : "❌ Teste Falhou",
        description: data?.success ? "NOWPayments API funcionando" : data?.error || "Erro no teste",
        variant: data?.success ? "default" : "destructive"
      });
    } catch (error: any) {
      console.error('Test Exception:', error);
      setTestResult({
        success: false,
        error: error.message,
        details: 'Exceção durante o teste'
      });
      toast({
        title: "❌ Erro no Teste",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTestLoading(false);
    }
  };

  const testDetailedIntegration = async () => {
    setDetailedTestLoading(true);
    setDetailedTestResult(null);
    
    try {
      console.log('🧪 Iniciando teste detalhado da integração NOWPayments...');
      
      const { data, error } = await supabase.functions.invoke('test-nowpayments-integration');
      
      if (error) {
        console.error('❌ Erro na edge function:', error);
        toast({
          title: "Erro no teste detalhado",
          description: "Falha ao executar teste da integração",
          variant: "destructive",
        });
        setDetailedTestResult({
          success: false,
          error: error.message,
          summary: { overall_status: 'CRITICAL_ERROR' }
        });
        return;
      }

      console.log('📋 Resultado do teste detalhado:', data);
      setDetailedTestResult(data);
      
      if (data.success) {
        toast({
          title: "✅ Teste detalhado concluído",
          description: "Integração NOWPayments funcionando corretamente!",
        });
      } else {
        toast({
          title: "⚠️ Teste detalhado falhou",
          description: "Foram encontrados problemas na integração",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('💥 Erro crítico no teste detalhado:', error);
      toast({
        title: "Erro crítico",
        description: "Falha inesperada durante o teste",
        variant: "destructive",
      });
      setDetailedTestResult({
        success: false,
        error: error.message,
        summary: { overall_status: 'EXCEPTION' }
      });
    } finally {
      setDetailedTestLoading(false);
    }
  };

  const copyBnbAddress = () => {
    if (bnbPaymentData?.pay_address) {
      navigator.clipboard.writeText(bnbPaymentData.pay_address);
      toast({
        title: "Copiado!",
        description: "Endereço BNB copiado para área de transferência"
      });
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
        {/* Header */}
        <div className="border-b border-yellow-500/20 px-4 sm:px-6 py-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-3 bg-gradient-to-br from-yellow-500 to-amber-600 border border-yellow-500/40 shadow-[0_8px_30px_rgba(240,185,11,0.25)]">
                <Wallet className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">Sistema de Depósitos</h1>
                <p className="text-yellow-300/70">Gerencie seus depósitos de forma segura</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">${depositBalance.toFixed(2)}</div>
                <div className="text-sm text-yellow-300/70">Total Depositado</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Box de Depósito no Topo */}
          <Card className="overflow-hidden bg-gradient-to-br from-yellow-500/15 via-zinc-900/85 to-black/90 border border-yellow-500/25 mb-4 rounded-xl">
            <CardHeader className="border-b border-yellow-500/20 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg p-2 border border-yellow-500/30">
                    <Wallet className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-yellow-400">Interface de Depósito</CardTitle>
                    <p className="text-xs sm:text-sm text-yellow-300/70">Escolha seu método preferido</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400 text-xs sm:text-sm font-medium">ONLINE</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2 mb-4 sm:mb-6 bg-transparent">
                  <TabsTrigger value="digitopay" className="h-11 sm:h-10 flex items-center justify-center gap-2 bg-zinc-900/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-600 data-[state=active]:text-black border border-yellow-500/25 rounded-lg">
                    <Smartphone className="h-4 w-4" />
                    PIX Automático
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="digitopay" className="space-y-4">
                  {user ? (
                    <DigitoPayDeposit 
                      onSuccess={() => {
                        toast({
                          title: "🎉 Depósito Enviado!",
                          description: "Seu depósito foi processado com sucesso",
                        });
                        loadDepositData();
                      }} 
                    />
                  ) : (
                    <div className="text-center py-10 sm:py-12">
                      <div className="p-5 sm:p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl inline-block">
                        <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                        <p className="text-yellow-300 font-medium mb-1">Autenticação Necessária</p>
                        <p className="text-yellow-300/70 text-sm">Faça login para acessar os depósitos</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Stats Cards */}
            <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border border-yellow-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-yellow-500/15 border border-yellow-500/30">
                    <Activity className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-yellow-300/80">Depósitos Concluídos</p>
                    <p className="text-2xl font-bold text-yellow-400">{totalDeposits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border border-yellow-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-yellow-500/15 border border-yellow-500/30">
                    <Activity className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-yellow-300/80">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-400">{pendingDeposits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-zinc-900/90 to-black/90 border border-yellow-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-yellow-500/15 border border-yellow-500/30">
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-yellow-300/80">Total em USD</p>
                    <p className="text-2xl font-bold text-yellow-400">${depositBalance.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* (Box de depósito já está no topo) */}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Deposit;