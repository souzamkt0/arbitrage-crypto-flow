import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
  BarChart3,
  Timer,
  Plus,
  Zap,
  Star,
  Crown,
  Trophy
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
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickedInvestments, setClickedInvestments] = useState<Set<string>>(new Set());
  const [processingOperations, setProcessingOperations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadUserInvestments();
    }
  }, [user]);

  const loadUserInvestments = async () => {
    try {
      console.log('🔄 [ActivePlans] Buscando investimentos ativos para usuário:', user?.id);
      
      // Debug: Buscar todos os investimentos para verificar
      const { data: allInvestments } = await supabase
        .from('user_investments')
        .select('*')
        .eq('status', 'active');
      
      console.log('🔍 [ActivePlans] Todos os investimentos ativos:', allInvestments);
      
      const { data: investmentsData, error } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [ActivePlans] Erro ao buscar investimentos:', error);
        throw error;
      }

      console.log('📊 [ActivePlans] Investimentos encontrados para o usuário:', investmentsData);
      console.log('👤 [ActivePlans] ID do usuário atual:', user?.id);

      if (!investmentsData || investmentsData.length === 0) {
        console.log('⚠️ [ActivePlans] Nenhum investimento ativo encontrado para este usuário');
        setUserInvestments([]);
        setLoading(false);
        return;
      }

      // Buscar nomes dos planos
      const { data: plansData, error: plansError } = await supabase
        .from('investment_plans')
        .select('id, name, robot_version')
        .in('id', investmentsData.map(inv => inv.plan_id));

      if (plansError) {
        console.error('❌ [ActivePlans] Erro ao buscar planos:', plansError);
      }

      const plansMap = new Map();
      if (plansData) {
        plansData.forEach(plan => {
          plansMap.set(plan.id, plan.name);
        });
      }

      const formattedInvestments: UserInvestment[] = investmentsData.map(investment => {
        console.log('🔍 [ActivePlans] Processando investimento:', investment.id);
        
        const startDate = new Date(investment.start_date || investment.created_at);
        if (isNaN(startDate.getTime())) {
          console.warn('Data inválida para investimento:', investment.id);
          return null;
        }
        
        const endDate = new Date(investment.end_date);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        const currentHour = now.getHours();
        const currentDayProgress = (currentHour / 24) * 100;
        
        const dailyRate = investment.daily_rate || 2.5;
        const dailyTarget = investment.amount * (dailyRate / 100);
        const todayEarnings = investment.today_earnings || 0;

        const planName = plansMap.get(investment.plan_id) || 'Robô de Arbitragem';

        return {
          id: investment.id,
          investmentId: investment.plan_id,
          investmentName: planName,
          amount: investment.amount,
          dailyRate: dailyRate,
          startDate: investment.start_date || investment.created_at,
          endDate: investment.end_date,
          totalEarned: investment.total_earned || 0,
          status: investment.status,
          daysRemaining,
          currentDayProgress: investment.current_day_progress || currentDayProgress,
          todayEarnings,
          dailyTarget: investment.daily_target || dailyTarget,
          operationsCompleted: investment.operations_completed || 0,
          totalOperations: investment.total_operations || 40,
          currentOperation: {
            pair: 'BTC/USDT',
            buyPrice: 43250,
            sellPrice: 43320,
            profit: 0,
            progress: 0,
            timeRemaining: 0
          }
        };
      }).filter(Boolean);

      console.log('✅ [ActivePlans] Investimentos formatados:', formattedInvestments);
      setUserInvestments(formattedInvestments);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular ganhos atuais baseados nas operações realizadas HOJE
  const calculateCurrentEarnings = (investment: UserInvestment) => {
    // Cada operação rende 1.25% (metade de 2.5%)
    const operationRate = 1.25;
    const earningsPerOperation = (investment.amount * operationRate) / 100;
    
    // Ganhos atuais = apenas as operações realizadas hoje
    const todayEarnings = earningsPerOperation * investment.operationsCompleted;
    return todayEarnings;
  };

  // Calcular progresso baseado no contador de 24h
  const calculateProgress = (investment: UserInvestment) => {
    // Simular progresso baseado em 24h (86400 segundos)
    const totalSeconds = 86400;
    const elapsedSeconds = totalSeconds - (investment.currentOperation?.timeRemaining || 0);
    return Math.min((elapsedSeconds / totalSeconds) * 100, 100);
  };

  // Verificar se pode executar operação baseado no tempo
  const canExecuteOperationBasedOnTime = (investment: UserInvestment) => {
    // Simular verificação de 24h - em produção seria baseado no timestamp real
    const now = new Date();
    const lastOperationTime = investment.currentOperation?.timeRemaining || 0;
    
    // Se não há operações hoje ou se passou 24h, pode executar
    if (investment.operationsCompleted === 0) return true;
    
    // Simular que após 24h (86400 segundos) libera novamente
    const timeSinceLastOperation = 86400 - lastOperationTime;
    return timeSinceLastOperation >= 86400; // 24h em segundos
  };

  // Função para executar operação
  const executeOperation = async (investment: UserInvestment) => {
    // Verificar se pode executar baseado no tempo
    if (!canExecuteOperationBasedOnTime(investment)) {
      toast({
        title: "⏰ Aguarde 24h",
        description: "Aguarde 24h para executar novas operações de arbitragem.",
        variant: "destructive"
      });
      return;
    }

    // Se completou 2 operações e ainda não passou 24h, não pode executar
    if (investment.operationsCompleted >= 2 && !canExecuteOperationBasedOnTime(investment)) {
      toast({
        title: "⚠️ Limite Atingido",
        description: "Você já completou as 2 operações diárias. Aguarde o próximo dia.",
        variant: "destructive"
      });
      return;
    }

    // Reset do contador se passou 24h
    if (investment.operationsCompleted >= 2 && canExecuteOperationBasedOnTime(investment)) {
      // Reset das operações para o novo dia
      const resetInvestment = {
        ...investment,
        operationsCompleted: 0,
        currentOperation: {
          pair: '',
          buyPrice: 0,
          sellPrice: 0,
          profit: 0,
          progress: 0,
          timeRemaining: 86400 // 24h em segundos
        }
      };
      
      // Atualizar lista localmente
      const updatedInvestments = userInvestments.map(inv => 
        inv.id === investment.id ? resetInvestment : inv
      );
      
      setUserInvestments(updatedInvestments);
      
      // Salvar reset no Supabase
      if (user) {
        await supabase
          .from('user_investments')
          .update({
            operations_completed: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', investment.id)
          .eq('user_id', user.id);
      }
      
      toast({
        title: "🔄 Novo Dia Liberado!",
        description: "Contador resetado. Você pode executar 2 novas operações.",
      });
      
      return;
    }

    if (processingOperations.has(investment.id)) return;
    
    setProcessingOperations(prev => new Set(prev).add(investment.id));

    try {
      // Calcular ganho da operação (1.25% por operação)
      const operationProfit = (investment.amount * 1.25) / 100;
      
      // Verificar se o cálculo está correto
      console.log(`Cálculo: $${investment.amount} × 1.25% = $${operationProfit.toFixed(2)}`);
      
      // Simular operação de trading
      const tradingPairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
      const randomPair = tradingPairs[Math.floor(Math.random() * tradingPairs.length)];
      
      // Atualizar investimento localmente
      const updatedInvestment = {
        ...investment,
        operationsCompleted: investment.operationsCompleted + 1,
        totalEarned: investment.totalEarned + operationProfit,
        currentOperation: {
          pair: randomPair,
          buyPrice: 0,
          sellPrice: 0,
          profit: operationProfit,
          progress: 100,
          timeRemaining: 86400 // 24h em segundos para próxima liberação
        }
      };

      // Atualizar lista de investimentos
      const updatedInvestments = userInvestments.map(inv => 
        inv.id === investment.id ? updatedInvestment : inv
      );

      setUserInvestments(updatedInvestments);

      // Salvar no Supabase
      if (user) {
        // Atualizar investimento
        const { error: updateError } = await supabase
          .from('user_investments')
          .update({
            operations_completed: updatedInvestment.operationsCompleted,
            total_earned: updatedInvestment.totalEarned,
            updated_at: new Date().toISOString()
          })
          .eq('id', investment.id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Erro ao atualizar investimento:', updateError);
          toast({
            title: "Erro",
            description: "Erro ao salvar operação. Tente novamente.",
            variant: "destructive"
          });
          return;
        }

        // Salvar no histórico de operações
        const { error: historyError } = await supabase
          .from('trading_profits')
          .insert({
            user_id: user.id,
            investment_amount: investment.amount,
            daily_rate: 2.5,
            plan_name: investment.investmentName,
            total_profit: operationProfit,
            exchanges_count: 1,
            completed_operations: 1,
            execution_time_seconds: 0,
            profit_per_exchange: operationProfit,
            metadata: {
              pair: randomPair,
              operation_number: updatedInvestment.operationsCompleted,
              operation_type: 'daily_operation',
              operation_date: new Date().toISOString()
            }
          });

        if (historyError) {
          console.error('Erro ao salvar histórico:', historyError);
        }
      }

      // Mostrar toast de sucesso
      toast({
        title: "✅ Operação Executada!",
        description: `Ganho de $${operationProfit.toFixed(2)} registrado. Operação ${updatedInvestment.operationsCompleted}/2.`,
      });

      // Se completou as 2 operações, mostrar mensagem especial
      if (updatedInvestment.operationsCompleted >= 2) {
        setTimeout(() => {
          toast({
            title: "🎉 Operações Diárias Concluídas!",
            description: `Aguarde 24h para executar novas operações.`,
          });
        }, 1000);
      }

    } catch (error) {
      console.error('Erro ao executar operação:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar operação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setProcessingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(investment.id);
        return newSet;
      });
    }
  };

  // Função para lidar com clique duplo na regra 2.5%
  const handleDoubleClick = (investmentId: string) => {
    const newClicked = new Set(clickedInvestments);
    if (newClicked.has(investmentId)) {
      newClicked.delete(investmentId);
    } else {
      newClicked.add(investmentId);
    }
    setClickedInvestments(newClicked);
  };

  const activeInvestments = userInvestments.filter(inv => inv.status === "active").length;
  const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = userInvestments.reduce((sum, inv) => sum + inv.totalEarned, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trading-green mx-auto"></div>
            <p className="mt-4 text-slate-300 text-lg">Carregando planos ativos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Premium */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/investments')}
              className="flex items-center gap-2 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-trading-green to-emerald-400 bg-clip-text text-transparent">
                Planos Ativos Premium
              </h1>
              <p className="text-slate-300 text-lg">
                Gerencie seus investimentos em andamento
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-trading-green to-emerald-400 text-white text-sm font-bold border-0">
            <Trophy className="h-4 w-4 mr-2" />
            {activeInvestments} {activeInvestments === 1 ? 'Plano Ativo' : 'Planos Ativos'}
          </Badge>
        </div>

        {/* Estatísticas Gerais Premium */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-2xl border-2 border-slate-600/30 backdrop-blur-sm">
          <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Total Investido</div>
            <div className="text-2xl font-bold text-white">${totalInvested.toFixed(2)}</div>
            <div className="mt-2">
              <DollarSign className="h-4 w-4 text-trading-green mx-auto" />
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-trading-green/10 to-emerald-400/10 rounded-xl border border-trading-green/30">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Ganhos Totais</div>
            <div className="text-2xl font-bold text-trading-green">+${totalEarnings.toFixed(2)}</div>
            <div className="mt-2">
              <TrendingUp className="h-4 w-4 text-trading-green mx-auto" />
            </div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Planos Ativos</div>
            <div className="text-2xl font-bold text-white">{activeInvestments}</div>
            <div className="mt-2">
              <Star className="h-4 w-4 text-trading-green mx-auto" />
            </div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Operações Hoje</div>
            <div className="text-2xl font-bold text-warning">
              {userInvestments.reduce((total, inv) => total + inv.operationsCompleted, 0)}/{activeInvestments * 2}
            </div>
            <div className="mt-2">
              <Activity className="h-4 w-4 text-trading-green mx-auto" />
            </div>
          </div>
        </div>

        {/* Lista de Planos Ativos */}
        {activeInvestments === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-2 border-trading-green/20 rounded-2xl p-12 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="p-4 bg-trading-green/10 rounded-full">
                <Target className="h-12 w-12 text-trading-green" />
              </div>
              <h3 className="text-3xl font-bold text-white">
                Nenhum Plano Ativo
              </h3>
            </div>
            <p className="text-slate-300 mb-8 text-xl">
              Você ainda não possui planos de investimento ativos.
            </p>
            <Button 
              onClick={() => navigate('/investments')}
              className="bg-gradient-to-r from-trading-green to-emerald-400 hover:from-trading-green/90 hover:to-emerald-400/90 text-white text-lg px-8 py-3"
            >
              Ver Planos Disponíveis
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userInvestments
              .filter(investment => investment.status === "active")
              .map((investment) => {
                const currentEarnings = calculateCurrentEarnings(investment);
                const progress = calculateProgress(investment);
                const isClicked = clickedInvestments.has(investment.id);
                const isProcessing = processingOperations.has(investment.id);
                const canExecuteOperation = investment.operationsCompleted < 2;
                
                return (
                  <Card key={investment.id} className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-trading-green/20 hover:border-trading-green/40 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                    {/* Efeito de brilho no topo */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-trading-green via-emerald-400 to-trading-green rounded-t-lg"></div>
                    
                    {/* Efeito de fundo animado */}
                    <div className="absolute inset-0 bg-gradient-to-br from-trading-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardHeader className="border-b border-slate-600/50 p-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-trading-green/20 to-emerald-400/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-trading-green/30">
                            <TrendingUp className="h-6 w-6 text-trading-green" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-xl text-white font-bold truncate">
                              {investment.investmentName}
                            </CardTitle>
                            <p className="text-slate-300 text-sm truncate">
                              2 operações diárias • Sistema Premium
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-trading-green to-emerald-400 text-white ml-3 flex-shrink-0 text-xs font-bold border-0">
                          <PlayCircle className="h-3 w-3 mr-1" />
                          ATIVO
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 relative z-10">
                      <div className="space-y-5">
                        {/* Valor Investido */}
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                          <span className="text-slate-300 font-medium">Valor Investido</span>
                          <span className="font-bold text-xl text-white">${investment.amount.toFixed(2)}</span>
                        </div>
                        
                        {/* Ganhos Totais */}
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-trading-green/10 to-emerald-400/10 rounded-lg border border-trading-green/30">
                          <span className="text-slate-300 font-medium">Ganhos Totais</span>
                          <span className="font-bold text-xl text-trading-green">+${investment.totalEarned.toFixed(2)}</span>
                        </div>

                        {/* Regra 2.5% - Clique duplo para dividir por 2 */}
                        <div 
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                            isClicked 
                              ? 'bg-gradient-to-r from-trading-green/20 to-emerald-400/20 border-trading-green/50 shadow-lg' 
                              : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50 hover:border-slate-500/50'
                          }`}
                          onDoubleClick={() => handleDoubleClick(investment.id)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-semibold">
                              Ganhos de Hoje {isClicked ? '(Dividido por 2)' : ''}
                            </span>
                            <span className="text-trading-green font-bold text-lg">
                              +${(isClicked ? currentEarnings / 2 : currentEarnings).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-slate-400 text-sm">
                            {investment.operationsCompleted}/2 operações realizadas hoje
                          </div>
                        </div>
                        
                        {/* Contador de 24h para operações */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300 font-medium">
                              <Timer className="inline h-4 w-4 mr-2 text-trading-green" />
                              Contador 24h
                            </span>
                            <span className="text-trading-green font-bold">
                              {Math.floor(progress)}%
                            </span>
                          </div>
                          <div className="relative">
                            <Progress value={progress} className="h-3 bg-slate-700" />
                            <div className="absolute inset-0 bg-gradient-to-r from-trading-green to-emerald-400 rounded-full opacity-20"></div>
                          </div>
                          <div className="text-slate-400 text-sm text-center">
                            {investment.currentOperation?.timeRemaining 
                              ? `${Math.floor(investment.currentOperation.timeRemaining / 3600)}h ${Math.floor((investment.currentOperation.timeRemaining % 3600) / 60)}m restantes`
                              : 'Operações liberadas'
                            }
                          </div>
                        </div>

                        {/* Operações Hoje */}
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                          <span className="text-slate-300 font-medium">Operações Hoje</span>
                          <span className="font-bold text-lg text-white">
                            {investment.operationsCompleted}/2
                          </span>
                        </div>

                        {/* Botão de Executar Operação */}
                        {(() => {
                          const canExecute = canExecuteOperationBasedOnTime(investment);
                          const hasReachedLimit = investment.operationsCompleted >= 2;
                          
                          if (hasReachedLimit && !canExecute) {
                            return (
                              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 text-center border border-orange-500/30">
                                <span className="text-orange-400 font-bold text-lg">
                                  ⏰ Aguarde 24h para novas operações
                                </span>
                              </div>
                            );
                          }
                          
                          if (canExecute && hasReachedLimit) {
                            return (
                              <Button
                                onClick={() => executeOperation(investment)}
                                disabled={isProcessing}
                                className={`w-full h-12 text-lg font-bold transition-all duration-300 ${
                                  isProcessing 
                                    ? 'bg-slate-600 text-slate-400' 
                                    : 'bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-500/90 hover:to-emerald-400/90 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                }`}
                                size="lg"
                              >
                                {isProcessing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                    Executando...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-5 w-5 mr-3" />
                                    🔄 Novo Dia - Executar Operação 1/2
                                  </>
                                )}
                              </Button>
                            );
                          }
                          
                          if (investment.operationsCompleted < 2) {
                            return (
                              <Button
                                onClick={() => executeOperation(investment)}
                                disabled={isProcessing}
                                className={`w-full h-12 text-lg font-bold transition-all duration-300 ${
                                  isProcessing 
                                    ? 'bg-slate-600 text-slate-400' 
                                    : 'bg-gradient-to-r from-trading-green to-emerald-400 hover:from-trading-green/90 hover:to-emerald-400/90 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                }`}
                                size="lg"
                              >
                                {isProcessing ? (
                                  <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                    Executando...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-5 w-5 mr-3" />
                                    Executar Operação {investment.operationsCompleted + 1}/2
                                  </>
                                )}
                              </Button>
                            );
                          }
                          
                          return null;
                        })()}
                        
                        {/* Status da operação atual */}
                        {investment.currentOperation && (
                          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-white font-semibold">
                                {investment.currentOperation.pair}
                              </span>
                              <span className="text-trading-green font-bold text-lg">
                                +${investment.currentOperation.profit.toFixed(2)}
                              </span>
                            </div>
                            <div className="relative mb-2">
                              <Progress value={investment.currentOperation.progress} className="h-2 bg-slate-700" />
                              <div className="absolute inset-0 bg-gradient-to-r from-trading-green to-emerald-400 rounded-full opacity-30"></div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-sm">
                                {Math.floor(investment.currentOperation.timeRemaining / 60)}:{(investment.currentOperation.timeRemaining % 60).toString().padStart(2, '0')}
                              </span>
                              <span className="text-slate-400 text-sm">
                                {investment.currentOperation.progress.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Dias Restantes */}
                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-slate-600/30">
                          <span className="text-slate-300 font-medium">Dias Restantes</span>
                          <span className="font-bold text-2xl text-white">
                            {investment.daysRemaining} dias
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivePlansPage;
