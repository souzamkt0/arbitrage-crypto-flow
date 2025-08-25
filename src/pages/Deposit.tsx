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
  Copy
} from "lucide-react";

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("digitopay");
  const [depositBalance, setDepositBalance] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [pendingDeposits, setPendingDeposits] = useState(0);
  
  // USDT deposit states
  const [usdtAmount, setUsdtAmount] = useState("");
  const [usdtAddress] = useState("TQrZ3wVNfxN3ePJSG3LtWJwF6RtXq8rG47"); // Example USDT address
  const [showUsdtQR, setShowUsdtQR] = useState(false);
  const [usdtLoading, setUsdtLoading] = useState(false);

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

  const handleUsdtDeposit = async () => {
    if (!usdtAmount || parseFloat(usdtAmount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido em USDT",
        variant: "destructive"
      });
      return;
    }

    setUsdtLoading(true);
    try {
      // Generate QR code data
      const qrData = `${usdtAddress}?amount=${usdtAmount}`;
      setShowUsdtQR(true);
      
      // Create transaction record
      if (user) {
        await supabase.from('digitopay_transactions').insert({
          user_id: user.id,
          type: 'deposit',
          amount: parseFloat(usdtAmount),
          amount_brl: parseFloat(usdtAmount) * 5.85, // Example rate
          status: 'pending',
          trx_id: `USDT_${Date.now()}`,
          external_id: `usdt_${Date.now()}`
        });
      }

      toast({
        title: "QR Code Gerado!",
        description: "Escaneie o QR code para fazer o pagamento em USDT"
      });
    } catch (error) {
      console.error('Error creating USDT deposit:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar QR code. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUsdtLoading(false);
    }
  };

  const copyUsdtAddress = () => {
    navigator.clipboard.writeText(usdtAddress);
    toast({
      title: "Copiado!",
      description: "Endereço USDT copiado para área de transferência"
    });
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
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="digitopay" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    PIX Instantâneo
                  </TabsTrigger>
                  <TabsTrigger value="usdt" className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    USDT QR Code
                  </TabsTrigger>
                  <TabsTrigger value="bnb20" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    BNB20 Automático
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

                <TabsContent value="usdt" className="space-y-4">
                  {user ? (
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="text-center">
                        <QrCode className="h-12 w-12 text-green-600 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-foreground mb-2">Depósito USDT</h3>
                        <p className="text-muted-foreground">Digite o valor e gere o QR code para pagamento</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="usdt-amount">Valor em USDT</Label>
                          <Input
                            id="usdt-amount"
                            type="number"
                            placeholder="Digite o valor em USDT"
                            value={usdtAmount}
                            onChange={(e) => setUsdtAmount(e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <Button 
                          onClick={handleUsdtDeposit}
                          disabled={usdtLoading || !usdtAmount}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {usdtLoading ? (
                            <>
                              <Zap className="h-4 w-4 mr-2 animate-spin" />
                              Gerando QR Code...
                            </>
                          ) : (
                            <>
                              <QrCode className="h-4 w-4 mr-2" />
                              Gerar QR Code USDT
                            </>
                          )}
                        </Button>
                      </div>

                      {showUsdtQR && (
                        <div className="border border-border rounded-lg p-6 space-y-4">
                          <div className="text-center">
                            <div className="bg-white p-4 rounded-lg inline-block">
                              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                                <QrCode className="h-24 w-24 text-gray-600" />
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              QR Code para {usdtAmount} USDT
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Endereço USDT (TRC20)</Label>
                            <div className="flex gap-2">
                              <Input 
                                value={usdtAddress} 
                                readOnly 
                                className="font-mono text-xs"
                              />
                              <Button 
                                onClick={copyUsdtAddress}
                                variant="outline"
                                size="sm"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-center text-sm text-muted-foreground space-y-1">
                            <p>• Envie exatamente {usdtAmount} USDT para este endereço</p>
                            <p>• Use apenas rede TRC20 (Tron)</p>
                            <p>• Confirmação automática após 1 confirmação</p>
                          </div>
                        </div>
                      )}
                    </div>
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

                <TabsContent value="bnb20" className="space-y-4">
                  <div className="text-center py-8">
                    <div className="p-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl inline-block mx-auto">
                      <Wallet className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-foreground mb-2">Depósito Automático BNB20</h3>
                      <p className="text-muted-foreground mb-4">
                        Sistema automatizado via Binance Smart Chain (BSC)
                      </p>
                      <Button 
                        onClick={handleBNB20Navigate}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-8 py-3"
                      >
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Acessar BNB20 Gateway
                      </Button>
                      <div className="mt-4 text-sm text-muted-foreground space-y-1">
                        <p>• Processamento automático via NOWPayments</p>
                        <p>• Confirmação instantânea na blockchain</p>
                        <p>• Suporte 24/7 para transações</p>
                      </div>
                    </div>
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

export default Deposit;