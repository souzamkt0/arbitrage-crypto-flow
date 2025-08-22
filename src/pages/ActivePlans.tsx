import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { TrendingUp, Clock, DollarSign, Target, Activity, BarChart3, Zap, TrendingDown } from "lucide-react";
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
  operations?: {
    id: string;
    pair: string;
    buy_price: number;
    progress: number;
    time_remaining: number;
    status: string;
  }[];
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
          operations:investment_operations(*)
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const calculateTotalInvested = () => {
    return investments.reduce((total, inv) => total + inv.amount, 0);
  };

  const calculateTotalEarned = () => {
    return investments.reduce((total, inv) => total + inv.total_earned, 0);
  };

  const calculateTodayOperations = () => {
    return investments.reduce((total, inv) => total + (inv.today_earnings > 0 ? 1 : 0), 0);
  };

  const calculateROI = () => {
    const totalInvested = calculateTotalInvested();
    const totalEarned = calculateTotalEarned();
    if (totalInvested === 0) return 0;
    return (totalEarned / totalInvested) * 100;
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
      <div className="container mx-auto px-4 py-8 space-y-6">
        
        {/* Trading Ativo Header */}
        <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">TRADING ATIVO</h2>
                  <p className="opacity-90">{investments.length} plano gerando lucros</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{formatCurrency(calculateTotalEarned())}</div>
                <Button 
                  variant="secondary" 
                  className="mt-2"
                  onClick={() => window.location.href = '/investments'}
                >
                  ⚡ Ver Planos de Investimento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planos Ativos Dashboard */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">PLANOS ATIVOS</CardTitle>
                  <CardDescription>Sistema Operacional • {investments.length} Robôs Ativos</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500">+{formatCurrency(calculateTotalEarned())}</div>
                <p className="text-sm text-muted-foreground">Total de Lucros</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Capital Total */}
              <Card className="bg-blue-600 border-blue-500">
                <CardContent className="p-4 text-center text-white">
                  <DollarSign className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm opacity-90">CAPITAL</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculateTotalInvested())}</p>
                  <p className="text-xs opacity-75">Total Investido</p>
                </CardContent>
              </Card>

              {/* Robôs Ativos */}
              <Card className="bg-green-600 border-green-500">
                <CardContent className="p-4 text-center text-white">
                  <Activity className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm opacity-90">ROBÔS</p>
                  <p className="text-2xl font-bold">{investments.length}</p>
                  <p className="text-xs opacity-75">Sistemas Ativos</p>
                </CardContent>
              </Card>

              {/* Operações Hoje */}
              <Card className="bg-purple-600 border-purple-500">
                <CardContent className="p-4 text-center text-white">
                  <Zap className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm opacity-90">OPS</p>
                  <p className="text-2xl font-bold">{calculateTodayOperations()}</p>
                  <p className="text-xs opacity-75">Operações Hoje</p>
                </CardContent>
              </Card>

              {/* ROI Total */}
              <Card className="bg-yellow-600 border-yellow-500">
                <CardContent className="p-4 text-center text-white">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm opacity-90">ROI</p>
                  <p className="text-2xl font-bold">+{calculateROI().toFixed(1)}%</p>
                  <p className="text-xs opacity-75">Retorno Total</p>
                </CardContent>
              </Card>
            </div>

            {/* Market Indicators */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>🟢 LIVE</span>
              </div>
              <span className="text-green-500">● BTC/USDT: $67,234 (+2.34%)</span>
              <span className="text-green-500">● ETH/USDT: $3,847 (+1.87%)</span>
              <span className="text-red-500">● BNB/USDT: $634 (-0.92%)</span>
              <span className="text-green-500">● ROI Total: +143.42%</span>
            </div>
          </CardContent>
        </Card>

        {/* Painel de Trading Bots */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-cyan-500 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Painel de Trading Bots</CardTitle>
                  <CardDescription>Gerencie seus robôs de arbitragem ativos</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-green-500 border-green-500">
                ● SISTEMAS ATIVOS
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Individual Trading Bots */}
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
          <div className="space-y-4">
            {investments.map((investment, index) => (
              <Card key={investment.id} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{investment.plan?.name || 'Robô 4.0.0'}</h3>
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-500">🟢 LIVE</span>
                          <span className="text-muted-foreground">Arbitragem Ativa • 1 op/dia</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Capital */}
                    <div className="bg-blue-600 p-4 rounded-lg text-white text-center">
                      <p className="text-sm opacity-90">CAPITAL</p>
                      <p className="text-xl font-bold">{formatCurrency(investment.amount)}</p>
                    </div>

                    {/* Lucro */}
                    <div className="bg-green-600 p-4 rounded-lg text-white text-center">
                      <p className="text-sm opacity-90">LUCRO</p>
                      <p className="text-xl font-bold">+{formatCurrency(investment.total_earned)}</p>
                    </div>

                    {/* Hoje */}
                    <div className="bg-yellow-600 p-4 rounded-lg text-white text-center">
                      <p className="text-sm opacity-90">HOJE</p>
                      <p className="text-xl font-bold">+{formatCurrency(investment.today_earnings)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso Diário</span>
                      <span>{investment.current_day_progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={investment.current_day_progress} className="h-2" />
                  </div>
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