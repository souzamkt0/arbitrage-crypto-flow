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
import { DatabaseTest } from "@/components/DatabaseTest";
import { DigitoPayDebug } from "@/components/DigitoPayDebug";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Copy, 
  CheckCircle2,
  DollarSign,
  QrCode,
  Wallet,
  RefreshCw,
  TrendingUp,
  History,
  TestTube
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
  const [pixData, setPixData] = useState<{code: string, qrCode: string} | null>(null);
  const [bnbAddress] = useState("0x742d35Cc6634C0532925a3b8D39C1234567890AB");
  const [usdRate, setUsdRate] = useState(5.45); // Taxa USD/BRL padrão
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  
  // PIX Form State
  const [pixForm, setPixForm] = useState({
    amountUSD: "",
    amountBRL: "",
    holderName: "",
    cpf: ""
  });

  // BNB Form State
  const [bnbForm, setBnbForm] = useState({
    amount: "",
    senderName: ""
  });

  // Buscar cotação do dólar
  const fetchUSDRate = async () => {
    setIsLoadingRate(true);
    try {
      // Usando uma API gratuita para cotação
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data.rates?.BRL) {
        setUsdRate(data.rates.BRL);
      }
    } catch (error) {
      console.log('Erro ao buscar cotação, usando valor padrão');
      // Usar valor padrão em caso de erro
      setUsdRate(5.45);
    } finally {
      setIsLoadingRate(false);
    }
  };

  useEffect(() => {
    fetchUSDRate();
  }, []);

  // Converter USD para BRL
  const convertUSDToBRL = (usdAmount: string) => {
    if (!usdAmount) return "";
    const usd = parseFloat(usdAmount);
    if (isNaN(usd)) return "";
    return (usd * usdRate).toFixed(2);
  };

  // Converter BRL para USD
  const convertBRLToUSD = (brlAmount: string) => {
    if (!brlAmount) return "";
    const brl = parseFloat(brlAmount);
    if (isNaN(brl)) return "";
    return (brl / usdRate).toFixed(2);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Símbolo PIX em SVG
  const PixIcon = () => (
    <svg width="20" height="20" viewBox="0 0 512 512" className="inline-block">
      <path fill="currentColor" d="M242.4 292.5C247.8 287.1 255.4 284 263.4 284h91.2c18.7 0 37.1 7.4 50.5 20.8l78.3 78.3c3.1 3.1 8.2 3.1 11.3 0l27.3-27.3c3.1-3.1 3.1-8.2 0-11.3L430.6 252.1c-25-25-58.8-39.1-94.2-39.1H263.4c-8 0-15.6-3.2-21.2-8.8l-139.1-139.1c-3.1-3.1-8.2-3.1-11.3 0L64.5 92.4c-3.1 3.1-3.1 8.2 0 11.3l139.1 139.1c5.6 5.6 8.8 13.2 8.8 21.2v73c0 8-3.2 15.6-8.8 21.2L64.5 497.3c-3.1 3.1-3.1 8.2 0 11.3l27.3 27.3c3.1 3.1 8.2 3.1 11.3 0l139.1-139.1c5.6-5.6 13.2-8.8 21.2-8.8h73c35.4 0 69.2-14.1 94.2-39.1l91.4-91.4c3.1-3.1 3.1-8.2 0-11.3l-27.3-27.3c-3.1-3.1-8.2-3.1-11.3 0l-78.3 78.3c-13.4 13.4-31.7 20.8-50.5 20.8h-91.2c-8 0-15.6 3.2-21.2 8.8z"/>
    </svg>
  );

  const handlePixSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pixForm.amountBRL || !pixForm.holderName || !pixForm.cpf) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para gerar o PIX",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simular geração do PIX
    setTimeout(() => {
      const mockPixCode = `00020126580014BR.GOV.BCB.PIX2536pix@alphabit.com.br5204000053039865406${pixForm.amountBRL}5802BR5925${pixForm.holderName}6009SAO PAULO62070503***63041234`;
      
      setPixData({
        code: mockPixCode,
        qrCode: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJxciIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj4KICAgICAgPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJ3aGl0ZSIvPgogICAgICA8cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImJsYWNrIi8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI3FyKSIvPgo8L3N2Zz4K`
      });

      toast({
        title: "PIX gerado com sucesso!",
        description: "Use o código ou QR Code para realizar o pagamento",
      });
      
      setIsLoading(false);
    }, 2000);
  };

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
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="digitopay" className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <span>DigitoPay PIX</span>
                </TabsTrigger>
                <TabsTrigger value="pix" className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <span>PIX Simulado</span>
                </TabsTrigger>
                <TabsTrigger value="usdt" className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>USDT BNB20</span>
                </TabsTrigger>
                <TabsTrigger value="test" className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Teste DB</span>
                </TabsTrigger>
                <TabsTrigger value="debug" className="flex items-center space-x-2">
                  <TestTube className="h-4 w-4" />
                  <span>Debug</span>
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

              {/* PIX Simulado Tab */}
              <TabsContent value="pix" className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <PixIcon />
                    <span>Depósito via PIX - Instantâneo</span>
                  </div>
                </div>

                {/* Cotação USD/BRL */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">Cotação USD/BRL:</span>
                        <span className="text-lg font-bold text-blue-600">
                          R$ {usdRate.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchUSDRate}
                        disabled={isLoadingRate}
                        className="hover-scale"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoadingRate ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>

                {!pixData ? (
                  <form onSubmit={handlePixSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="usd-amount">Valor (USD) *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="usd-amount"
                            type="number"
                            placeholder="100.00"
                            className="pl-9"
                            min="10"
                            step="0.01"
                            value={pixForm.amountUSD}
                            onChange={(e) => {
                              const usdValue = e.target.value;
                              const brlValue = convertUSDToBRL(usdValue);
                              setPixForm({
                                ...pixForm, 
                                amountUSD: usdValue,
                                amountBRL: brlValue
                              });
                            }}
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Valor mínimo: $10.00 USD
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brl-amount">Valor (BRL) *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-sm text-muted-foreground">R$</span>
                          <Input
                            id="brl-amount"
                            type="number"
                            placeholder="545.00"
                            className="pl-9 bg-muted"
                            value={pixForm.amountBRL}
                            onChange={(e) => {
                              const brlValue = e.target.value;
                              const usdValue = convertBRLToUSD(brlValue);
                              setPixForm({
                                ...pixForm,
                                amountBRL: brlValue,
                                amountUSD: usdValue
                              });
                            }}
                            required
                          />
                        </div>
                        <p className="text-xs text-green-600 font-medium">
                          ≈ ${pixForm.amountUSD || "0.00"} USD
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF do Titular *</Label>
                        <Input
                          id="cpf"
                          type="text"
                          placeholder="000.000.000-00"
                          maxLength={14}
                          value={pixForm.cpf}
                          onChange={(e) => {
                            const formatted = formatCPF(e.target.value);
                            setPixForm({...pixForm, cpf: formatted});
                          }}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="holder-name">Nome do Titular *</Label>
                        <Input
                          id="holder-name"
                          type="text"
                          placeholder="Nome completo como no CPF"
                          value={pixForm.holderName}
                          onChange={(e) => setPixForm({...pixForm, holderName: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full hover-scale animate-fade-in"
                      disabled={isLoading}
                    >
                      {isLoading ? "Gerando PIX..." : "Gerar PIX"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">PIX Gerado com Sucesso!</h3>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">
                          Valor: <span className="font-semibold text-primary">R$ {pixForm.amountBRL}</span>
                        </p>
                        <p className="text-sm text-green-600">
                          Equivalente a: <span className="font-semibold">${pixForm.amountUSD} USD</span>
                        </p>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg">
                        <img 
                          src={pixData.qrCode} 
                          alt="QR Code PIX" 
                          className="w-48 h-48"
                        />
                      </div>
                    </div>

                    {/* PIX Code */}
                    <div className="space-y-2">
                      <Label>Código PIX Copia e Cola</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={pixData.code}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(pixData.code, "Código PIX")}
                          className="hover-scale"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Instruções:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Abra seu app bancário ou carteira digital</li>
                        <li>• Escaneie o QR Code ou use o código PIX</li>
                        <li>• O depósito será processado instantaneamente</li>
                        <li>• Você receberá uma confirmação por email</li>
                      </ul>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setPixData(null);
                        setPixForm({amountUSD: "", amountBRL: "", holderName: "", cpf: ""});
                      }}
                      className="w-full"
                    >
                      Gerar Novo PIX
                    </Button>
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

              {/* Teste de Banco de Dados Tab */}
              <TabsContent value="test" className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <RefreshCw className="h-4 w-4" />
                    <span>Teste de Conexão - Banco de Dados</span>
                  </div>
                </div>
                <DatabaseTest />
              </TabsContent>

              {/* Debug DigitoPay Tab */}
              <TabsContent value="debug" className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    <TestTube className="h-4 w-4" />
                    <span>Debug - Configurações DigitoPay</span>
                  </div>
                </div>
                <DigitoPayDebug />
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