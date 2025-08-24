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
import { Edit, Save, X, Plus, Settings, BarChart3, Volume2 } from "lucide-react";

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
      // Usar a função admin para atualizar os planos (contorna problemas de RLS)
      const updatePromises = plans.map(async plan => {
        console.log(`📝 Salvando plano ${plan.name}:`, {
          id: plan.id,
          daily_rate: plan.daily_rate,
          max_daily_return: plan.max_daily_return
        });
        
        // Determinar qual email admin usar
        const adminEmail = 'admin@clean.com'; // Padrão
        
        const { data, error } = await supabase.rpc('admin_update_investment_plan', {
          plan_id_param: plan.id,
          new_daily_rate: plan.daily_rate,
          new_max_daily_return: plan.max_daily_return,
          admin_email: adminEmail
        });
        
        console.log(`📊 Resultado da atualização do plano ${plan.name}:`, { data, error });
        
        return { data, error, plan_name: plan.name };
      });

      // Aguardar todas as atualizações
      const results = await Promise.all(updatePromises);
      
      console.log('📊 Resultados das atualizações:', results);
      
      // Verificar se alguma teve erro
      const errors = results.filter(result => result.error || !result.data?.success);
      
      if (errors.length > 0) {
        console.error('❌ Erros encontrados:', errors);
        const errorMessages = errors.map(err => `${err.plan_name}: ${err.error?.message || err.data?.error}`);
        throw new Error(`Erro ao salvar planos: ${errorMessages.join(', ')}`);
      }

      // Verificar quantas atualizações foram bem-sucedidas
      const successfulUpdates = results.filter(result => result.data?.success);
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