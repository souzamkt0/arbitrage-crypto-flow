import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DigitoPayDeposit } from "@/components/DigitoPayDeposit";
import { DigitoPayHistory } from "@/components/DigitoPayHistory";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Copy, 
  DollarSign,
  Wallet,
  History
} from "lucide-react";

const Deposit = () => {
  console.log('🚀 Deposit component loading...');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  console.log('👤 User:', user);
  console.log('📋 Profile:', profile);
  const [activeTab, setActiveTab] = useState("digitopay");
  const [isLoading, setIsLoading] = useState(false);
  const [bnbAddress] = useState("0x742d35Cc6634C0532925a3b8D39C1234567890AB");

  // BNB Form State
  const [bnbForm, setBnbForm] = useState({
    amount: "",
    senderName: ""
  });



  const handleBnbSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bnbForm.amount || !bnbForm.senderName) {
      toast({
        title: "Campos obrigatórios", 
        description: "Preencha todos os campos para o depósito USDT BNB20",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simular processamento
    setTimeout(() => {
      toast({
        title: "Informações enviadas!",
        description: "Envie o USDT para o endereço fornecido. O depósito será processado em até 15 minutos.",
      });
      
      // Salvar dados do depósito
      const depositData = {
        type: "USDT_BNB20",
        amount: bnbForm.amount,
        senderName: bnbForm.senderName,
        address: bnbAddress,
        timestamp: new Date().toISOString(),
        status: "pending"
      };
      
      const deposits = JSON.parse(localStorage.getItem("alphabit_deposits") || "[]");
      deposits.push(depositData);
      localStorage.setItem("alphabit_deposits", JSON.stringify(deposits));
      
      setIsLoading(false);
    }, 1500);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência`,
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary p-4">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6 animate-fade-in">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="hover-scale"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Depósito</h1>
            <p className="text-muted-foreground">Adicione fundos à sua conta</p>
          </div>
        </div>

        {/* Deposit Methods */}
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span>Escolha o método de depósito</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="digitopay" className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <span>PIX</span>
                </TabsTrigger>
                <TabsTrigger value="usdt" className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>USDT BNB20</span>
                </TabsTrigger>
              </TabsList>

              {/* DigitoPay Tab */}
              <TabsContent value="digitopay" className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <Smartphone className="h-4 w-4" />
                    <span>Depósito via DigitoPay - Integração Real</span>
                  </div>
                </div>

                {user ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DigitoPayDeposit onSuccess={() => {
                      toast({
                        title: "Sucesso!",
                        description: "Depósito processado com sucesso",
                      });
                    }} />
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        <h3 className="font-semibold">Histórico de Transações</h3>
                      </div>
                      <DigitoPayHistory />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Faça login para acessar o DigitoPay</p>
                  </div>
                )}
              </TabsContent>

              {/* USDT BNB20 Tab */}
              <TabsContent value="usdt" className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    <CreditCard className="h-4 w-4" />
                    <span>Depósito via USDT BNB20 - 15 min</span>
                  </div>
                </div>

                <form onSubmit={handleBnbSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="usdt-amount">Valor (USDT) *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="usdt-amount"
                          type="number"
                          placeholder="100.00"
                          className="pl-9"
                          min="10"
                          step="0.01"
                          value={bnbForm.amount}
                          onChange={(e) => setBnbForm({...bnbForm, amount: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sender-name">Nome do Remetente *</Label>
                      <Input
                        id="sender-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={bnbForm.senderName}
                        onChange={(e) => setBnbForm({...bnbForm, senderName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* BNB20 Address */}
                  <div className="space-y-2">
                    <Label>Endereço da Carteira (BNB20)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={bnbAddress}
                        readOnly
                        className="font-mono text-sm bg-muted"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(bnbAddress, "Endereço")}
                        className="hover-scale"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">⚠️ Importante:</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Envie apenas USDT na rede BNB Smart Chain (BEP20)</li>
                      <li>• Não envie outras moedas para este endereço</li>
                      <li>• Confirme a rede antes de enviar</li>
                      <li>• O depósito será processado em até 15 minutos</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full hover-scale animate-fade-in"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processando..." : "Confirmar Depósito"}
                  </Button>
                </form>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

        {/* Support Info */}
        <Card className="mt-6 animate-fade-in">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Precisa de ajuda?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Nossa equipe está disponível 24/7 para auxiliar com seus depósitos
              </p>
              <Button variant="outline" size="sm">
                Falar com Suporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default Deposit;