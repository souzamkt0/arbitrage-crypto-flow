import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  CheckCircle, 
  PlayCircle, 
  Activity,
  Clock,
  DollarSign,
  Target,
  Timer,
  Plus,
  Zap,
  Star,
  Crown
} from 'lucide-react';

interface Investment {
  id: string;
  investmentName: string;
  amount: number;
  totalEarned: number;
  daysRemaining: number;
  status: string;
  startDate: string;
  endDate?: string;
  operationsCompleted: number;
  currentOperation?: {
    pair: string;
    profit: number;
    progress: number;
    timeRemaining: number;
  };
}

interface ActivePlansProps {
  userInvestments: Investment[];
  isMobile: boolean;
  activeInvestments: number;
  onInvestmentUpdate?: (updatedInvestments: Investment[]) => void;
}

export function ActivePlans({ userInvestments, isMobile, activeInvestments, onInvestmentUpdate }: ActivePlansProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clickedInvestments, setClickedInvestments] = useState<Set<string>>(new Set());
  const [processingOperations, setProcessingOperations] = useState<Set<string>>(new Set());

  // Calcular ganhos atuais baseados nas operações realizadas HOJE
  const calculateCurrentEarnings = (investment: Investment) => {
    // Cada operação rende 1.25% (metade de 2.5%)
    const operationRate = 1.25;
    const earningsPerOperation = (investment.amount * operationRate) / 100;
    
    // Ganhos atuais = apenas as operações realizadas hoje
    const todayEarnings = earningsPerOperation * investment.operationsCompleted;
    return todayEarnings;
  };

  // Calcular progresso baseado no contador de 24h
  const calculateProgress = (investment: Investment) => {
    // Simular progresso baseado em 24h (86400 segundos)
    const totalSeconds = 86400;
    const elapsedSeconds = totalSeconds - (investment.currentOperation?.timeRemaining || 0);
    return Math.min((elapsedSeconds / totalSeconds) * 100, 100);
  };

  // Verificar se pode executar operação baseado no tempo
  const canExecuteOperationBasedOnTime = (investment: Investment) => {
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
  const executeOperation = async (investment: Investment) => {
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
          profit: 0,
          progress: 0,
          timeRemaining: 86400 // 24h em segundos
        }
      };
      
      // Atualizar lista localmente
      const updatedInvestments = userInvestments.map(inv => 
        inv.id === investment.id ? resetInvestment : inv
      );
      
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
      
      // Notificar componente pai
      if (onInvestmentUpdate) {
        onInvestmentUpdate(updatedInvestments);
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
      // Obter a taxa diária das configurações do admin ou padrão
      const adminSettings = JSON.parse(localStorage.getItem("alphabit_admin_settings") || "{}");
      const strategy = investment.investmentName?.toLowerCase().includes('conservador') ? 'conservador' :
                      investment.investmentName?.toLowerCase().includes('moderado') ? 'moderado' : 'livre';
      
      const dailyRate = adminSettings[`${strategy}DailyRate`] || 
                       (strategy === 'conservador' ? 2.0 : strategy === 'moderado' ? 3.0 : 4.0);
      
      const operationProfit = (investment.amount * dailyRate) / 100;
      
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
          profit: operationProfit,
          progress: 100,
          timeRemaining: 86400 // 24h em segundos para próxima liberação
        }
      };

      // Atualizar lista de investimentos
      const updatedInvestments = userInvestments.map(inv => 
        inv.id === investment.id ? updatedInvestment : inv
      );

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
            daily_rate: dailyRate,
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

      // Notificar componente pai
      if (onInvestmentUpdate) {
        onInvestmentUpdate(updatedInvestments);
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

  if (activeInvestments === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-2 border-trading-green/20 rounded-2xl p-8 text-center backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-trading-green/10 rounded-full">
            <Target className="h-8 w-8 text-trading-green" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            Nenhum Plano Ativo
          </h3>
        </div>
        <p className="text-slate-300 mb-6 text-lg">
          Você ainda não possui planos de investimento ativos.
        </p>
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <p className="text-slate-400">
            Para começar a investir, acesse a aba "Investimentos" e escolha um plano.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-2 border-trading-green/30 rounded-2xl p-6 space-y-6 backdrop-blur-sm shadow-2xl">
      {/* Header Premium */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-trading-green to-emerald-400 rounded-full">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-trading-green to-emerald-400 bg-clip-text text-transparent">
            🟢 PLANOS ATIVOS PREMIUM
          </h3>
          <div className="p-2 bg-gradient-to-r from-trading-green to-emerald-400 rounded-full">
            <Star className="h-6 w-6 text-white" />
          </div>
        </div>
        <p className="text-slate-300 text-lg">
          {activeInvestments} {activeInvestments === 1 ? 'plano ativo' : 'planos ativos'} gerando rendimentos automaticamente
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Zap className="h-4 w-4 text-trading-green animate-pulse" />
          <span className="text-sm text-trading-green font-medium">Sistema de Trading Automatizado</span>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
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
    </div>
  );
}
