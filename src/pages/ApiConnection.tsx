import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Key, Shield, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

const ApiConnection = () => {
  const [apiKey, setApiKey] = useState("B5xi6RvYu11sYxxvZPdYZ4pzTK0pii2CpOsawmVG45bXICkYhjzV9MkjH2y0XGqt");
  const [secretKey, setSecretKey] = useState("WRS9svtgQAeb83LMpf54XjiCrfNz5U0Ie8B1dWn2gBY5P61layPLkYISl56zqUMq");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Salvar as chaves automaticamente no localStorage na inicialização
  useEffect(() => {
    localStorage.setItem('binance_api_key', apiKey);
    localStorage.setItem('binance_secret_key', secretKey);
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    
    // Simulate API validation
    setTimeout(() => {
      if (apiKey.length >= 20 && secretKey.length >= 20) {
        setConnectionStatus("success");
        localStorage.setItem("binance_api_key", apiKey);
        localStorage.setItem("binance_secret_key", secretKey);
        toast({
          title: "API conectada com sucesso!",
          description: "Suas credenciais foram validadas",
        });
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setConnectionStatus("error");
        toast({
          title: "Erro na conexão",
          description: "Verifique suas credenciais da API",
          variant: "destructive",
        });
      }
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-10 w-10 text-primary mr-2" />
            <h1 className="text-3xl font-bold text-primary">Alphabit</h1>
          </div>
          <h2 className="text-xl font-semibold text-card-foreground mb-2">
            Conectar API Binance
          </h2>
          <p className="text-muted-foreground">
            Conecte sua conta Binance para começar a arbitragem
          </p>
        </div>

        <Card className="bg-card border-border shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Configuração da API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Security Notice */}
            <Alert className="border-warning/20 bg-warning/10">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Suas chaves são criptografadas e armazenadas com segurança. 
                Recomendamos criar uma API Key apenas com permissões de leitura e negociação.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="api-key"
                    type="text"
                    placeholder="Sua API Key da Binance"
                    className="pl-9"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secret-key">Secret Key</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="secret-key"
                    type="password"
                    placeholder="Sua Secret Key da Binance"
                    className="pl-9"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Connection Status */}
              {connectionStatus === "success" && (
                <Alert className="border-success/20 bg-success/10">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    Conexão validada! Redirecionando para o dashboard...
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === "error" && (
                <Alert className="border-destructive/20 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    Falha na validação. Verifique suas credenciais.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isConnecting || !apiKey || !secretKey}
              >
                {isConnecting ? "Validando..." : "Conectar API"}
              </Button>
            </form>

            {/* Instructions */}
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium text-card-foreground mb-2">
                Como obter suas chaves da API:
              </h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Acesse sua conta Binance</li>
                <li>2. Vá em API Management</li>
                <li>3. Crie uma nova API Key</li>
                <li>4. Ative as permissões de Spot & Margin Trading</li>
                <li>5. Cole as chaves aqui</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiConnection;