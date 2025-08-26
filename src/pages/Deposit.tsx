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
      const { data: deposits } = await supabase
        .from('digitopay_transactions')
        .select('amount, amount_brl, status')
        .eq('user_id', user.id)
        .eq('type', 'deposit');

      if (deposits) {
        const completed = deposits.filter(d => d.status === 'completed');
        const pending = deposits.filter(d => d.status === 'pending');
        
        const totalUSD = completed.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        
        setDepositBalance(totalUSD);
        setTotalDeposits(completed.length);
        setPendingDeposits(pending.length);
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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 rounded-lg p-3">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sistema de Depósitos</h1>
                <p className="text-muted-foreground">Gerencie seus depósitos de forma segura</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500">${depositBalance.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Depositado</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Stats Cards */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Depósitos Concluídos</p>
                    <p className="text-2xl font-bold text-foreground">{totalDeposits}</p>
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
                    <p className="text-2xl font-bold text-foreground">{pendingDeposits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total em USD</p>
                    <p className="text-2xl font-bold text-foreground">${depositBalance.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Deposit Interface */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-lg p-2">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Interface de Depósito</CardTitle>
                    <p className="text-muted-foreground">Escolha seu método preferido</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-500 text-sm font-medium">ONLINE</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-1 mb-6">
                  <TabsTrigger value="digitopay" className="flex items-center gap-2">
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
                    <div className="text-center py-12">
                      <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl inline-block">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-3" />
                        <p className="text-destructive font-medium mb-1">Autenticação Necessária</p>
                        <p className="text-muted-foreground text-sm">Faça login para acessar os depósitos</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Deposit;