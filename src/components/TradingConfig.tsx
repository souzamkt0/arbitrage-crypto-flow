import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Save, X, Plus, Settings, BarChart3, Volume2, Calculator, TrendingUp, DollarSign, Percent } from "lucide-react";

interface InvestmentPlan {
  id: string;
  name: string;
  max_daily_return: number;
  trading_strategy: string;
  risk_level: number;
  daily_rate: number;
  status: string;
  minimum_indicators: number;
}

interface TradingConfig {
  id: string;
  plan_id: string;
  strategy_type: 'conservador' | 'moderado' | 'livre';
  max_daily_return: number;
  min_daily_return: number;
  operations_per_day: number;
  risk_factor: number;
  active: boolean;
}

export function TradingConfig() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [configs, setConfigs] = useState<TradingConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados do simulador
  const [simulatorValue, setSimulatorValue] = useState(1000);
  const [simulatorPeriod, setSimulatorPeriod] = useState(30);
  const [showUSD, setShowUSD] = useState(false);
  const [usdRate] = useState(5.50); // Taxa de câmbio USD/BRL
  
  const { toast } = useToast();

  useEffect(() => {
    loadPlansAndConfigs();
  }, []);

  const loadPlansAndConfigs = async () => {
    setLoading(true);
    try {
      // Carregar planos de investimento
      const { data: plansData, error: plansError } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('status', 'active');

      if (plansError) throw plansError;

      // Carregar configurações de trading
      const { data: configsData, error: configsError } = await supabase
        .from('trading_configurations')
        .select('*')
        .eq('active', true);

      if (configsError) throw configsError;

      setPlans(plansData || []);
      setConfigs(configsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de trading.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTradingConfig = async (configId: string, updates: Partial<TradingConfig>) => {
    try {
      const { error } = await supabase
        .from('trading_configurations')
        .update(updates)
        .eq('id', configId);

      if (error) throw error;

      // Atualizar estado local
      setConfigs(configs.map(config => 
        config.id === configId ? { ...config, ...updates } : config
      ));

      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração.",
        variant: "destructive",
      });
    }
  };

  const updatePlanStrategy = async (planId: string, strategy: string, maxReturn: number, currentRate?: number) => {
    try {
      // Definir limites baseados na estratégia
      const strategyLimits = {
        'conservador': 2.0,
        'moderado': 3.0,
        'livre': 4.0
      };

      const actualMaxReturn = strategyLimits[strategy] || 2.0;

      const updateData: any = {
        trading_strategy: strategy,
        max_daily_return: actualMaxReturn,
        risk_level: strategy === 'conservador' ? 1 : strategy === 'moderado' ? 2 : 3
      };

      // Se foi fornecida uma taxa atual, atualizar também
      if (currentRate !== undefined) {
        // Garantir que não ultrapasse o limite da estratégia
        const limitedRate = Math.min(currentRate, actualMaxReturn);
        updateData.daily_rate = limitedRate / 100; // Converter para decimal
      }

      const { error } = await supabase
        .from('investment_plans')
        .update(updateData)
        .eq('id', planId);

      if (error) throw error;

      // Atualizar estado local
      setPlans(plans.map(plan => 
        plan.id === planId ? { 
          ...plan, 
          trading_strategy: strategy,
          max_daily_return: actualMaxReturn,
          risk_level: strategy === 'conservador' ? 1 : strategy === 'moderado' ? 2 : 3,
          ...(currentRate !== undefined && { daily_rate: Math.min(currentRate, actualMaxReturn) / 100 })
        } : plan
      ));

      toast({
        title: "Sucesso",
        description: "Configuração do plano atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração do plano.",
        variant: "destructive",
      });
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'conservador': return 'bg-green-100 text-green-800';
      case 'moderado': return 'bg-yellow-100 text-yellow-800';
      case 'livre': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskBadge = (level: number) => {
    const levels = {
      1: { text: 'Baixo', color: 'bg-green-100 text-green-800' },
      2: { text: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
      3: { text: 'Alto', color: 'bg-red-100 text-red-800' }
    };
    const risk = levels[level] || levels[1];
    return <Badge className={risk.color}>{risk.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configuração do Trader
          </h2>
          <p className="text-muted-foreground">
            Configure estratégias de trading para cada plano de investimento
          </p>
        </div>
        <Button onClick={loadPlansAndConfigs} variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conservadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter(p => p.trading_strategy === 'conservador').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Moderados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter(p => p.trading_strategy === 'moderado').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Livres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter(p => p.trading_strategy === 'livre').length}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Controle de Volume - Configuração de Taxas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Controle de Taxas Diárias
          </CardTitle>
          <CardDescription>
            Ajuste as taxas de retorno diário usando controles deslizantes como um volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const currentRate = plan.daily_rate * 100;
              const maxRate = plan.max_daily_return;
              
              return (
                <Card key={plan.id} className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{plan.name}</h4>
                    <Badge className={getStrategyColor(plan.trading_strategy)}>
                      {plan.trading_strategy}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Taxa Diária</span>
                      <span className="font-semibold text-blue-600">
                        {currentRate.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <Slider
                        value={[currentRate]}
                        onValueChange={(values) => {
                          const newRate = values[0];
                          updatePlanStrategy(
                            plan.id,
                            plan.trading_strategy,
                            plan.max_daily_return,
                            newRate
                          );
                        }}
                        max={maxRate}
                        min={0.01}
                        step={0.01}
                        className="w-full"
                      />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.01%</span>
                        <span>máx: {maxRate}%</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm font-medium mb-1">Simulação de Retorno</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>R$ 100 → R$ {(100 * (1 + plan.daily_rate)).toFixed(2)} por dia</div>
                        <div>R$ 500 → R$ {(500 * (1 + plan.daily_rate)).toFixed(2)} por dia</div>
                        <div>R$ 1.000 → R$ {(1000 * (1 + plan.daily_rate)).toFixed(2)} por dia</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Volume2 className="h-3 w-3" />
                      <span className="text-muted-foreground">
                        {currentRate < maxRate * 0.3 ? 'Volume Baixo' : 
                         currentRate < maxRate * 0.7 ? 'Volume Médio' : 'Volume Alto'}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Informações sobre as Estratégias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Conservador</CardTitle>
            <CardDescription>Até 2% de retorno diário</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Risco baixo</li>
              <li>• 6-8 operações por dia</li>
              <li>• Foco em estabilidade</li>
              <li>• Ideal para iniciantes</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600">Moderado</CardTitle>
            <CardDescription>Até 3% de retorno diário</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Risco médio</li>
              <li>• 8-10 operações por dia</li>
              <li>• Equilibrio risco/retorno</li>
              <li>• Para investidores experientes</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Livre</CardTitle>
            <CardDescription>Até 4% de retorno diário</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Risco alto</li>
              <li>• 10-12 operações por dia</li>
              <li>• Máximo potencial de lucro</li>
              <li>• Para investidores avançados</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Simulador de Arbitragem Avançado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulador de Arbitragem Avançado
          </CardTitle>
          <CardDescription>
            Configure e simule ganhos em tempo real com suporte a USD e controle total das taxas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controles do Simulador */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações da Simulação
              </h4>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Valor do Investimento</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={simulatorValue}
                      onChange={(e) => setSimulatorValue(parseFloat(e.target.value) || 0)}
                      placeholder="Digite o valor"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUSD(!showUSD)}
                      className="flex items-center gap-1"
                    >
                      <DollarSign className="h-3 w-3" />
                      {showUSD ? 'USD' : 'BRL'}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Período</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={simulatorPeriod}
                      onChange={(e) => setSimulatorPeriod(parseInt(e.target.value) || 1)}
                      placeholder="Dias"
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground self-center">dias</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium mb-1">Taxa de Câmbio</div>
                  <div className="text-xs text-muted-foreground">
                    1 USD = R$ {usdRate.toFixed(2)}
                  </div>
                  {showUSD && (
                    <div className="text-xs text-blue-600 mt-1">
                      {showUSD ? `$${(simulatorValue / usdRate).toFixed(2)} USD` : `R$ ${simulatorValue.toFixed(2)}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Configuração de Taxas Rápida */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Ajuste Rápido de Taxas
              </h4>
              
              <div className="space-y-3">
                {plans.map((plan) => {
                  const currentRate = plan.daily_rate * 100;
                  return (
                    <div key={plan.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{plan.name}</span>
                        <Badge className={getStrategyColor(plan.trading_strategy)}>
                          {plan.trading_strategy}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={currentRate.toFixed(2)}
                          onChange={async (e) => {
                            const newRate = parseFloat(e.target.value);
                            if (newRate <= plan.max_daily_return && newRate >= 0.01) {
                              // Atualizar no banco de dados - investment_plans
                              const { error: planError } = await supabase
                                .from('investment_plans')
                                .update({ daily_rate: newRate / 100 })
                                .eq('id', plan.id);

                              // Atualizar no banco de dados - trading_configurations
                              const { error: configError } = await supabase
                                .from('trading_configurations')
                                .update({ max_daily_return: newRate })
                                .eq('strategy_type', plan.trading_strategy);

                              // Salvar nas configurações do admin (localStorage para uso imediato)
                              const adminSettings = JSON.parse(localStorage.getItem("alphabit_admin_settings") || "{}");
                              adminSettings[`${plan.trading_strategy}DailyRate`] = newRate;
                              localStorage.setItem("alphabit_admin_settings", JSON.stringify(adminSettings));

                              if (planError || configError) {
                                toast({
                                  title: "Erro",
                                  description: "Erro ao sincronizar taxa de arbitragem",
                                  variant: "destructive",
                                });
                              } else {
                                // Atualizar estado local
                                setPlans(prev => prev.map(p => 
                                  p.id === plan.id ? { ...p, daily_rate: newRate / 100 } : p
                                ));
                                
                                toast({
                                  title: "Taxa sincronizada",
                                  description: `Taxa do ${plan.name} atualizada para ${newRate}% nos resultados de arbitragem`,
                                });
                              }
                            }
                          }}
                          className="w-20 text-center"
                          step="0.01"
                          min="0.01"
                          max={plan.max_daily_return}
                        />
                        <span className="text-xs">%</span>
                        <div className="text-xs text-muted-foreground">
                          (máx: {plan.max_daily_return}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Valores de Referência */}
            <div className="space-y-4">
              <h4 className="font-medium">Valores de Referência</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSimulatorValue(100)}
                  className="h-8"
                >
                  {showUSD ? '$18' : 'R$ 100'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSimulatorValue(500)}
                  className="h-8"
                >
                  {showUSD ? '$91' : 'R$ 500'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSimulatorValue(1000)}
                  className="h-8"
                >
                  {showUSD ? '$182' : 'R$ 1K'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSimulatorValue(5000)}
                  className="h-8"
                >
                  {showUSD ? '$909' : 'R$ 5K'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSimulatorValue(10000)}
                  className="h-8"
                >
                  {showUSD ? '$1,818' : 'R$ 10K'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSimulatorValue(50000)}
                  className="h-8"
                >
                  {showUSD ? '$9,091' : 'R$ 50K'}
                </Button>
              </div>
            </div>
          </div>

          {/* Resultados da Simulação de Arbitragem */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Simulação de Arbitragem - Ganhos Variáveis</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrando valores em:</span>
                <Badge variant="outline">
                  {showUSD ? 'USD' : 'BRL'} {showUSD ? '($)' : '(R$)'}
                </Badge>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                <strong>⚠️ AVISO IMPORTANTE:</strong> Os valores são simulações baseadas em arbitragem. 
                Ganhos reais são variáveis e não garantidos. O sistema realiza operações automáticas 
                entre exchanges buscando diferenças de preços.
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const baseValue = showUSD ? simulatorValue / usdRate : simulatorValue;
                const currency = showUSD ? '$' : 'R$';
                const dailyProfit = baseValue * plan.daily_rate;
                const totalProfit = dailyProfit * simulatorPeriod;
                const finalValue = baseValue + totalProfit;
                const profitPercent = (totalProfit / baseValue) * 100;
                const monthlyProfit = dailyProfit * 30;

                // Verificar elegibilidade baseada nos requisitos
                const isEligible = plan.trading_strategy === 'conservador' || 
                                 (plan.trading_strategy === 'moderado' && plan.minimum_indicators <= 10) ||
                                 (plan.trading_strategy === 'livre' && plan.minimum_indicators <= 40);

                return (
                  <Card key={plan.id} className={`p-4 space-y-3 ${!isEligible ? 'opacity-50 bg-muted/20' : ''}`}>
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{plan.name}</h5>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getStrategyColor(plan.trading_strategy)}>
                          {plan.trading_strategy}
                        </Badge>
                        {!isEligible && (
                          <Badge variant="destructive" className="text-xs">
                            Bloqueado
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {isEligible ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Taxa atual:</span>
                          <span className="font-semibold text-blue-600">
                            até {(plan.daily_rate * 100).toFixed(1)}%/dia*
                          </span>
                        </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Investimento:</span>
                        <span className="font-semibold">
                          {currency} {baseValue.toFixed(2)}
                        </span>
                      </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ganho/dia:</span>
                          <span className="font-semibold text-green-600">
                            +{currency} {dailyProfit.toFixed(2)}*
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Em {simulatorPeriod} dias:</span>
                          <span className="font-semibold text-green-600">
                            +{currency} {totalProfit.toFixed(2)}*
                          </span>
                        </div>
                        
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-muted-foreground">Total final:</span>
                          <span className="font-bold text-primary">
                            {currency} {finalValue.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="text-center p-2 bg-muted/30 rounded-lg">
                          <div className="text-xs text-muted-foreground">Rendimento</div>
                          <div className="font-bold text-primary">
                            +{profitPercent.toFixed(1)}%*
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>• Mensal: +{currency} {monthlyProfit.toFixed(2)}*</div>
                          <div>• Anual: +{currency} {(dailyProfit * 365).toFixed(2)}*</div>
                          <div className="text-yellow-600">* Valores não garantidos</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        <div className="text-sm font-medium">Plano Bloqueado</div>
                        <div className="text-xs mt-1">
                          Precisa de {plan.minimum_indicators} indicados ativos no plano anterior
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Comparativo de Moedas */}
          {simulatorValue > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-4">Comparativo BRL vs USD</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">Real (BRL)</div>
                    <div className="text-2xl font-bold">R$ {simulatorValue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      Ganho médio/mês: R$ {(simulatorValue * (plans.reduce((acc, p) => acc + p.daily_rate, 0) / plans.length) * 30).toFixed(2)}
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">Dólar (USD)</div>
                    <div className="text-2xl font-bold">$ {(simulatorValue / usdRate).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      Ganho médio/mês: $ {((simulatorValue / usdRate) * (plans.reduce((acc, p) => acc + p.daily_rate, 0) / plans.length) * 30).toFixed(2)}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                <strong>Aviso Legal:</strong> Esta é uma simulação baseada nas configurações atuais. 
                Resultados reais podem variar significativamente devido a condições de mercado, volatilidade, 
                slippage, taxas de câmbio e outros fatores. Taxa USD/BRL: {usdRate}. 
                Investimentos envolvem riscos de perda.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}