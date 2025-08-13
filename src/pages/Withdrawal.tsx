import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DigitoPayWithdrawal } from "@/components/DigitoPayWithdrawal";
import { DigitoPayHistory } from "@/components/DigitoPayHistory";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CreditCard,
  Wallet,
  Calendar,
  CheckCircle,
  XCircle,
  History,
  Eye,
  EyeOff,
  Smartphone
} from "lucide-react";

interface WithdrawalRequest {
  id: string;
  amount: number;
  amountBRL: number;
  type: "pix" | "usdt";
  status: "pending" | "approved" | "rejected" | "processing";
  date: string;
  holderName?: string;
  cpf?: string;
  pixKeyType?: "cpf" | "cnpj" | "email" | "phone" | "random";
  pixKey?: string;
  walletAddress?: string;
  fee: number;
  netAmount: number;
}

const Withdrawal = () => {
  const [activeTab, setActiveTab] = useState("digitopay");
  const [amount, setAmount] = useState("");
  const [amountBRL, setAmountBRL] = useState("");
  const [withdrawalType, setWithdrawalType] = useState<"pix" | "usdt">("pix");
  const [holderName, setHolderName] = useState("");
  const [cpf, setCpf] = useState("");
  const [pixKeyType, setPixKeyType] = useState<"cpf" | "cnpj" | "email" | "phone" | "random">("cpf");
  const [pixKey, setPixKey] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [exchangeRate, setExchangeRate] = useState(5.5);
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [referralBalance, setReferralBalance] = useState(0);
  const [residualBalance, setResidualBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const { user } = useAuth();
  const [dailyLimits] = useState({
    pix: { limit: 2000, used: 500 },
    usdt: { limit: 10000, used: 2000 }
  });
  
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);

  const { toast } = useToast();

  // Load user data and withdrawal history
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        // Fetch user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance, referral_balance, residual_balance')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setUserBalance(profile.balance || 0);
          setReferralBalance(profile.referral_balance || 0);
          setResidualBalance(profile.residual_balance || 0);
        }

        // Fetch withdrawal history
        const { data: withdrawals } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (withdrawals) {
          const formattedWithdrawals = withdrawals.map(w => ({
            id: w.id,
            amount: w.amount_usd,
            amountBRL: w.amount_brl || 0,
            type: w.type as "pix" | "usdt",
            status: w.status as "pending" | "approved" | "rejected" | "processing",
            date: w.created_at,
            holderName: w.holder_name,
            cpf: w.cpf,
            pixKeyType: w.pix_key_type as "cpf" | "cnpj" | "email" | "phone" | "random",
            pixKey: w.pix_key,
            walletAddress: w.wallet_address,
            fee: w.fee,
            netAmount: w.net_amount
          }));
          setWithdrawalHistory(formattedWithdrawals);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    const fetchExchangeRate = async () => {
      try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await response.json();
        if (data.rates && data.rates.BRL) {
          setExchangeRate(data.rates.BRL);
        }
      } catch (error) {
        console.error("Erro ao buscar taxa de câmbio:", error);
      }
    };

    loadUserData();
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Convert USD to BRL
  useEffect(() => {
    if (amount) {
      const usdValue = parseFloat(amount);
      if (!isNaN(usdValue)) {
        setAmountBRL((usdValue * exchangeRate).toFixed(2));
      }
    } else {
      setAmountBRL("");
    }
  }, [amount, exchangeRate]);

  // Convert BRL to USD
  const handleBRLChange = (value: string) => {
    setAmountBRL(value);
    if (value) {
      const brlValue = parseFloat(value);
      if (!isNaN(brlValue)) {
        setAmount((brlValue / exchangeRate).toFixed(2));
      }
    } else {
      setAmount("");
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted);
    if (pixKeyType === "cpf") {
      setPixKey(formatted);
    }
  };

  const calculateFee = () => {
    const amountValue = parseFloat(amount) || 0;
    const feeRate = withdrawalType === "pix" ? 0.02 : 0.05; // 2% for PIX, 5% for USDT
    return amountValue * feeRate;
  };

  const getNetAmount = () => {
    const amountValue = parseFloat(amount) || 0;
    const fee = calculateFee();
    return amountValue - fee;
  };

  const getRemainingLimit = () => {
    const currentLimit = dailyLimits[withdrawalType];
    const remainingBRL = currentLimit.limit - currentLimit.used;
    return withdrawalType === "pix" ? remainingBRL : remainingBRL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const amountValue = parseFloat(amount);
      const brlValue = parseFloat(amountBRL);
      
      // Validations
      if (amountValue <= 0) {
        throw new Error("Valor deve ser maior que zero");
      }

      if (amountValue > userBalance) {
        throw new Error("Saldo insuficiente");
      }

      const remainingLimit = getRemainingLimit();
      if (brlValue > remainingLimit) {
        throw new Error(`Limite diário excedido. Limite restante: R$ ${remainingLimit.toLocaleString()}`);
      }

      if (withdrawalType === "pix") {
        if (!holderName || !cpf || !pixKey) {
          throw new Error("Todos os campos PIX são obrigatórios");
        }
      } else {
        if (!walletAddress) {
          throw new Error("Endereço da carteira é obrigatório");
        }
      }

      // Create withdrawal request
      const newWithdrawal: WithdrawalRequest = {
        id: Date.now().toString(),
        amount: amountValue,
        amountBRL: brlValue,
        type: withdrawalType,
        status: "pending",
        date: new Date().toISOString(),
        holderName: withdrawalType === "pix" ? holderName : undefined,
        cpf: withdrawalType === "pix" ? cpf : undefined,
        pixKeyType: withdrawalType === "pix" ? pixKeyType : undefined,
        pixKey: withdrawalType === "pix" ? pixKey : undefined,
        walletAddress: withdrawalType === "usdt" ? walletAddress : undefined,
        fee: calculateFee(),
        netAmount: getNetAmount()
      };

      setWithdrawalHistory(prev => [newWithdrawal, ...prev]);

      // Reset form
      setAmount("");
      setAmountBRL("");
      setHolderName("");
      setCpf("");
      setPixKey("");
      setWalletAddress("");

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de saque foi enviada para análise. Processamento em até 2 horas úteis.",
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar saque",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-trading-green text-white">Aprovado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeitado</Badge>;
      case "processing":
        return <Badge className="bg-blue-500 text-white">Processando</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-3 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center">
                <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 text-primary" />
                <span className="hidden sm:inline">Solicitação de Saque</span>
                <span className="sm:hidden">Saque</span>
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
                Solicite seus saques de segunda a sexta-feira
              </p>
            </div>
          </div>
          
          {/* Balance Cards - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Main Balance */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Saldo Principal</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBalance(!showBalance)}
                        className="h-5 w-5 p-0"
                      >
                        {showBalance ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-trading-green">
                      {showBalance ? `$${userBalance.toLocaleString()}` : "••••••"}
                    </p>
                  </div>
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Referral Balance */}
            <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Saldo de Indicação</p>
                    <p className="text-lg sm:text-xl font-bold text-amber-600">
                      {showBalance ? `$${referralBalance.toLocaleString()}` : "••••••"}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            {/* Residual Balance */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Saldo Residual</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-600">
                      {showBalance ? `$${residualBalance.toLocaleString()}` : "••••••"}
                    </p>
                  </div>
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Info - Mobile Optimized */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-white">
                  Informações Importantes sobre Saques
                </p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li className="text-yellow-400">• Saques processados de segunda a sexta-feira, das 9h às 17h</li>
                  <li className="text-yellow-400">• Prazo de processamento: até 2 horas úteis</li>
                  <li className="text-white">• Limite diário PIX: R$ 2.000 | USDT: R$ 10.000</li>
                  <li className="text-white">• Verifique seus dados antes de confirmar para evitar perda do recebimento</li>
                  <li className="text-yellow-400">• Taxa PIX: 2% | Taxa USDT: 5%</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Withdrawal Methods */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center text-sm sm:text-base">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                Método de Saque
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="digitopay" className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span>DigitoPay PIX</span>
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4" />
                    <span>Saque Manual</span>
                  </TabsTrigger>
                </TabsList>

                {/* DigitoPay Tab */}
                <TabsContent value="digitopay" className="space-y-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      <Smartphone className="h-4 w-4" />
                      <span>Saque via DigitoPay - Integração Real</span>
                    </div>
                  </div>

                  {user ? (
                    <DigitoPayWithdrawal onSuccess={() => {
                      toast({
                        title: "Sucesso!",
                        description: "Saque solicitado com sucesso",
                      });
                    }} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Faça login para acessar o DigitoPay</p>
                    </div>
                  )}
                </TabsContent>

                {/* Manual Withdrawal Tab */}
                <TabsContent value="manual" className="space-y-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <Wallet className="h-4 w-4" />
                      <span>Saque Manual - Processamento Manual</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Amount Inputs - Mobile Optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-xs sm:text-sm">Valor em USD</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amountBRL" className="text-xs sm:text-sm">Valor em BRL</Label>
                    <Input
                      id="amountBRL"
                      type="number"
                      step="0.01"
                      min="1"
                      value={amountBRL}
                      onChange={(e) => handleBRLChange(e.target.value)}
                      placeholder="0,00"
                      className="text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Exchange Rate - Mobile Optimized */}
                <div className="text-xs sm:text-sm text-muted-foreground bg-secondary/50 p-2 rounded">
                  Taxa atual: 1 USD = R$ {exchangeRate.toFixed(2)}
                </div>

                {/* Withdrawal Type - Mobile Optimized */}
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Tipo de Saque</Label>
                  <Select value={withdrawalType} onValueChange={(value: "pix" | "usdt") => setWithdrawalType(value)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX (Taxa: 2%)</SelectItem>
                      <SelectItem value="usdt">USDT BNB20 (Taxa: 5%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Daily Limits - Mobile Optimized */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Limite diário {withdrawalType.toUpperCase()}:</span>
                    <span>R$ {dailyLimits[withdrawalType].limit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Usado hoje:</span>
                    <span>R$ {dailyLimits[withdrawalType].used.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span>Disponível:</span>
                    <span className="text-trading-green">R$ {getRemainingLimit().toLocaleString()}</span>
                  </div>
                </div>

                {/* PIX Fields - Mobile Optimized */}
                {withdrawalType === "pix" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="holderName" className="text-xs sm:text-sm">Nome do Titular</Label>
                      <Input
                        id="holderName"
                        value={holderName}
                        onChange={(e) => setHolderName(e.target.value)}
                        placeholder="Nome completo do titular da conta"
                        className="text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-xs sm:text-sm">CPF do Titular</Label>
                      <Input
                        id="cpf"
                        value={cpf}
                        onChange={(e) => handleCPFChange(e.target.value)}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm">Tipo de Chave PIX</Label>
                      <Select value={pixKeyType} onValueChange={(value: any) => setPixKeyType(value)}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="random">Chave Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pixKey" className="text-xs sm:text-sm">Chave PIX</Label>
                      <Input
                        id="pixKey"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder={
                          pixKeyType === "cpf" ? "000.000.000-00" :
                          pixKeyType === "cnpj" ? "00.000.000/0000-00" :
                          pixKeyType === "email" ? "email@exemplo.com" :
                          pixKeyType === "phone" ? "(00) 00000-0000" :
                          "Chave aleatória"
                        }
                        className="text-sm"
                        required
                      />
                    </div>
                  </>
                )}

                {/* USDT Fields - Mobile Optimized */}
                {withdrawalType === "usdt" && (
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress" className="text-xs sm:text-sm">Endereço da Carteira USDT (BNB20)</Label>
                    <Input
                      id="walletAddress"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x..."
                      className="text-sm"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Certifique-se de que é um endereço BNB20 válido
                    </p>
                  </div>
                )}

                {/* Fee Calculation - Mobile Optimized */}
                {amount && (
                  <div className="space-y-2 p-3 bg-secondary rounded-lg">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Valor solicitado:</span>
                      <span>${parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Taxa ({withdrawalType === "pix" ? "2%" : "5%"}):</span>
                      <span>-${calculateFee().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm font-medium border-t pt-2">
                      <span>Valor líquido:</span>
                      <span className="text-trading-green">${getNetAmount().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full text-sm" disabled={isLoading}>
                  {isLoading ? "Processando..." : "Solicitar Saque"}
                </Button>
              </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Statistics - Mobile Optimized */}
          <div className="space-y-4 sm:space-y-6">
            {/* Daily Limits Card - Mobile Optimized */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-sm sm:text-base">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                  Limites Diários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium">PIX</span>
                    <Badge variant="outline" className="text-xs">R$ 2.000/dia</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(dailyLimits.pix.used / dailyLimits.pix.limit) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Usado: R$ {dailyLimits.pix.used.toLocaleString()}</span>
                    <span>Restante: R$ {(dailyLimits.pix.limit - dailyLimits.pix.used).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium">USDT</span>
                    <Badge variant="outline" className="text-xs">R$ 10.000/dia</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(dailyLimits.usdt.used / dailyLimits.usdt.limit) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Usado: R$ {dailyLimits.usdt.used.toLocaleString()}</span>
                    <span>Restante: R$ {(dailyLimits.usdt.limit - dailyLimits.usdt.used).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Hours - Mobile Optimized */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-sm sm:text-base">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                  Horários de Processamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-trading-green flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Segunda a Sexta: 9h às 17h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Prazo: até 2 horas úteis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Fins de semana: não processados</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Withdrawal History - Mobile Optimized */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center text-sm sm:text-base">
              <History className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
              Histórico de Saques
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Data</TableHead>
                    <TableHead className="text-xs sm:text-sm">Tipo</TableHead>
                    <TableHead className="text-xs sm:text-sm">Valor</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Taxa</TableHead>
                    <TableHead className="text-xs sm:text-sm">Líquido</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalHistory.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="text-xs sm:text-sm">
                        {new Date(withdrawal.date).toLocaleDateString("pt-BR")}
                        <div className="text-xs text-muted-foreground">
                          {new Date(withdrawal.date).toLocaleTimeString("pt-BR", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {withdrawal.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div>${withdrawal.amount}</div>
                        <div className="text-xs text-muted-foreground">
                          R$ {(withdrawal.amountBRL || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                        ${withdrawal.fee.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-trading-green text-xs sm:text-sm">
                        ${withdrawal.netAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(withdrawal.status)}
                      </TableCell>
                      <TableCell className="text-xs hidden lg:table-cell">
                        {withdrawal.type === "pix" ? (
                          <div>
                            <div className="truncate max-w-[120px]">{withdrawal.holderName}</div>
                            <div className="text-muted-foreground truncate max-w-[120px]">
                              {withdrawal.pixKeyType?.toUpperCase()}: {withdrawal.pixKey}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground truncate max-w-[120px]">
                            {withdrawal.walletAddress?.substring(0, 10)}...
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Withdrawal;