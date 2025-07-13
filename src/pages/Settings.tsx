import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, AlertTriangle, DollarSign, Percent, Volume2 } from "lucide-react";

const Settings = () => {
  const [minProfit, setMinProfit] = useState([1.5]);
  const [maxAmount, setMaxAmount] = useState(1000);
  const [baseCurrency, setBaseCurrency] = useState("USDT");
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [autoExecute, setAutoExecute] = useState(true);
  const [riskLevel, setRiskLevel] = useState([3]);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <SettingsIcon className="h-8 w-8 mr-3 text-primary" />
              Configurações do Bot
            </h1>
            <p className="text-muted-foreground">Configure os parâmetros de arbitragem</p>
          </div>
          
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trading Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                Configurações de Trading
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="min-profit">Lucro Mínimo (%)</Label>
                <div className="px-3">
                  <Slider
                    value={minProfit}
                    onValueChange={setMinProfit}
                    max={10}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.1%</span>
                    <span className="font-medium text-primary">{minProfit[0]}%</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-amount">Valor Máximo por Operação (USD)</Label>
                <Input
                  id="max-amount"
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="base-currency">Moeda Base</Label>
                <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a moeda base" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="BUSD">BUSD</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk-level">Nível de Risco</Label>
                <div className="px-3">
                  <Slider
                    value={riskLevel}
                    onValueChange={setRiskLevel}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Conservador</span>
                    <span className="font-medium text-primary">Nível {riskLevel[0]}</span>
                    <span>Agressivo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <SettingsIcon className="h-5 w-5 mr-2 text-primary" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Execução Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Executar arbitragens automaticamente quando identificadas
                  </p>
                </div>
                <Switch
                  checked={autoExecute}
                  onCheckedChange={setAutoExecute}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Notificações Sonoras
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Tocar som quando uma arbitragem for executada
                  </p>
                </div>
                <Switch
                  checked={soundNotifications}
                  onCheckedChange={setSoundNotifications}
                />
              </div>

              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning">Aviso de Risco</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Trading automatizado envolve riscos. Configure os limites com cuidado
                      e monitore as operações regularmente.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <Percent className="h-5 w-5 mr-2 text-primary" />
              Configurações Avançadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="slippage">Slippage Máximo (%)</Label>
                <Input
                  id="slippage"
                  type="number"
                  defaultValue="0.5"
                  step="0.1"
                  min="0.1"
                  max="5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout da Ordem (s)</Label>
                <Input
                  id="timeout"
                  type="number"
                  defaultValue="30"
                  min="5"
                  max="300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retry">Tentativas de Retry</Label>
                <Input
                  id="retry"
                  type="number"
                  defaultValue="3"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" className="border-border text-card-foreground">
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Salvar e Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;