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
  History,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp
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
      <div className="min-h-screen bg-black text-white">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
              className="hover:bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 p-3 rounded-xl transition-all duration-300 hover:scale-105"
          >
              <ArrowLeft className="h-5 w-5" />
          </Button>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Depósito
              </h1>
              <p className="text-gray-400 text-lg">Adicione fundos à sua conta de forma segura</p>
            </div>
            <div className="hidden sm:flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl">
              <Shield className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">100% Seguro</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Depósitos Hoje</p>
                    <p className="text-2xl font-bold text-white">$12,450</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Tempo Médio</p>
                    <p className="text-2xl font-bold text-white">2 min</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold text-white">99.8%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
        </div>

          {/* Main Deposit Card */}
          <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-500/20 backdrop-blur-sm shadow-2xl">
            <CardHeader className="border-b border-yellow-500/20">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Wallet className="h-6 w-6 text-yellow-400" />
                </div>
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Escolha o método de depósito
                </span>
            </CardTitle>
          </CardHeader>
            <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-800/50 border border-yellow-500/20 p-1 rounded-xl">
                  <TabsTrigger 
                    value="digitopay" 
                    className="flex items-center space-x-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black rounded-lg transition-all duration-300"
                  >
                    <Smartphone className="h-5 w-5" />
                    <span className="font-medium">PIX Instantâneo</span>
                </TabsTrigger>
                  <TabsTrigger 
                    value="usdt" 
                    className="flex items-center space-x-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black rounded-lg transition-all duration-300"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium">USDT BNB20</span>
                </TabsTrigger>
              </TabsList>

              {/* DigitoPay Tab */}
                <TabsContent value="digitopay" className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-3 bg-yellow-500/20 border border-yellow-500/30 px-6 py-3 rounded-full">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Depósito Instantâneo via PIX</span>
                  </div>
                </div>

                {user ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="order-1">
                        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-yellow-500/20">
                          <CardContent className="p-6">
                      <DigitoPayDeposit onSuccess={() => {
                        toast({
                          title: "Sucesso!",
                          description: "Depósito processado com sucesso",
                        });
                      }} />
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="space-y-4 order-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <History className="h-5 w-5 text-yellow-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-white">Histórico de Transações</h3>
                        </div>
                        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-yellow-500/20">
                          <CardContent className="p-6">
                      <div className="max-h-[60vh] overflow-y-auto">
                        <DigitoPayHistory />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl inline-block">
                        <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">Faça login para acessar o sistema de depósitos</p>
                  </div>
                  </div>
                )}
              </TabsContent>

              {/* USDT BNB20 Tab */}
                <TabsContent value="usdt" className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-3 bg-yellow-500/20 border border-yellow-500/30 px-6 py-3 rounded-full">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Depósito via USDT BNB20 - 15 min</span>
                  </div>
                </div>

                  <form onSubmit={handleBnbSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="usdt-amount" className="text-yellow-400 font-medium">Valor (USDT) *</Label>
                      <div className="relative">
                          <DollarSign className="absolute left-4 top-4 h-5 w-5 text-yellow-400" />
                        <Input
                          id="usdt-amount"
                          type="number"
                          placeholder="100.00"
                            className="pl-12 bg-gray-800/50 border border-yellow-500/20 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20 h-12 rounded-xl"
                          min="10"
                          step="0.01"
                          value={bnbForm.amount}
                          onChange={(e) => setBnbForm({...bnbForm, amount: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                      <div className="space-y-3">
                        <Label htmlFor="sender-name" className="text-yellow-400 font-medium">Nome do Remetente *</Label>
                      <Input
                        id="sender-name"
                        type="text"
                        placeholder="Seu nome completo"
                          className="bg-gray-800/50 border border-yellow-500/20 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20 h-12 rounded-xl"
                        value={bnbForm.senderName}
                        onChange={(e) => setBnbForm({...bnbForm, senderName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* BNB20 Address */}
                    <div className="space-y-3">
                      <Label className="text-yellow-400 font-medium">Endereço da Carteira (BNB20)</Label>
                      <div className="flex items-center space-x-3">
                      <Input
                        value={bnbAddress}
                        readOnly
                          className="font-mono text-sm bg-gray-800/50 border border-yellow-500/20 text-yellow-400 rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(bnbAddress, "Endereço")}
                          className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 p-3 rounded-xl transition-all duration-300 hover:scale-105"
                      >
                          <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                    <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 p-6 rounded-xl">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-yellow-400 mb-3 text-lg">⚠️ Importante:</h4>
                          <ul className="text-gray-300 space-y-2">
                            <li className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>Envie apenas USDT na rede BNB Smart Chain (BEP20)</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>Não envie outras moedas para este endereço</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>Confirme a rede antes de enviar</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>O depósito será processado em até 15 minutos</span>
                            </li>
                    </ul>
                  </div>
                      </div>
                    </Card>

                  <Button 
                    type="submit" 
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 rounded-xl text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                    disabled={isLoading}
                  >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                          <span>Processando...</span>
                        </div>
                      ) : (
                        "Confirmar Depósito"
                      )}
                  </Button>
                </form>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

        {/* Support Info */}
          <Card className="mt-8 bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-500/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl inline-block mb-6">
                <Shield className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Precisa de ajuda?</h3>
              <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
                Nossa equipe especializada está disponível 24/7 para auxiliar com seus depósitos e garantir uma experiência segura
              </p>
              <Button 
                variant="outline" 
                size="lg"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
              >
                Falar com Suporte
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default Deposit;