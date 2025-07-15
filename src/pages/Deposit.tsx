import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Copy, 
  CheckCircle2,
  DollarSign,
  QrCode,
  Wallet
} from "lucide-react";

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pix");
  const [isLoading, setIsLoading] = useState(false);
  const [pixData, setPixData] = useState<{code: string, qrCode: string} | null>(null);
  const [bnbAddress] = useState("0x742d35Cc6634C0532925a3b8D39C1234567890AB");
  
  // PIX Form State
  const [pixForm, setPixForm] = useState({
    amount: "",
    holderName: "",
    cpf: ""
  });

  // BNB Form State
  const [bnbForm, setBnbForm] = useState({
    amount: "",
    senderName: ""
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const handlePixSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pixForm.amount || !pixForm.holderName || !pixForm.cpf) {
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
      const mockPixCode = `00020126580014BR.GOV.BCB.PIX2536pix@alphabit.com.br5204000053039865406${pixForm.amount}5802BR5925${pixForm.holderName}6009SAO PAULO62070503***63041234`;
      
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
                <TabsTrigger value="pix" className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <span>PIX</span>
                </TabsTrigger>
                <TabsTrigger value="usdt" className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>USDT BNB20</span>
                </TabsTrigger>
              </TabsList>

              {/* PIX Tab */}
              <TabsContent value="pix" className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <Smartphone className="h-4 w-4" />
                    <span>Depósito via PIX - Instantâneo</span>
                  </div>
                </div>

                {!pixData ? (
                  <form onSubmit={handlePixSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pix-amount">Valor (R$) *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="pix-amount"
                            type="number"
                            placeholder="100.00"
                            className="pl-9"
                            min="10"
                            step="0.01"
                            value={pixForm.amount}
                            onChange={(e) => setPixForm({...pixForm, amount: e.target.value})}
                            required
                          />
                        </div>
                      </div>

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
                      <p className="text-muted-foreground">
                        Valor: <span className="font-semibold text-primary">R$ {pixForm.amount}</span>
                      </p>
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
                        setPixForm({amount: "", holderName: "", cpf: ""});
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
  );
};

export default Deposit;