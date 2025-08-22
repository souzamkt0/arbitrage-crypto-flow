import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { TrendingUp, Clock, DollarSign, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Investment {
  id: string;
  amount: number;
  daily_rate: number;
  total_earned: number;
  today_earnings: number;
  status: string;
  start_date: string;
  end_date: string;
  operations_completed: number;
  total_operations: number;
  current_day_progress: number;
  plan: {
    name: string;
    robot_version: string;
    description: string;
  };
  current_operation?: {
    id: string;
    pair: string;
    buy_price: number;
    progress: number;
    time_remaining: number;
    status: string;
  };
}

const ActivePlans = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchActiveInvestments();
    }
  }, [user]);

  const fetchActiveInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          plan:investment_plans(name, robot_version, description),
          current_operation:current_operations(*)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar investimentos ativos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const executeArbitrageOperation = async (investmentId: string) => {
    setOperationInProgress(prev => new Set(prev).add(investmentId));
    
    try {
      // Simular execução de operação de arbitragem
      const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
      const basePrice = Math.random() * 50000 + 20000; // Preço base aleatório
      const timeRemaining = Math.floor(Math.random() * 300) + 60; // 1-5 minutos
      
      // Criar nova operação
      const { data: operation, error: operationError } = await supabase
        .from('current_operations')
        .insert({
          user_investment_id: investmentId,
          pair: randomPair,
          buy_price: basePrice,
          sell_price: 0,
          profit: 0,
          progress: 0,
          time_remaining: timeRemaining,
          status: 'executing'
        })
        .select()
        .single();

      if (operationError) throw operationError;

      // Simular progresso da operação
      const progressInterval = setInterval(async () => {
        const currentProgress = Math.min((300 - timeRemaining) / 300 * 100, 100);
        const remainingTime = Math.max(timeRemaining - 30, 0);
        
        await supabase
          .from('current_operations')
          .update({
            progress: currentProgress,
            time_remaining: remainingTime
          })
          .eq('id', operation.id);

        if (remainingTime <= 0) {
          clearInterval(progressInterval);
          await completeOperation(operation.id, investmentId);
        }
      }, 30000); // Atualizar a cada 30 segundos

      toast({
        title: "Operação Iniciada",
        description: `Arbitragem ${randomPair} iniciada com sucesso!`,
      });

      fetchActiveInvestments();
    } catch (error) {
      console.error('Erro ao executar operação:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar operação de arbitragem",
        variant: "destructive",
      });
    } finally {
      setOperationInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(investmentId);
        return newSet;
      });
    }
  };

  const completeOperation = async (operationId: string, investmentId: string) => {
    try {
      const investment = investments.find(inv => inv.id === investmentId);
      if (!investment) return;

      const profitPercentage = (Math.random() * 0.02) + 0.005; // 0.5% a 2.5% de lucro
      const profit = investment.amount * profitPercentage;
      const sellPrice = Math.random() * 50000 + 25000;

      // Completar operação
      await supabase
        .from('current_operations')
        .update({
          sell_price: sellPrice,
          profit: profit,
          progress: 100,
          time_remaining: 0,
          status: 'completed'
        })
        .eq('id', operationId);

      // Atualizar investimento
      await supabase
        .from('user_investments')
        .update({
          total_earned: investment.total_earned + profit,
          today_earnings: investment.today_earnings + profit,
          operations_completed: investment.operations_completed + 1
        })
        .eq('id', investmentId);

      // Registrar no histórico de trading
      await supabase
        .from('trading_history')
        .insert({
          user_id: user?.id,
          operation_id: operationId,
          pair: investment.current_operation?.pair || 'BTC/USDT',
          type: 'arbitrage',
          amount: investment.amount,
          buy_price: investment.current_operation?.buy_price || 0,
          sell_price: sellPrice,
          profit: profit,
          profit_percent: profitPercentage * 100,
          execution_time: 300,
          status: 'completed'
        });

      toast({
        title: "Operação Concluída",
        description: `Lucro de $${profit.toFixed(2)} obtido!`,
      });

      fetchActiveInvestments();
    } catch (error) {
      console.error('Erro ao completar operação:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando planos ativos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Planos Ativos</h1>
          <p className="text-muted-foreground">Execute operações de arbitragem em seus investimentos ativos</p>
        </div>

        {investments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum plano ativo</h3>
              <p className="text-muted-foreground mb-4">
                Você não possui investimentos ativos no momento.
              </p>
              <Button onClick={() => window.location.href = '/investments'}>
                Ver Planos Disponíveis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {investments.map((investment) => (
              <Card key={investment.id} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{investment.plan?.name}</CardTitle>
                    <Badge variant="default">
                      {investment.plan?.robot_version}
                    </Badge>
                  </div>
                  <CardDescription>{investment.plan?.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Investimento</p>
                      <p className="font-semibold">{formatCurrency(investment.amount)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Taxa Diária</p>
                      <p className="font-semibold text-green-600">{investment.daily_rate}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Ganho</p>
                      <p className="font-semibold text-green-600">{formatCurrency(investment.total_earned)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Hoje</p>
                      <p className="font-semibold">{formatCurrency(investment.today_earnings)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Operações</span>
                      <span>{investment.operations_completed}/{investment.total_operations}</span>
                    </div>
                    <Progress 
                      value={(investment.operations_completed / investment.total_operations) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {calculateDaysRemaining(investment.end_date)} dias restantes
                      </span>
                    </div>
                  </div>

                  {investment.current_operation && investment.current_operation.status === 'executing' ? (
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Operação Ativa</span>
                        <Badge variant="outline">{investment.current_operation.pair}</Badge>
                      </div>
                      <Progress value={investment.current_operation.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Preço: {formatCurrency(investment.current_operation.buy_price)}</span>
                        <span>{Math.floor(investment.current_operation.time_remaining / 60)}min restantes</span>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => executeArbitrageOperation(investment.id)}
                      disabled={operationInProgress.has(investment.id)}
                      className="w-full"
                    >
                      {operationInProgress.has(investment.id) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Executando...
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Executar Arbitragem
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ActivePlans;