import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Edit, Save, X, Plus, Settings, BarChart3 } from "lucide-react";

interface InvestmentPlan {
  id: string;
  name: string;
  max_daily_return: number;
  trading_strategy: string;
  risk_level: number;
  daily_rate: number;
  status: string;
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
      const updateData: any = {
        trading_strategy: strategy,
        max_daily_return: maxReturn,
        risk_level: strategy === 'conservador' ? 1 : strategy === 'moderado' ? 2 : 3
      };

      // Se foi fornecida uma taxa atual, atualizar também
      if (currentRate !== undefined) {
        updateData.daily_rate = currentRate / 100; // Converter para decimal
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
          max_daily_return: maxReturn,
          risk_level: strategy === 'conservador' ? 1 : strategy === 'moderado' ? 2 : 3,
          ...(currentRate !== undefined && { daily_rate: currentRate / 100 })
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

      {/* Tabela de Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações por Plano</CardTitle>
          <CardDescription>
            Configure a estratégia de trading e a porcentagem diária exata que cada plano vai render
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Estratégia</TableHead>
                <TableHead>Limite Máximo</TableHead>
                <TableHead>Taxa Configurada</TableHead>
                <TableHead>Nível de Risco</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => {
                const isEditing = editingConfig === plan.id;
                const currentRatePercent = (plan.daily_rate * 100).toFixed(2);
                
                return (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={plan.trading_strategy}
                          onValueChange={(value) => 
                            setPlans(plans.map(p => 
                              p.id === plan.id 
                                ? { ...p, trading_strategy: value }
                                : p
                            ))
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservador">Conservador</SelectItem>
                            <SelectItem value="moderado">Moderado</SelectItem>
                            <SelectItem value="livre">Livre</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getStrategyColor(plan.trading_strategy)}>
                          {plan.trading_strategy}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={plan.max_daily_return}
                            onChange={(e) => 
                              setPlans(plans.map(p => 
                                p.id === plan.id 
                                  ? { ...p, max_daily_return: parseFloat(e.target.value) }
                                  : p
                              ))
                            }
                            className="w-20"
                            step="0.1"
                            min="0.1"
                            max="10"
                          />
                          <span className="text-sm">%</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">até {plan.max_daily_return}%</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={currentRatePercent}
                            onChange={(e) => {
                              const newRate = parseFloat(e.target.value);
                              setPlans(plans.map(p => 
                                p.id === plan.id 
                                  ? { ...p, daily_rate: newRate / 100 }
                                  : p
                              ));
                            }}
                            className="w-20"
                            step="0.01"
                            min="0.01"
                            max={plan.max_daily_return}
                          />
                          <span className="text-sm">%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-semibold">{currentRatePercent}%</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ 
                                width: `${(plan.daily_rate * 100 / plan.max_daily_return * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getRiskBadge(plan.risk_level)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                updatePlanStrategy(
                                  plan.id, 
                                  plan.trading_strategy, 
                                  plan.max_daily_return,
                                  parseFloat(currentRatePercent)
                                );
                                setEditingConfig(null);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingConfig(null);
                                loadPlansAndConfigs(); // Recarregar dados originais
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingConfig(plan.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Configuração Rápida */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração Rápida de Taxas</CardTitle>
          <CardDescription>
            Ajuste rapidamente as taxas diárias de todos os planos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{plan.name}</h4>
                    <Badge className={getStrategyColor(plan.trading_strategy)}>
                      {plan.trading_strategy}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Taxa Diária (máx: {plan.max_daily_return}%)
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={(plan.daily_rate * 100).toFixed(2)}
                        onChange={(e) => {
                          const newRate = parseFloat(e.target.value);
                          if (newRate <= plan.max_daily_return) {
                            updatePlanStrategy(
                              plan.id, 
                              plan.trading_strategy, 
                              plan.max_daily_return,
                              newRate
                            );
                          }
                        }}
                        className="flex-1"
                        step="0.01"
                        min="0.01"
                        max={plan.max_daily_return}
                      />
                      <span className="text-sm">%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Exemplo: R$100 → R${(100 * (1 + plan.daily_rate)).toFixed(2)} por dia
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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
    </div>
  );
}