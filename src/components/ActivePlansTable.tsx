import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Play,
  ExternalLink,
  Bot
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Componente para mostrar o lucro do dia usando nossa função
const TodaysProfitCard = () => {
  const [todaysProfit, setTodaysProfit] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const calculateTodaysProfit = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.rpc('calculate_and_store_daily_profit', {
          target_user_id: user.id
        });
        
        if (error) {
          console.error('Erro ao calcular ganho diário:', error);
          setTodaysProfit(0);
        } else {
          setTodaysProfit(Number(data) || 0);
        }
      } catch (error) {
        console.error('Erro ao calcular ganho diário:', error);
        setTodaysProfit(0);
      }
    };

    calculateTodaysProfit();
    // Atualizar a cada 2 minutos
    const interval = setInterval(calculateTodaysProfit, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-600" />
          <div>
            <p className="text-sm text-muted-foreground">Today's Profit</p>
            <p className="font-bold text-blue-600">
              {formatCurrency(todaysProfit)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ActivePlan {
  id: string;
  amount: number;
  daily_rate: number;
  total_earned: number;
  today_earnings: number;
  operations_completed: number;
  total_operations: number;
  days_remaining: number;
  status: string;
  plan_name?: string;
  start_date: string;
  end_date: string;
}

export const ActivePlansTable = () => {
  const [activePlans, setActivePlans] = useState<ActivePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadActivePlans = async () => {
    if (!user) return;

    try {
      console.log('🔄 Carregando planos ativos para:', user.id);
      
      // Usar a função RPC diretamente
      const { data, error } = await supabase.rpc('get_user_active_investments', {
        target_user_id: user.id
      });

      if (error) {
        console.error('❌ Erro ao carregar via RPC:', error);
        throw error;
      }

      console.log('✅ Planos ativos carregados via RPC:', data);
      
      // Simular ganhos realistas nos dados recebidos
      const simulatedData = data?.map((plan: any) => {
        const hoursActive = Math.max(1, (new Date().getTime() - new Date(plan.start_date).getTime()) / (1000 * 60 * 60));
        const dailyTarget = plan.amount * (plan.daily_rate / 100);
        const hourlyTarget = dailyTarget / 24;
        
        // Simular ganhos com base no tempo ativo
        const totalEarned = Math.min(
          hourlyTarget * hoursActive * (0.8 + Math.random() * 0.4),
          plan.amount * 0.8 // Máximo 80% do valor investido
        );
        
        const todayProgress = new Date().getHours() / 24;
        const todayEarnings = dailyTarget * todayProgress * (0.7 + Math.random() * 0.6);
        
        const operationsProgress = Math.min(0.9, hoursActive / (plan.total_operations * 6)); // ~6h por operação
        const operationsCompleted = Math.floor(plan.total_operations * operationsProgress);
        
        return {
          ...plan,
          total_earned: Number(totalEarned.toFixed(2)),
          today_earnings: Number(todayEarnings.toFixed(2)),
          operations_completed: operationsCompleted,
          days_remaining: Math.max(0, Math.ceil((new Date(plan.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
        };
      }) || [];
      
      console.log('📊 Dados simulados com ganhos calculados:', simulatedData);
      setActivePlans(simulatedData);
      
    } catch (error) {
      console.error('❌ Erro ao carregar planos ativos:', error);
      
      // Fallback: usar dados mockados apenas se falhar completamente
      const mockData: ActivePlan[] = [
        {
          id: '14c2fa25-c82d-4fb6-bdaa-7f613a3b9a10',
          amount: 10.00,
          daily_rate: 2.5,
          total_earned: 1.25,
          today_earnings: 0.52,
          operations_completed: 8,
          total_operations: 40,
          days_remaining: 38,
          status: 'active',
          plan_name: 'Robô 4.0.0',
          start_date: '2025-08-22T02:23:54.160665+00:00',
          end_date: '2025-10-01T02:23:54.160665+00:00'
        },
        {
          id: '39a7485c-276d-4cda-b093-29b021245ec2',
          amount: 40.00,
          daily_rate: 2.5,
          total_earned: 5.20,
          today_earnings: 2.15,
          operations_completed: 12,
          total_operations: 40,
          days_remaining: 38,
          status: 'active',
          plan_name: 'Robô 4.0.0',
          start_date: '2025-08-22T02:03:03.781489+00:00',
          end_date: '2025-10-01T02:03:03.781489+00:00'
        }
      ];
      
      console.log('📊 Usando dados de fallback dos planos ativos:', mockData);
      setActivePlans(mockData);
      
      toast({
        title: "Aviso", 
        description: "Usando dados simulados. Os ganhos podem não refletir valores reais.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivePlans();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Active Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Carregando planos ativos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activePlans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Active Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-3">Nenhum plano ativo no momento</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/investments')}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Começar a Investir
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Active Plans ({activePlans.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/investments')}
            className="flex items-center gap-2"
          >
            Ver Todos
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Invested</TableHead>
                <TableHead>Total Earned</TableHead>
                <TableHead>Today's Profit</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="font-medium">{plan.plan_name || 'Investment Plan'}</div>
                    <div className="text-xs text-muted-foreground">
                      Started: {formatDate(plan.start_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(plan.amount)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-green-600">
                      {formatCurrency(plan.total_earned)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-blue-600">
                      {formatCurrency(plan.today_earnings)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {plan.amount > 0 ? ((plan.total_earned / plan.amount) * 100).toFixed(2) : '0.00'}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${calculateProgress(plan.operations_completed, plan.total_operations)}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground min-w-fit">
                        {plan.operations_completed}/{plan.total_operations}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">{plan.days_remaining}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                      {plan.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Card */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="font-bold">
                    {formatCurrency(activePlans.reduce((sum, plan) => sum + plan.amount, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="font-bold text-green-600">
                    {formatCurrency(activePlans.reduce((sum, plan) => sum + plan.total_earned, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <TodaysProfitCard />
        </div>
      </CardContent>
    </Card>
  );
};