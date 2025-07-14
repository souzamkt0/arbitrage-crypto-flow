import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { binanceApi } from "@/services/binanceApiService";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Wifi, 
  Shield, 
  DollarSign, 
  TrendingUp,
  RefreshCw 
} from "lucide-react";

interface ConnectionStatus {
  ping: boolean | null;
  credentials: boolean | null;
  account: any | null;
  balances: any[] | null;
  prices: any[] | null;
}

const BinanceApiTester = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    ping: null,
    credentials: null,
    account: null,
    balances: null,
    prices: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Teste 1: Ping da API
      console.log("Testando conectividade...");
      const pingResult = await binanceApi.checkConnection();
      setStatus(prev => ({ ...prev, ping: pingResult }));

      if (!pingResult) {
        throw new Error("Falha na conectividade com a API Binance");
      }

      // Teste 2: Validar credenciais
      console.log("Validando credenciais...");
      const credentialsValid = await binanceApi.validateCredentials();
      setStatus(prev => ({ ...prev, credentials: credentialsValid }));

      if (!credentialsValid) {
        throw new Error("Credenciais da API inválidas");
      }

      // Teste 3: Obter informações da conta
      console.log("Obtendo informações da conta...");
      const accountInfo = await binanceApi.getAccountInfo();
      setStatus(prev => ({ ...prev, account: accountInfo }));

      // Teste 4: Obter saldos
      console.log("Obtendo saldos...");
      const balances = await binanceApi.getBalances();
      setStatus(prev => ({ ...prev, balances }));

      // Teste 5: Obter alguns preços
      console.log("Obtendo preços do mercado...");
      const prices = await binanceApi.getAllPrices();
      setStatus(prev => ({ ...prev, prices: prices.slice(0, 10) }));

      toast({
        title: "Conexão bem-sucedida!",
        description: "Todos os testes da API Binance passaram.",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro nos testes:", err);
      
      toast({
        title: "Erro na conexão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testArbitrage = async () => {
    setLoading(true);
    try {
      console.log("Buscando oportunidades de arbitragem...");
      const opportunities = await binanceApi.findArbitrageOpportunities(0.1);
      
      toast({
        title: "Análise de arbitragem completa",
        description: `Encontradas ${opportunities.length} oportunidades potenciais.`,
      });

      console.log("Oportunidades de arbitragem:", opportunities.slice(0, 5));
    } catch (err) {
      console.error("Erro na análise de arbitragem:", err);
      toast({
        title: "Erro na análise",
        description: "Falha ao buscar oportunidades de arbitragem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <div className="w-4 h-4 rounded-full bg-muted" />;
    if (status === true) return <CheckCircle className="w-4 h-4 text-success" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  const StatusBadge = ({ status }: { status: boolean | null }) => {
    if (status === null) return <Badge variant="secondary">Pendente</Badge>;
    if (status === true) return <Badge variant="default" className="bg-success text-success-foreground">Sucesso</Badge>;
    return <Badge variant="destructive">Falha</Badge>;
  };

  useEffect(() => {
    // Testar automaticamente ao carregar o componente
    testConnection();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Teste da API Binance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={testConnection} 
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {loading ? "Testando..." : "Testar Conexão"}
            </Button>
            
            <Button 
              onClick={testArbitrage} 
              disabled={loading || !status.credentials}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Testar Arbitragem
            </Button>
          </div>

          {error && (
            <Alert className="border-destructive/20 bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Status dos Testes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Teste de Ping */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Conectividade</span>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon status={status.ping} />
                <StatusBadge status={status.ping} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Credenciais */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Credenciais</span>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon status={status.credentials} />
                <StatusBadge status={status.credentials} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Conta */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Dados da Conta</span>
              </div>
              <div className="flex items-center space-x-2">
                <StatusIcon status={status.account ? true : null} />
                <StatusBadge status={status.account ? true : null} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações da Conta */}
      {status.account && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Pode Negociar:</span>
                <p className="font-medium">{status.account.canTrade ? "Sim" : "Não"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Pode Sacar:</span>
                <p className="font-medium">{status.account.canWithdraw ? "Sim" : "Não"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Pode Depositar:</span>
                <p className="font-medium">{status.account.canDeposit ? "Sim" : "Não"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa Maker:</span>
                <p className="font-medium">{status.account.makerCommission / 10000}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saldos */}
      {status.balances && status.balances.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Saldos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.balances.slice(0, 10).map((balance, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{balance.asset}</span>
                  <div className="text-right">
                    <p>Livre: {parseFloat(balance.free).toFixed(8)}</p>
                    {parseFloat(balance.locked) > 0 && (
                      <p className="text-muted-foreground">Bloqueado: {parseFloat(balance.locked).toFixed(8)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preços do Mercado */}
      {status.prices && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Preços Atuais (Amostra)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
              {status.prices.map((price, index) => (
                <div key={index} className="text-center p-2 bg-secondary rounded-lg">
                  <p className="font-medium">{price.symbol}</p>
                  <p className="text-muted-foreground">${parseFloat(price.price).toFixed(4)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BinanceApiTester;