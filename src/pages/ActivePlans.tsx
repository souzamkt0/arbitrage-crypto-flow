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
  Trophy,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActivePlans } from "@/components/ActivePlans";

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
  const { user, session, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [userInvestments, setUserInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

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
            timeRemaining: 0
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-trading-green to-emerald-400 bg-clip-text text-transparent">
                PLANOS ATIVOS
              </h1>
              <p className="text-slate-400">Gerenciamento de investimentos premium</p>
            </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-trading-green/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Capital</CardTitle>
              <DollarSign className="h-4 w-4 text-trading-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${totalInvested.toFixed(2)}</div>
              <p className="text-xs text-slate-400">Total investido</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Robôs</CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeInvestments}</div>
              <p className="text-xs text-slate-400">Planos ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Ops</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {userInvestments.reduce((sum, inv) => sum + inv.operationsCompleted, 0)}
              </div>
              <p className="text-xs text-slate-400">Operações realizadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalInvested > 0 ? ((totalEarnings / totalInvested) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-slate-400">Retorno total</p>
            </CardContent>
          </Card>
        </div>

        {/* Market Indicators */}
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-trading-green rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">BTC: $43,250</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">ETH: $2,680</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">BNB: $315</span>
          </div>
        </div>

        {/* ActivePlans Component */}
        <ActivePlans 
          userInvestments={userInvestments}
          isMobile={isMobile}
          activeInvestments={activeInvestments}
          onInvestmentUpdate={setUserInvestments}
        />
      </div>
    </div>
  );
};

export default ActivePlansPage;