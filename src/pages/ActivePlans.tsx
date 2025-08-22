import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Trophy,
  RefreshCw,
  Settings,
  History as HistoryIcon,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const ActivePlansPage = () => {
  console.log('🚀 [ActivePlansPage] Componente carregado!');
  
  const { user, session, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [userInvestments, setUserInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOperations, setProcessingOperations] = useState<Set<string>>(new Set());

  console.log('👤 [ActivePlansPage] Estado do usuário:', { 
    userId: user?.id, 
    isLoading: authLoading, 
    investmentsCount: userInvestments.length 
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      loadUserInvestments();
    }
  }, [user, authLoading, navigate]);

  const loadUserInvestments = async () => {
    if (!user?.id) {
      console.log('❌ [ActivePlans] Usuário não autenticado');
      setLoading(false);
      return;
    }

    console.log('🔄 [ActivePlans] SINCRONIZAÇÃO INICIADA para:', user.id);
    setLoading(true);
    
    try {
      // Query direta e simples para garantir funcionamento
      console.log('🔄 [ActivePlans] Fazendo query direta...');
      const { data: investmentsData, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          investment_plans(name, robot_version, daily_rate)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      console.log('📊 [ActivePlans] RESULTADO DA SINCRONIZAÇÃO:');
      console.log('📊 Erro:', error);
      console.log('📊 Dados encontrados:', investmentsData?.length || 0);
      console.log('📊 Primeiro investimento:', investmentsData?.[0]);

      if (error) {
        console.error('❌ [ActivePlans] Erro na query:', error);
        
        // Se for erro de RLS, tentar query mais simples
        if (error.message.includes('RLS') || error.message.includes('policy')) {
          console.log('🔄 [ActivePlans] Tentando query sem join...');
          const { data: simpleData, error: simpleError } = await supabase
            .from('user_investments')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false });
            
          if (simpleError) {
            toast({
              title: "Erro de acesso",
              description: "Problema de segurança detectado. Faça login novamente.",
              variant: "destructive",
            });
            navigate('/login');
            return;
          }
          
          // Usar dados simples se sucesso
          console.log('✅ [ActivePlans] Query simples funcionou:', simpleData?.length);
          const formattedData = (simpleData || []).map(investment => ({
            id: investment.id,
            investmentName: 'Robô 4.0.0',
            amount: investment.amount,
            totalEarned: investment.total_earned || 0,
            status: investment.status,
            startDate: investment.start_date || investment.created_at,
            endDate: investment.end_date,
            daysRemaining: Math.max(0, Math.floor((new Date(investment.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
            operationsCompleted: investment.operations_completed || 0,
            currentOperation: {
              pair: 'BTC/USDT',
              profit: 0,
              progress: 0,
              timeRemaining: 0
            }
          }));
          
          setUserInvestments(formattedData);
          
          toast({
            title: "✅ Planos Sincronizados!",
            description: `${formattedData.length} planos ativos carregados com sucesso.`,
          });
          return;
        }
        
        toast({
          title: "Erro ao carregar dados",
          description: error.message,
          variant: "destructive",
        });
        setUserInvestments([]);
        return;
      }

      if (!investmentsData || investmentsData.length === 0) {
        console.log('⚠️ [ActivePlans] Nenhum investimento encontrado');
        setUserInvestments([]);
        toast({
          title: "Nenhum plano ativo",
          description: "Você não possui investimentos ativos no momento.",
        });
        return;
      }

      // Formatear os dados recebidos do Supabase
      const formattedInvestments: Investment[] = investmentsData.map(investment => {
        console.log('🔍 [ActivePlans] Processando investimento:', investment.id);
        
        const startDate = new Date(investment.start_date || investment.created_at);
        if (isNaN(startDate.getTime())) {
          console.warn('Data inválida para investimento:', investment.id);
          return null;
        }
        
        const endDate = new Date(investment.end_date);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Definir nome do plano baseado nos dados ou usar fallback
        const planName = investment.investment_plans?.name || 'Robô 4.0.0';

        return {
          id: investment.id,
          investmentName: planName,
          amount: investment.amount,
          totalEarned: investment.total_earned || 0,
          status: investment.status,
          startDate: investment.start_date || investment.created_at,
          endDate: investment.end_date,
          daysRemaining,
          operationsCompleted: investment.operations_completed || 0,
          currentOperation: {
            pair: 'BTC/USDT',
            profit: 0,
            progress: 0,
            timeRemaining: Math.floor(Math.random() * 3600) // Random para demo
          }
        };
      }).filter(Boolean);

      console.log('✅ [ActivePlans] Investimentos formatados:', formattedInvestments);
      setUserInvestments(formattedInvestments);
      
      toast({
        title: "✅ Sincronizado!",
        description: `${formattedInvestments.length} planos ativos carregados.`,
      });
      
    } catch (error) {
      console.error('❌ [ActivePlans] Erro ao carregar investimentos:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar seus investimentos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para executar arbitragem
  const executeArbitrage = async (investment: Investment) => {
    if (processingOperations.has(investment.id)) return;
    
    setProcessingOperations(prev => new Set(prev).add(investment.id));

    try {
      // Calcular ganho da operação (1.25% por operação)
      const operationProfit = (investment.amount * 1.25) / 100;
      
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

      setUserInvestments(updatedInvestments);

      // Salvar no Supabase
      if (user) {
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
        }
      }

      toast({
        title: "🚀 Arbitragem Executada!",
        description: `Ganho de $${operationProfit.toFixed(2)} registrado com sucesso.`,
      });

    } catch (error) {
      console.error('Erro ao executar arbitragem:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar arbitragem. Tente novamente.",
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

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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
          </div>
          <Button
            onClick={loadUserInvestments}
            className="flex items-center gap-2 bg-trading-green hover:bg-trading-green/80"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>

        {/* Market Data - LIVE */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-trading-green rounded-full animate-pulse"></div>
            <span className="text-trading-green font-medium text-sm">LIVE</span>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-trading-green">●</span>
              <span className="text-white">BTC/USDT:</span>
              <span className="text-trading-green">$67,234</span>
              <span className="text-trading-green text-xs">(+2.34%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">●</span>
              <span className="text-white">ETH/USDT:</span>
              <span className="text-blue-400">$3,847</span>
              <span className="text-blue-400 text-xs">(+1.87%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">●</span>
              <span className="text-white">BNB/USDT:</span>
              <span className="text-yellow-400">$634</span>
              <span className="text-red-400 text-xs">(-0.92%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">●</span>
              <span className="text-white">BOT Total:</span>
              <span className="text-yellow-400">+143.42%</span>
            </div>
          </div>
        </div>

        {/* Painel de Trading Bots */}
        <div className="bg-slate-800/70 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-trading-green to-emerald-400 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Painel de Trading Bots</h2>
                <p className="text-slate-400 text-sm">Gerencie seus robôs de arbitragem ativos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-trading-green/20 rounded-full">
              <div className="w-2 h-2 bg-trading-green rounded-full animate-pulse"></div>
              <span className="text-trading-green text-sm font-medium">SISTEMAS ATIVOS</span>
            </div>
          </div>

          {/* Robôs Ativos */}
          {activeInvestments === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum Robô Ativo</h3>
              <p className="text-slate-400">Você não possui robôs de arbitragem ativos no momento.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {userInvestments
                .filter(investment => investment.status === "active")
                .map((investment) => {
                  const isProcessing = processingOperations.has(investment.id);
                  const opsRemaining = Math.max(0, 2 - investment.operationsCompleted);
                  const currentTime = new Date();
                  const hours = currentTime.getHours();
                  const minutes = currentTime.getMinutes();
                  const currentTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                  
                  return (
                    <Card key={investment.id} className="bg-slate-800/90 border-slate-700 overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-white">{investment.investmentName}</CardTitle>
                              <p className="text-slate-400 text-sm">Arbitragem Ativa • {investment.operationsCompleted} operação{investment.operationsCompleted !== 1 ? 'ões' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-2 py-1 bg-trading-green/20 rounded text-trading-green text-sm">
                            <div className="w-2 h-2 bg-trading-green rounded-full animate-pulse"></div>
                            LIVE
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                            <div className="text-slate-400 text-xs font-medium mb-1">CAPITAL</div>
                            <div className="text-white font-bold">${investment.amount.toFixed(2)}</div>
                          </div>
                          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                            <div className="text-slate-400 text-xs font-medium mb-1">LUCRO</div>
                            <div className="text-trading-green font-bold">+${investment.totalEarned.toFixed(2)}</div>
                          </div>
                          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                            <div className="text-slate-400 text-xs font-medium mb-1">HOJE</div>
                            <div className="text-yellow-400 font-bold">+$0.00</div>
                          </div>
                        </div>

                        {/* Progresso Diário */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Progresso Diário</span>
                            <span className="text-white">0.0%</span>
                          </div>
                          <div className="relative">
                            <Progress value={0} className="h-2 bg-slate-700" />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                              <span>00:00</span>
                              <span>Atual: {currentTimeStr}</span>
                              <span>23:59</span>
                            </div>
                          </div>
                        </div>

                        {/* Taxa de Sucesso e ROI */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-slate-400 text-sm">Taxa de Sucesso</div>
                            <div className="text-trading-green font-bold text-lg">98.7%</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm">ROI Atual</div>
                            <div className="text-trading-green font-bold text-lg">+0.0%</div>
                          </div>
                        </div>

                        {/* Status do Bot */}
                        <div className="flex items-center gap-2 p-3 bg-trading-green/10 rounded-lg border border-trading-green/30">
                          <div className="w-2 h-2 bg-trading-green rounded-full animate-pulse"></div>
                          <span className="text-trading-green font-medium">Bot Pronto para Operar</span>
                          <span className="text-trading-green text-sm ml-auto">{opsRemaining} ops restantes</span>
                        </div>

                        {/* Botão de Execução */}
                        <Button
                          onClick={() => executeArbitrage(investment)}
                          disabled={isProcessing || opsRemaining === 0}
                          className="w-full bg-gradient-to-r from-trading-green to-emerald-500 hover:from-trading-green/80 hover:to-emerald-500/80 text-white font-bold py-3"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              EXECUTANDO...
                            </>
                          ) : opsRemaining > 0 ? (
                            <>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              EXECUTAR ARBITRAGEM
                            </>
                          ) : (
                            "LIMITE DIÁRIO ATINGIDO"
                          )}
                        </Button>

                        {/* Tabs */}
                        <Tabs defaultValue="historico" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                            <TabsTrigger value="historico" className="flex items-center gap-2">
                              <HistoryIcon className="h-4 w-4" />
                              Histórico
                            </TabsTrigger>
                            <TabsTrigger value="config" className="flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Config
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="historico" className="mt-4">
                            <div className="text-center py-8 text-slate-400">
                              <HistoryIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Nenhum histórico disponível</p>
                            </div>
                          </TabsContent>
                          <TabsContent value="config" className="mt-4">
                            <div className="text-center py-8 text-slate-400">
                              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Configurações em desenvolvimento</p>
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* Performance 24h */}
                        <div className="space-y-2">
                          <div className="text-slate-300 text-sm">Performance 24h</div>
                          <div className="h-20 bg-slate-700/30 rounded-lg flex items-end justify-center p-2">
                            <div className="w-full h-8 bg-gradient-to-r from-trading-green/50 to-trading-green rounded-sm"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivePlansPage;