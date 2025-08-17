import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  TrendingUp, 
  CheckCircle, 
  PlayCircle, 
  Activity,
  Target,
  ArrowLeft,
  DollarSign,
  Clock,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserInvestment {
  id: string;
  investmentId: string;
  investmentName: string;
  amount: number;
  dailyRate: number;
  startDate: string;
  endDate: string;
  totalEarned: number;
  status: "active" | "completed";
  daysRemaining: number;
  currentDayProgress: number;
  todayEarnings: number;
  dailyTarget: number;
  currentOperation?: {
    pair: string;
    buyPrice: number;
    sellPrice: number;
    profit: number;
    progress: number;
    timeRemaining: number;
  };
  operationsCompleted: number;
  totalOperations: number;
}

const ActivePlansPage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserInvestments();
    }
  }, [user]);

  const loadUserInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Simular dados de investimentos ativos para demonstração
      const mockInvestments: UserInvestment[] = [
        {
          id: '1',
          investmentId: '1',
          investmentName: 'Robô 4.0.0',
          amount: 100,
          dailyRate: 2.5,
          startDate: '2024-01-15',
          endDate: '2024-02-24',
          totalEarned: 45.50,
          status: 'active',
          daysRemaining: 15,
          currentDayProgress: 75,
          todayEarnings: 2.25,
          dailyTarget: 2.5,
          operationsCompleted: 2,
          totalOperations: 3,
          currentOperation: {
            pair: 'BTC/USDT',
            buyPrice: 43250,
            sellPrice: 43320,
            profit: 0.85,
            progress: 65,
            timeRemaining: 180
          }
        },
        {
          id: '2',
          investmentId: '2',
          investmentName: 'Robô 4.0.5',
          amount: 200,
          dailyRate: 3.0,
          startDate: '2024-01-10',
          endDate: '2024-02-19',
          totalEarned: 78.30,
          status: 'active',
          daysRemaining: 12,
          currentDayProgress: 45,
          todayEarnings: 3.15,
          dailyTarget: 6.0,
          operationsCompleted: 1,
          totalOperations: 3,
          currentOperation: {
            pair: 'ETH/USDT',
            buyPrice: 2650,
            sellPrice: 2675,
            profit: 1.20,
            progress: 30,
            timeRemaining: 420
          }
        }
      ];

      setUserInvestments(mockInvestments);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeInvestments = userInvestments.filter(inv => inv.status === "active").length;
  const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = userInvestments.reduce((sum, inv) => sum + inv.totalEarned, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando planos ativos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/investments')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Planos Ativos
              </h1>
              <p className="text-muted-foreground">
                Gerencie seus investimentos em andamento
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {activeInvestments} {activeInvestments === 1 ? 'Plano Ativo' : 'Planos Ativos'}
          </Badge>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Investido</div>
            <div className="text-lg font-bold text-foreground">${totalInvested.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Ganhos Totais</div>
            <div className="text-lg font-bold text-trading-green">+${totalEarnings.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Planos Ativos</div>
            <div className="text-lg font-bold text-primary">{activeInvestments}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Operações Hoje</div>
            <div className="text-lg font-bold text-warning">
              {userInvestments.reduce((total, inv) => total + inv.operationsCompleted, 0)}/{activeInvestments * 3}
            </div>
          </div>
        </div>

        {/* Lista de Planos Ativos */}
        {activeInvestments === 0 ? (
          <div className="bg-gradient-to-br from-muted/20 to-muted/40 border border-muted-foreground/20 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
              <h3 className="text-xl font-bold text-muted-foreground">
                Nenhum Plano Ativo
              </h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Você ainda não possui planos de investimento ativos.
            </p>
            <Button 
              onClick={() => navigate('/investments')}
              className="bg-primary hover:bg-primary/90"
            >
              Ver Planos Disponíveis
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userInvestments
              .filter(investment => investment.status === "active")
              .map((investment) => (
                <Card key={investment.id} className="bg-card border-border hover:shadow-lg transition-all duration-300 relative">
                  {/* Indicador visual de ativo */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-trading-green to-trading-green/60 rounded-t-lg"></div>
                  
                  <CardHeader className="border-b border-border/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-trading-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="h-5 w-5 text-trading-green" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg text-foreground truncate">
                            {investment.investmentName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground truncate">
                            Ativo desde {investment.startDate}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-trading-green text-white ml-2 flex-shrink-0 text-xs">
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Valor Investido</span>
                        <span className="font-bold text-foreground">${investment.amount.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Ganhos Atuais</span>
                        <span className="font-bold text-trading-green">+${investment.totalEarned.toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso Diário</span>
                          <span className="text-trading-green font-medium">
                            {investment.operationsCompleted}/3 operações
                          </span>
                        </div>
                        
                        <div className="flex gap-1">
                          {[1, 2, 3].map((op) => (
                            <div
                              key={op}
                              className={`flex-1 h-2 rounded-full ${
                                op <= investment.operationsCompleted 
                                  ? 'bg-trading-green' 
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        
                        {/* Status da operação atual */}
                        {investment.currentOperation && (
                          <div className="bg-muted/30 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-foreground">
                                {investment.currentOperation.pair}
                              </span>
                              <span className="text-sm text-trading-green font-medium">
                                +${investment.currentOperation.profit.toFixed(2)}
                              </span>
                            </div>
                            <Progress value={investment.currentOperation.progress} className="h-2 mb-2" />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                {Math.floor(investment.currentOperation.timeRemaining / 60)}:{(investment.currentOperation.timeRemaining % 60).toString().padStart(2, '0')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {investment.currentOperation.progress.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Dias Restantes</span>
                        <span className="font-bold text-lg text-primary">
                          {investment.daysRemaining} dias
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivePlansPage;
