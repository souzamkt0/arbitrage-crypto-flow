import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowUpRight
} from "lucide-react";

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("digitopay");
  const [depositBalance, setDepositBalance] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [pendingDeposits, setPendingDeposits] = useState(0);

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
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="digitopay" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    PIX Instantâneo
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