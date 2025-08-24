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
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estados do simulador
  const [simulatorValue, setSimulatorValue] = useState(1000);
  const [simulatorPeriod, setSimulatorPeriod] = useState(30);
  const [showUSD, setShowUSD] = useState(false);
  const [usdRate] = useState(5.50); // Taxa de câmbio USD/BRL
  
  const { toast } = useToast();

  useEffect(() => {
    loadPlansAndConfigs();
    
    // Configurar sincronização em tempo real
    const channel = supabase
      .channel('investment_plans_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investment_plans'
        },
        (payload) => {
          console.log('🔄 Mudança detectada na tabela investment_plans:', payload);
          // Recarregar dados quando houver mudanças
          loadPlansAndConfigs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPlansAndConfigs = async () => {
    setLoading(true);
    try {
      // Limpar cache do localStorage se existir
      localStorage.removeItem("alphabit_admin_settings");
      
      // Carregar planos de investimento com cache bypass
      const { data: plansData, error: plansError } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('status', 'active');

      if (plansError) throw plansError;

      console.log('📊 Planos carregados do banco:', plansData);

      // Carregar configurações de trading
      const { data: configsData, error: configsError } = await supabase
        .from('trading_configurations')
        .select('*')
        .eq('active', true);

      if (configsError) throw configsError;

      console.log('⚙️ Configurações carregadas:', configsData);

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

  const savePlansConfiguration = async () => {
    console.log('🔄 Iniciando salvamento dos planos...', plans);
    setLoading(true);
    try {
      // Salvar cada plano
      const updatePromises = plans.map(plan => {
        console.log(`📝 Salvando plano ${plan.name}:`, {
          id: plan.id,
          daily_rate: plan.daily_rate,
          max_daily_return: plan.max_daily_return
        });
        
        return supabase
          .from('investment_plans')
          .update({
            daily_rate: plan.daily_rate,
            max_daily_return: plan.max_daily_return,
            updated_at: new Date().toISOString()
          })
          .eq('id', plan.id);
      });

      // Aguardar todas as atualizações
      const results = await Promise.all(updatePromises);
      
      console.log('📊 Resultados das atualizações:', results);
      
      // Verificar se alguma teve erro
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        console.error('❌ Erros encontrados:', errors);
        throw new Error(`Erro ao salvar ${errors.length} plano(s)`);
      }

      // Status 204 significa que a atualização foi bem-sucedida
      const successfulUpdates = results.filter(result => result.status === 204 || result.status === 200);
      console.log(`✅ ${successfulUpdates.length} de ${results.length} atualizações foram bem-sucedidas`);
      
      if (successfulUpdates.length === 0) {
        throw new Error('Nenhuma atualização foi processada');
      }

      // Sincronizar configurações do admin
      const adminSettings = JSON.parse(localStorage.getItem("alphabit_admin_settings") || "{}");
      plans.forEach(plan => {
        adminSettings[`${plan.trading_strategy}DailyRate`] = plan.daily_rate * 100;
      });
      localStorage.setItem("alphabit_admin_settings", JSON.stringify(adminSettings));
      
      console.log('✅ Todas as atualizações foram bem-sucedidas');
      console.log('💾 Settings salvos no localStorage:', adminSettings);

      setHasChanges(false);
      toast({
        title: "Sucesso",
        description: "Configurações dos planos salvos com sucesso!",
      });
      
      // Recarregar dados para confirmar
      await loadPlansAndConfigs();
      
    } catch (error) {
      console.error('❌ Erro ao salvar planos:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações dos planos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
            Configuração do Trader
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure estratégias de trading para cada plano de investimento
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            onClick={savePlansConfiguration} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Planos'}
          </Button>
          <Button onClick={loadPlansAndConfigs} variant="outline" className="w-full sm:w-auto">
            <BarChart3 className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alerta de mudanças não salvas */}
      {hasChanges && (
        <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse flex-shrink-0"></div>
            <span className="text-sm text-yellow-800">Você tem alterações não salvas</span>
          </div>
          <Button 
            onClick={savePlansConfiguration}
            disabled={loading}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto"
          >
            {loading ? 'Salvando...' : 'Salvar Agora'}
          </Button>
        </div>
      )}

      {/* Controle de Volume por Estratégia */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Controle de Taxa por Estratégia
          </CardTitle>
          <CardDescription className="text-sm">
            Ajuste a taxa diária para cada estratégia de trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan) => {
              const currentRate = plan.daily_rate * 100;
              const maxRate = plan.max_daily_return;
              
              return (
                <Card key={plan.id} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-medium text-sm sm:text-base">{plan.name}</h3>
                    <Badge className={getStrategyColor(plan.trading_strategy)}>
                      {plan.trading_strategy}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-xs sm:text-sm">Taxa Diária</span>
                      <span className="font-semibold text-blue-600 text-sm sm:text-base">
                        {currentRate.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <Slider
                        value={[currentRate]}
                        onValueChange={(values) => {
                          const newRate = values[0];
                          // Marcar que há mudanças para ativar o botão salvar
                          setHasChanges(true);
                          // Atualizar estado local imediatamente
                          setPlans(prev => prev.map(p => 
                            p.id === plan.id ? { ...p, daily_rate: newRate / 100 } : p
                          ));
                        }}
                        max={maxRate}
                        min={0.01}
                        step={0.01}
                        className="w-full h-2 touch-pan-x" // Melhor para touch
                      />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.01%</span>
                        <span>máx: {maxRate}%</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs sm:text-sm font-medium mb-1">Simulação de Retorno</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>R$ 100:</span>
                          <span>R$ {(100 * (1 + plan.daily_rate)).toFixed(2)}/dia</span>
                        </div>
                        <div className="flex justify-between">
                          <span>R$ 500:</span>
                          <span>R$ {(500 * (1 + plan.daily_rate)).toFixed(2)}/dia</span>
                        </div>
                        <div className="flex justify-between">
                          <span>R$ 1.000:</span>
                          <span>R$ {(1000 * (1 + plan.daily_rate)).toFixed(2)}/dia</span>
                        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-green-600 text-base sm:text-lg">Robô 4.0.0</CardTitle>
            <CardDescription className="text-sm">Paga até 2% (variável, não garantido fixo)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="text-xs sm:text-sm space-y-1">
              <li>• Sistema de arbitragem</li>
              <li>• Ganhos não garantidos fixos</li>
              <li>• Pode ganhar menos de 2%</li>
              <li>• Sem requisitos de indicação</li>
              <li>• Simulação com gráficos</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="p-3 sm:p-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-yellow-600 text-base sm:text-lg">Robô 4.0.5</CardTitle>
            <CardDescription className="text-sm">Paga até 3% (requer 10 indicados ativos)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="text-xs sm:text-sm space-y-1">
              <li>• Sistema automatizado</li>
              <li>• Requer 10 pessoas ativas no 4.0.0</li>
              <li>• Indicados devem ter planos ativos</li>
              <li>• Não ativa sem os requisitos</li>
              <li>• Ganhos até 3%</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="p-3 sm:p-4 md:col-span-2 lg:col-span-1">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-red-600 text-base sm:text-lg">Robô 4.1.0</CardTitle>
            <CardDescription className="text-sm">Paga até 4% (requer 40 indicados ativos)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="text-xs sm:text-sm space-y-1">
              <li>• Sistema automatizado</li>
              <li>• Requer 40 pessoas ativas no 4.0.5</li>
              <li>• Indicados devem estar no plano 4.0.5</li>
              <li>• Máximo potencial de lucro</li>
              <li>• Ganhos até 4%</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Simulador Avançado de Arbitragem */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
            Simulador Avançado de Arbitragem
          </CardTitle>
          <CardDescription className="text-sm">
            Simule ganhos potenciais com valores personalizados em BRL ou USD
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Controles do Simulador */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Toggle BRL/USD */}
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <Label htmlFor="currency-toggle" className="text-sm font-medium">
                  Moeda:
                </Label>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${!showUSD ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                    BRL (R$)
                  </span>
                  <Switch
                    id="currency-toggle"
                    checked={showUSD}
                    onCheckedChange={setShowUSD}
                  />
                  <span className={`text-sm ${showUSD ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                    USD ($)
                  </span>
                </div>
              </div>
              
              {/* Valor de Investimento */}
              <div className="flex-1 space-y-2">
                <Label htmlFor="simulator-value" className="text-sm font-medium">
                  Valor do Investimento
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {showUSD ? '$' : 'R$'}
                  </span>
                  <Input
                    id="simulator-value"
                    type="number"
                    value={simulatorValue}
                    onChange={(e) => setSimulatorValue(parseFloat(e.target.value) || 0)}
                    placeholder="Digite o valor"
                    className="flex-1 text-base sm:text-sm" // Texto maior no mobile
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Período */}
              <div className="flex-1 space-y-2">
                <Label htmlFor="simulator-period" className="text-sm font-medium">
                  Período (dias)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="simulator-period"
                    type="number"
                    value={simulatorPeriod}
                    onChange={(e) => setSimulatorPeriod(parseInt(e.target.value) || 1)}
                    placeholder="Dias"
                    className="flex-1 text-base sm:text-sm" // Texto maior no mobile
                    min="1"
                    max="365"
                  />
                  <span className="text-sm text-muted-foreground">dias</span>
                </div>
              </div>
            </div>

            {/* Taxa de Câmbio */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">Taxa de Câmbio</div>
                  <div className="text-xs text-muted-foreground">
                    1 USD = R$ {usdRate.toFixed(2)}
                  </div>
                </div>
                {showUSD && (
                  <div className="text-xs text-blue-600">
                    {`$${(simulatorValue / usdRate).toFixed(2)} USD = R$ ${simulatorValue.toFixed(2)}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuração de Taxas Rápida - Mobile Otimizada */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2 text-base sm:text-lg">
              <Percent className="h-4 w-4" />
              Ajuste Rápido de Taxas
            </h4>
            
            <div className="space-y-3">
              {plans.map((plan) => {
                const currentRate = plan.daily_rate * 100;
                return (
                  <div key={plan.id} className="p-3 border rounded-lg space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-sm font-medium">{plan.name}</span>
                      <Badge className={getStrategyColor(plan.trading_strategy)}>
                        {plan.trading_strategy}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="number"
                          value={currentRate.toFixed(2)}
                          onChange={(e) => {
                            const newRate = parseFloat(e.target.value);
                            if (newRate <= plan.max_daily_return && newRate >= 0.01) {
                              // Marcar que há mudanças
                              setHasChanges(true);
                              // Atualizar estado local imediatamente
                              setPlans(prev => prev.map(p => 
                                p.id === plan.id ? { ...p, daily_rate: newRate / 100 } : p
                              ));
                            }
                          }}
                          className="w-20 text-center text-base sm:text-sm" // Texto maior no mobile
                          step="0.01"
                          min="0.01"
                          max={plan.max_daily_return}
                        />
                        <span className="text-xs">%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        (máx: {plan.max_daily_return}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Valores de Referência - Mobile Grid */}
          <div className="space-y-4">
            <h4 className="font-medium text-base">Valores de Referência</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSimulatorValue(100)}
                className="h-10 text-xs sm:text-sm" // Botões maiores no mobile
              >
                {showUSD ? '$18' : 'R$ 100'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSimulatorValue(500)}
                className="h-10 text-xs sm:text-sm"
              >
                {showUSD ? '$91' : 'R$ 500'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSimulatorValue(1000)}
                className="h-10 text-xs sm:text-sm"
              >
                {showUSD ? '$182' : 'R$ 1K'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSimulatorValue(5000)}
                className="h-10 text-xs sm:text-sm"
              >
                {showUSD ? '$909' : 'R$ 5K'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSimulatorValue(10000)}
                className="h-10 text-xs sm:text-sm"
              >
                {showUSD ? '$1,818' : 'R$ 10K'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSimulatorValue(50000)}
                className="h-10 text-xs sm:text-sm"
              >
                {showUSD ? '$9,091' : 'R$ 50K'}
              </Button>
            </div>
          </div>

          {/* Resultados da Simulação de Arbitragem */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-medium text-base sm:text-lg">Simulação de Arbitragem - Ganhos Variáveis</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Mostrando valores em:</span>
                <Badge variant="outline" className="text-xs">
                  {showUSD ? 'USD' : 'BRL'} {showUSD ? '($)' : '(R$)'}
                </Badge>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-xs sm:text-sm text-yellow-800">
                <strong>⚠️ AVISO IMPORTANTE:</strong> Os valores são simulações baseadas em arbitragem. 
                Ganhos reais são variáveis e não garantidos. O sistema realiza operações automáticas 
                entre exchanges buscando diferenças de preços.
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
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
                  <Card key={plan.id} className={`p-3 sm:p-4 space-y-3 ${!isEligible ? 'opacity-50 bg-muted/20' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h5 className="font-medium text-sm sm:text-base">{plan.name}</h5>
                      <div className="flex flex-col items-start sm:items-end gap-1">
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
                      <div className="space-y-2 text-xs sm:text-sm">
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
                          <div className="flex justify-between">
                            <span>Mensal:</span>
                            <span>+{currency} {monthlyProfit.toFixed(2)}*</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Anual:</span>
                            <span>+{currency} {(dailyProfit * 365).toFixed(2)}*</span>
                          </div>
                          <div className="text-yellow-600 text-center">* Valores não garantidos</div>
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

          {/* Comparativo de Moedas - Mobile Otimizado */}
          {simulatorValue > 0 && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
              <h4 className="font-medium mb-3 sm:mb-4 text-base sm:text-lg">Comparativo BRL vs USD</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card className="p-3 sm:p-4">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-green-600">Real (BRL)</div>
                    <div className="text-xl sm:text-2xl font-bold">R$ {simulatorValue.toFixed(2)}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Ganho estimado: R$ {(simulatorValue * 0.025).toFixed(2)}/dia*
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3 sm:p-4">
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-blue-600">Dólar (USD)</div>
                    <div className="text-xl sm:text-2xl font-bold">
                      $ {(simulatorValue / usdRate).toFixed(2)}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Ganho estimado: $ {((simulatorValue / usdRate) * 0.025).toFixed(2)}/dia*
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="mt-3 sm:mt-4 text-xs text-center text-muted-foreground">
                * Baseado na taxa média de 2.5% ao dia (valores não garantidos)
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
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

      {/* Botão de Salvar Flutuante */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={savePlansConfiguration}
            disabled={loading}
            size="lg"
            className="bg-green-600 hover:bg-green-700 shadow-lg animate-pulse"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      )}

      {/* Botão de Salvar Adicional no final */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-green-800">Configurações de Trading</h3>
            <p className="text-sm text-green-600">
              {hasChanges ? 'Você tem alterações não salvas' : 'Configurações sincronizadas'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={loadPlansAndConfigs} 
              variant="outline" 
              disabled={loading}
              className="border-green-300 hover:bg-green-100"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
            <Button 
              onClick={savePlansConfiguration}
              disabled={loading || !hasChanges}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Tudo'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}