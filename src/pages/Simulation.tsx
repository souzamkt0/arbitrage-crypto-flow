import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  BarChart3
} from "lucide-react";

const Simulation = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [capital, setCapital] = useState(10000);
  const [minProfit, setMinProfit] = useState(1.5);
  const [duration, setDuration] = useState("1h");
  const { toast } = useToast();

  const runSimulation = () => {
    setIsSimulating(true);
    
    // Simulate arbitrage opportunities
    const mockResults = [];
    const startTime = Date.now();
    
    setTimeout(() => {
      for (let i = 0; i < 15; i++) {
        const pairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "DOT/USDT", "MATIC/USDT"];
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        const profit = Number((Math.random() * 4 + 0.5).toFixed(2));
        const amount = Number((Math.random() * 1000 + 100).toFixed(2));
        const success = Math.random() > 0.2; // 80% success rate
        
        mockResults.push({
          id: `SIM${String(i + 1).padStart(3, '0')}`,
          timestamp: new Date(startTime + (i * 300000)).toLocaleTimeString(),
          pair,
          profit: success ? profit : 0,
          profitPercent: success ? profit : 0,
          amount,
          status: success ? "Success" : "Failed",
          exchange1: "Binance Spot",
          exchange2: "Binance Futures"
        });
      }
      
      setSimulationResults(mockResults);
      setIsSimulating(false);
      
      const totalProfit = mockResults.filter(r => r.status === "Success").reduce((sum, r) => sum + r.profit, 0);
      const successRate = (mockResults.filter(r => r.status === "Success").length / mockResults.length * 100).toFixed(1);
      
      toast({
        title: "Simulação Concluída",
        description: `Lucro total: $${totalProfit.toFixed(2)} | Taxa de sucesso: ${successRate}%`,
      });
    }, 3000);
  };

  const resetSimulation = () => {
    setSimulationResults([]);
    toast({
      title: "Simulação Resetada",
      description: "Os resultados foram limpos",
    });
  };

  const totalProfit = simulationResults.filter(r => r.status === "Success").reduce((sum, r) => sum + r.profit, 0);
  const successRate = simulationResults.length > 0 ? (simulationResults.filter(r => r.status === "Success").length / simulationResults.length * 100).toFixed(1) : "0";
  const totalTrades = simulationResults.length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-primary" />
              Simulação de Arbitragem
            </h1>
            <p className="text-muted-foreground">Teste estratégias sem risco real</p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="border-border text-card-foreground"
              disabled={isSimulating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={runSimulation}
              className="bg-primary hover:bg-primary/90"
              disabled={isSimulating}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Simulação
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Parâmetros da Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capital">Capital Inicial ($)</Label>
                <Input
                  id="capital"
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  min="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min-profit">Lucro Mínimo (%)</Label>
                <Input
                  id="min-profit"
                  type="number"
                  value={minProfit}
                  onChange={(e) => setMinProfit(Number(e.target.value))}
                  step="0.1"
                  min="0.1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duração</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30m">30 minutos</SelectItem>
                    <SelectItem value="1h">1 hora</SelectItem>
                    <SelectItem value="4h">4 horas</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="strategy">Estratégia</Label>
                <Select defaultValue="conservative">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservadora</SelectItem>
                    <SelectItem value="moderate">Moderada</SelectItem>
                    <SelectItem value="aggressive">Agressiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {simulationResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lucro Total</p>
                    <p className="text-2xl font-bold text-trading-green">
                      ${totalProfit.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-trading-green" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold text-primary">
                      {successRate}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Operações</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalTrades}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className="text-2xl font-bold text-primary">
                      {((totalProfit / capital) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Simulation Results */}
        {simulationResults.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Resultados da Simulação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {simulationResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-xs text-muted-foreground w-16">{result.timestamp}</div>
                      <div className="font-medium text-secondary-foreground">{result.pair}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.exchange1} → {result.exchange2}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`font-bold ${result.status === "Success" ? "text-trading-green" : "text-trading-red"}`}>
                          {result.status === "Success" ? `+$${result.profit.toFixed(2)}` : "$0.00"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${result.amount.toFixed(2)}
                        </div>
                      </div>
                      
                      <Badge variant={result.status === "Success" ? "default" : "destructive"} className="text-xs">
                        {result.status === "Success" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isSimulating && (
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <RefreshCw className="h-12 w-12 text-primary mx-auto animate-spin" />
                <h3 className="text-lg font-semibold text-card-foreground">
                  Executando Simulação...
                </h3>
                <p className="text-muted-foreground">
                  Analisando oportunidades de arbitragem com base nos parâmetros configurados
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Simulation;