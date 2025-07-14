import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  Calendar,
  PiggyBank,
  Plus,
  Bot,
  Timer,
  Play,
  ArrowUpDown,
  Activity,
  Zap
} from "lucide-react";

interface Investment {
  id: string;
  name: string;
  dailyRate: number;
  minimumAmount: number;
  maximumAmount: number;
  duration: number; // dias
  description: string;
  status: "active" | "inactive";
}

interface UserInvestment {
  id: string;
  investmentId: string;
  investmentName: string;
  amount: number;
  dailyRate: number;
  startDate: string;
  endDate: string;
  totalEarned: number;
  status: "active" | "completed";
  daysRemaining: number;
  currentDayProgress: number; // 0-100 (% do dia atual)
  todayEarnings: number; // ganhos do dia atual
  dailyTarget: number; // meta de ganho diário
  currentOperation?: {
    pair: string;
    buyPrice: number;
    sellPrice: number;
    profit: number;
    progress: number; // 0-100
    timeRemaining: number; // segundos
  };
  operationsCompleted: number;
  totalOperations: number;
}

const Investments = () => {
  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: "1",
      name: "Alphabot Basic",
      dailyRate: 1.5,
      minimumAmount: 100,
      maximumAmount: 5000,
      duration: 30,
      description: "Negociação automatizada em pares de crypto com bot Alphabot. Operações ativas quando você ativar.",
      status: "active"
    },
    {
      id: "2", 
      name: "Alphabot Premium",
      dailyRate: 2.0,
      minimumAmount: 1000,
      maximumAmount: 20000,
      duration: 60,
      description: "Bot avançado para pares crypto. Cronômetro de operações com velocidade moderada.",
      status: "active"
    },
    {
      id: "3",
      name: "Alphabot VIP",
      dailyRate: 2.5,
      minimumAmount: 5000,
      maximumAmount: 100000,
      duration: 90,
      description: "Bot premium para pares crypto. Quanto maior o valor, mais rápido gira o cronômetro de operações.",
      status: "active"
    }
  ]);

  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([
    {
      id: "1",
      investmentId: "1",
      investmentName: "Alphabot Basic",
      amount: 1000,
      dailyRate: 1.5,
      startDate: "2024-07-01",
      endDate: "2024-07-31",
      totalEarned: 195.50,
      status: "active",
      daysRemaining: 18,
      currentDayProgress: 45,
      todayEarnings: 6.75,
      dailyTarget: 15.00,
      currentOperation: {
        pair: "BTC/USDT",
        buyPrice: 67420.50,
        sellPrice: 67451.20,
        profit: 0.85,
        progress: 65,
        timeRemaining: 35
      },
      operationsCompleted: 8,
      totalOperations: 15
    },
    {
      id: "2",
      investmentId: "2", 
      investmentName: "Alphabot Premium",
      amount: 5000,
      dailyRate: 2.0,
      startDate: "2024-06-15",
      endDate: "2024-08-14",
      totalEarned: 580.00,
      status: "active",
      daysRemaining: 32,
      currentDayProgress: 72,
      todayEarnings: 72.00,
      dailyTarget: 100.00,
      currentOperation: {
        pair: "ETH/USDT",
        buyPrice: 3842.15,
        sellPrice: 3847.92,
        profit: 2.45,
        progress: 82,
        timeRemaining: 18
      },
      operationsCompleted: 12,
      totalOperations: 20
    }
  ]);

  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [userBalance] = useState(12543.89);
  const { toast } = useToast();

  const cryptoPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "SOL/USDT", "XRP/USDT", "DOGE/USDT", "MATIC/USDT"];

  // Simular cronômetro e operações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setUserInvestments(prev => prev.map(investment => {
        if (investment.status !== "active") return investment;
        
        const speedMultiplier = investment.amount >= 10000 ? 3 : investment.amount >= 5000 ? 2 : 1;
        const progressIncrement = speedMultiplier * 0.5;
        
        let newProgress = investment.currentDayProgress + progressIncrement;
        let newTodayEarnings = investment.todayEarnings;
        let newTotalEarned = investment.totalEarned;
        let newOperationsCompleted = investment.operationsCompleted;
        let newCurrentOperation = investment.currentOperation;

        // Atualizar operação atual
        if (newCurrentOperation) {
          const newOperationProgress = Math.min(newCurrentOperation.progress + (speedMultiplier * 2), 100);
          const newTimeRemaining = Math.max(newCurrentOperation.timeRemaining - 1, 0);

          if (newOperationProgress >= 100 || newTimeRemaining === 0) {
            // Operação completada
            newTodayEarnings += newCurrentOperation.profit;
            newTotalEarned += newCurrentOperation.profit;
            newOperationsCompleted += 1;

            // Nova operação
            const randomPair = cryptoPairs[Math.floor(Math.random() * cryptoPairs.length)];
            const basePrice = Math.random() * 50000 + 1000;
            const buyPrice = basePrice;
            const sellPrice = buyPrice * (1 + (Math.random() * 0.002 + 0.001)); // 0.1% a 0.3% de lucro
            const profit = (investment.dailyTarget / investment.totalOperations) * (0.8 + Math.random() * 0.4);

            newCurrentOperation = {
              pair: randomPair,
              buyPrice: buyPrice,
              sellPrice: sellPrice,
              profit: profit,
              progress: 0,
              timeRemaining: Math.floor(Math.random() * 60 + 30) // 30-90 segundos
            };
          } else {
            newCurrentOperation = {
              ...newCurrentOperation,
              progress: newOperationProgress,
              timeRemaining: newTimeRemaining
            };
          }
        }
        
        if (newProgress >= 100) {
          // Completou o dia, reseta
          newProgress = 0;
          newTodayEarnings = 0;
          newOperationsCompleted = 0;
        }
        
        return {
          ...investment,
          currentDayProgress: Math.min(newProgress, 100),
          todayEarnings: newTodayEarnings,
          totalEarned: newTotalEarned,
          currentOperation: newCurrentOperation,
          operationsCompleted: newOperationsCompleted
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = userInvestments.reduce((sum, inv) => sum + inv.totalEarned, 0);
  const activeInvestments = userInvestments.filter(inv => inv.status === "active").length;

  const handleInvest = () => {
    if (!selectedInvestment || !investmentAmount) return;

    const amount = parseFloat(investmentAmount);
    
    if (amount < selectedInvestment.minimumAmount) {
      toast({
        title: "Valor insuficiente",
        description: `O valor mínimo para este investimento é $${selectedInvestment.minimumAmount}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > selectedInvestment.maximumAmount) {
      toast({
        title: "Valor excede o limite",
        description: `O valor máximo para este investimento é $${selectedInvestment.maximumAmount}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > userBalance) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não possui saldo suficiente para este investimento",
        variant: "destructive"
      });
      return;
    }

    const dailyTarget = (amount * selectedInvestment.dailyRate) / 100;
    const totalOps = selectedInvestment.dailyRate === 2.5 ? 30 : selectedInvestment.dailyRate === 2.0 ? 20 : 15;
    
    const newInvestment: UserInvestment = {
      id: (userInvestments.length + 1).toString(),
      investmentId: selectedInvestment.id,
      investmentName: selectedInvestment.name,
      amount: amount,
      dailyRate: selectedInvestment.dailyRate,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + selectedInvestment.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalEarned: 0,
      status: "active",
      daysRemaining: selectedInvestment.duration,
      currentDayProgress: 0,
      todayEarnings: 0,
      dailyTarget: dailyTarget,
      currentOperation: {
        pair: cryptoPairs[0],
        buyPrice: 67420.50,
        sellPrice: 67451.20,
        profit: dailyTarget / totalOps,
        progress: 0,
        timeRemaining: 60
      },
      operationsCompleted: 0,
      totalOperations: totalOps
    };

    setUserInvestments([...userInvestments, newInvestment]);
    setIsInvestModalOpen(false);
    setInvestmentAmount("");
    setSelectedInvestment(null);

    toast({
      title: "Investimento realizado!",
      description: `Você investiu $${amount} no ${selectedInvestment.name}`,
    });
  };

  const openInvestModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setIsInvestModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
              <Bot className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-primary" />
              Alphabot - Investimentos
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Bots de negociação em pares crypto com rendimento automático</p>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-semibold text-foreground">Saldo Disponível</div>
            <div className="text-2xl font-bold text-primary">${userBalance.toLocaleString()}</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Total Investido
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${totalInvested.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Em {activeInvestments} investimentos ativos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Ganhos Totais
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-trading-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-trading-green">
                +${totalEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Rendimento acumulado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Investimentos Ativos
              </CardTitle>
              <Target className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {activeInvestments}
              </div>
              <p className="text-xs text-muted-foreground">
                Planos em andamento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Investments */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Timer className="h-5 w-5 mr-2 text-primary" />
              Bots Alphabot Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investments.filter(inv => inv.status === "active").map((investment) => (
                <Card key={investment.id} className="bg-secondary border-border hover:bg-secondary/80 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg text-secondary-foreground flex items-center justify-between">
                      <div className="flex items-center">
                        <Bot className="h-5 w-5 mr-2 text-primary" />
                        {investment.name}
                      </div>
                      <Badge variant="default" className="text-xs">
                        {investment.dailyRate}% / dia
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{investment.description}</p>
                    
                    <div className="flex items-center space-x-2 p-2 bg-primary/10 rounded-lg">
                      <Timer className="h-4 w-4 text-primary" />
                      <span className="text-xs text-primary font-medium">
                        Cronômetro: {investment.dailyRate === 2.5 ? "Ultra Rápido" : investment.dailyRate === 2.0 ? "Rápido" : "Normal"}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mínimo:</span>
                        <span className="font-medium">${investment.minimumAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Máximo:</span>
                        <span className="font-medium">${investment.maximumAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duração:</span>
                        <span className="font-medium">{investment.duration} dias</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => openInvestModal(investment)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Ativar Bot
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Investments */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Meus Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {userInvestments.length > 0 ? (
              <div className="space-y-4">
                {userInvestments.map((investment) => {
                  const speedText = investment.amount >= 10000 ? "Ultra Rápido" : 
                                   investment.amount >= 5000 ? "Rápido" : "Normal";
                  const progressHours = Math.floor((investment.currentDayProgress / 100) * 24);
                  const progressMinutes = Math.floor(((investment.currentDayProgress / 100) * 24 * 60) % 60);
                  const progressSeconds = Math.floor(((investment.currentDayProgress / 100) * 24 * 3600) % 60);
                  
                  return (
                    <Card key={investment.id} className="bg-secondary border-border">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Bot className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold text-secondary-foreground">{investment.investmentName}</h3>
                                <Badge variant={investment.status === "active" ? "default" : "secondary"}>
                                  {investment.status === "active" ? "Ativo" : "Finalizado"}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Investido: ${investment.amount.toLocaleString()} • 
                                Taxa: {investment.dailyRate}% / dia • 
                                Ganho Total: +${investment.totalEarned.toFixed(2)}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Timer className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">
                                Velocidade: {speedText}
                              </span>
                            </div>
                          </div>

                          {/* Cronômetro e Progresso Diário */}
                          {investment.status === "active" && (
                            <div className="bg-primary/5 rounded-lg p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">Cronômetro do Dia</div>
                                  <div className="text-2xl font-mono font-bold text-primary">
                                    {String(progressHours).padStart(2, '0')}:
                                    {String(progressMinutes).padStart(2, '0')}:
                                    {String(progressSeconds).padStart(2, '0')}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground mb-1">Ganho Hoje</div>
                                  <div className="text-lg font-bold text-trading-green">
                                    +${investment.todayEarnings.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Meta: ${investment.dailyTarget.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Progresso do Dia</span>
                                  <span>{investment.currentDayProgress.toFixed(1)}%</span>
                                </div>
                                <Progress 
                                  value={investment.currentDayProgress} 
                                  className="h-2"
                                />
                              </div>

                              {/* Operação de Arbitragem Atual */}
                              {investment.currentOperation && (
                                <div className="bg-secondary/50 rounded-lg p-3 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <ArrowUpDown className="h-4 w-4 text-primary" />
                                      <span className="text-sm font-medium text-foreground">
                                        Arbitragem: {investment.currentOperation.pair}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Activity className="h-3 w-3 text-trading-green" />
                                      <span className="text-xs text-trading-green font-medium">
                                        {investment.currentOperation.timeRemaining}s
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                      <span className="text-muted-foreground">Compra:</span>
                                      <div className="font-mono text-trading-red">
                                        ${investment.currentOperation.buyPrice.toFixed(2)}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Venda:</span>
                                      <div className="font-mono text-trading-green">
                                        ${investment.currentOperation.sellPrice.toFixed(2)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-muted-foreground">Lucro Estimado:</span>
                                      <span className="font-bold text-trading-green">
                                        +${investment.currentOperation.profit.toFixed(2)}
                                      </span>
                                    </div>
                                    <Progress 
                                      value={investment.currentOperation.progress} 
                                      className="h-1.5"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Estatísticas de Operações */}
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                  <Zap className="h-3 w-3 text-warning" />
                                  <span className="text-muted-foreground">
                                    Operações: {investment.operationsCompleted}/{investment.totalOperations}
                                  </span>
                                </div>
                                <div className="text-muted-foreground">
                                  Velocidade: {speedText}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Info do Investimento */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {investment.daysRemaining} dias restantes
                              </span>
                            </div>
                            <Progress 
                              value={((90 - investment.daysRemaining) / 90) * 100} 
                              className="w-24 h-2"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Você ainda não possui investimentos</p>
                <p className="text-sm text-muted-foreground mt-2">Escolha um plano acima para começar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Modal */}
        <Dialog open={isInvestModalOpen} onOpenChange={setIsInvestModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Realizar Investimento</DialogTitle>
            </DialogHeader>
            {selectedInvestment && (
              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <h3 className="font-semibold mb-2">{selectedInvestment.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Taxa diária: {selectedInvestment.dailyRate}%</p>
                    <p>Duração: {selectedInvestment.duration} dias</p>
                    <p>Limite: ${selectedInvestment.minimumAmount.toLocaleString()} - ${selectedInvestment.maximumAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor do Investimento</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Digite o valor"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    min={selectedInvestment.minimumAmount}
                    max={selectedInvestment.maximumAmount}
                  />
                  <p className="text-xs text-muted-foreground">
                    Saldo disponível: ${userBalance.toLocaleString()}
                  </p>
                </div>

                {investmentAmount && parseFloat(investmentAmount) >= selectedInvestment.minimumAmount && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">Projeção de ganhos:</p>
                      <p className="font-medium">
                        Ganho diário: ${(parseFloat(investmentAmount) * selectedInvestment.dailyRate / 100).toFixed(2)}
                      </p>
                      <p className="font-medium">
                        Total estimado: ${(parseFloat(investmentAmount) * selectedInvestment.dailyRate / 100 * selectedInvestment.duration).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsInvestModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleInvest} disabled={!investmentAmount}>
                    Confirmar Investimento
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Investments;