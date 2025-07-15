import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  History
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
  const [userBalance] = useState(2500.75); // Mock user balance
  const [dailyLimits] = useState({
    pix: { limit: 2000, used: 500 },
    usdt: { limit: 10000, used: 2000 }
  });
  
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([
    {
      id: "1",
      amount: 100,
      amountBRL: 550,
      type: "pix",
      status: "approved",
      date: "2024-07-14T10:30:00Z",
      holderName: "João Silva",
      cpf: "123.456.789-00",
      pixKeyType: "cpf",
      pixKey: "123.456.789-00",
      fee: 5,
      netAmount: 95
    },
    {
      id: "2",
      amount: 200,
      amountBRL: 1100,
      type: "usdt",
      status: "pending",
      date: "2024-07-15T09:15:00Z",
      walletAddress: "0xb794f5ea0ba39494ce839613fffba74279579268",
      fee: 10,
      netAmount: 190
    }
  ]);

  const { toast } = useToast();

  // Fetch exchange rate
  useEffect(() => {
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

    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 60000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
              <ArrowDown className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary" />
              <span className="hidden sm:inline">Solicitação de Saque</span>
              <span className="sm:hidden">Saque</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Solicite seus saques de segunda a sexta-feira
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Saldo Disponível</p>
            <p className="text-xl font-bold text-trading-green">${userBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Important Info */}
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Informações Importantes sobre Saques
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Saques processados de segunda a sexta-feira, das 9h às 17h</li>
                  <li>• Prazo de processamento: até 2 horas úteis</li>
                  <li>• Limite diário PIX: R$ 2.000 | USDT: R$ 10.000</li>
                  <li>• Verifique seus dados antes de confirmar para evitar perda do recebimento</li>
                  <li>• Taxa PIX: 2% | Taxa USDT: 5%</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Withdrawal Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-primary" />
                Nova Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor em USD</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amountBRL">Valor em BRL</Label>
                    <Input
                      id="amountBRL"
                      type="number"
                      step="0.01"
                      min="1"
                      value={amountBRL}
                      onChange={(e) => handleBRLChange(e.target.value)}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>

                {/* Exchange Rate */}
                <div className="text-sm text-muted-foreground">
                  Taxa atual: 1 USD = R$ {exchangeRate.toFixed(2)}
                </div>

                {/* Withdrawal Type */}
                <div className="space-y-2">
                  <Label>Tipo de Saque</Label>
                  <Select value={withdrawalType} onValueChange={(value: "pix" | "usdt") => setWithdrawalType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX (Taxa: 2%)</SelectItem>
                      <SelectItem value="usdt">USDT BNB20 (Taxa: 5%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Daily Limits */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Limite diário {withdrawalType.toUpperCase()}:</span>
                    <span>R$ {dailyLimits[withdrawalType].limit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Usado hoje:</span>
                    <span>R$ {dailyLimits[withdrawalType].used.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Disponível:</span>
                    <span className="text-trading-green">R$ {getRemainingLimit().toLocaleString()}</span>
                  </div>
                </div>

                {/* PIX Fields */}
                {withdrawalType === "pix" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="holderName">Nome do Titular</Label>
                      <Input
                        id="holderName"
                        value={holderName}
                        onChange={(e) => setHolderName(e.target.value)}
                        placeholder="Nome completo do titular da conta"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF do Titular</Label>
                      <Input
                        id="cpf"
                        value={cpf}
                        onChange={(e) => handleCPFChange(e.target.value)}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Chave PIX</Label>
                      <Select value={pixKeyType} onValueChange={(value: any) => setPixKeyType(value)}>
                        <SelectTrigger>
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
                      <Label htmlFor="pixKey">Chave PIX</Label>
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
                        required
                      />
                    </div>
                  </>
                )}

                {/* USDT Fields */}
                {withdrawalType === "usdt" && (
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Endereço da Carteira USDT (BNB20)</Label>
                    <Input
                      id="walletAddress"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x..."
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Certifique-se de que é um endereço BNB20 válido
                    </p>
                  </div>
                )}

                {/* Fee Calculation */}
                {amount && (
                  <div className="space-y-2 p-3 bg-secondary rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Valor solicitado:</span>
                      <span>${parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa ({withdrawalType === "pix" ? "2%" : "5%"}):</span>
                      <span>-${calculateFee().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t pt-2">
                      <span>Valor líquido:</span>
                      <span className="text-trading-green">${getNetAmount().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processando..." : "Solicitar Saque"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="space-y-6">
            {/* Daily Limits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Limites Diários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">PIX</span>
                    <Badge variant="outline">R$ 2.000/dia</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
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
                    <span className="text-sm font-medium">USDT</span>
                    <Badge variant="outline">R$ 10.000/dia</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
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

            {/* Processing Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Horários de Processamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-trading-green" />
                  <span className="text-sm">Segunda a Sexta: 9h às 17h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm">Prazo: até 2 horas úteis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Fins de semana: não processados</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2 text-primary" />
              Histórico de Saques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Líquido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalHistory.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="text-sm">
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
                      <TableCell className="font-medium">
                        <div>${withdrawal.amount}</div>
                        <div className="text-xs text-muted-foreground">
                          R$ {withdrawal.amountBRL.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        ${withdrawal.fee.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-trading-green">
                        ${withdrawal.netAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(withdrawal.status)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {withdrawal.type === "pix" ? (
                          <div>
                            <div>{withdrawal.holderName}</div>
                            <div className="text-muted-foreground">
                              {withdrawal.pixKeyType?.toUpperCase()}: {withdrawal.pixKey}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">
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