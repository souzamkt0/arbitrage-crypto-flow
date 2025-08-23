import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  Sparkles,
  Target,
  Gift
} from "lucide-react";

interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_commissions: number;
  residual_balance: number;
  this_month_earnings: number;
}

const ResidualBalanceBox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReferralStats = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_user_referral_stats', {
        target_user_id: user.id
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setStats(data[0]);
      } else {
        setStats({
          total_referrals: 0,
          active_referrals: 0,
          total_commissions: 0,
          residual_balance: 0,
          this_month_earnings: 0
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de indicação:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar estatísticas de indicação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralStats();
  }, [user?.id]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 border border-yellow-500/60 backdrop-blur-sm animate-pulse">
        <CardHeader>
          <div className="w-32 h-6 bg-yellow-400/20 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="w-24 h-8 bg-yellow-400/20 rounded"></div>
            <div className="w-full h-4 bg-yellow-400/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 border border-yellow-500/60 backdrop-blur-sm hover:border-yellow-400/80 transition-all duration-500 animate-fade-in relative overflow-hidden group shadow-xl shadow-yellow-500/10">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-yellow-400/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(234,179,8,0.1)_0%,_transparent_50%)] animate-pulse"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-4 right-4 text-yellow-400/80 animate-bounce text-lg" style={{ animationDelay: '0.5s' }}>
          💰
        </div>
        <div className="absolute bottom-6 left-6 text-yellow-300/60 animate-bounce text-lg" style={{ animationDelay: '1.5s' }}>
          ⭐
        </div>
        <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-yellow-400/40 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-yellow-300/50 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-yellow-500/60 rounded-full animate-ping" style={{ animationDelay: '4s' }}></div>
      </div>

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:shadow-yellow-400/50 transition-shadow duration-300 animate-pulse">
              <Gift className="w-6 h-6 text-black animate-bounce" />
            </div>
            <div>
              <CardTitle className="text-yellow-400 text-lg font-bold group-hover:text-yellow-300 transition-colors animate-pulse">
                Saldo Residual
              </CardTitle>
              <div className="text-xs text-yellow-500/80">Sistema de Indicações</div>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-yellow-600/90 to-yellow-500/90 text-black font-bold border-yellow-400/50 animate-pulse px-3 py-1 shadow-md shadow-yellow-500/20"
          >
            10% Residual
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Saldo Principal */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-yellow-400 mb-2 flex items-center justify-center animate-pulse">
            <DollarSign className="w-6 h-6 mr-1 text-yellow-500" />
            {stats?.residual_balance?.toFixed(2) || '0.00'}
          </div>
          <div className="text-yellow-300/80 text-sm">Saldo Total Acumulado</div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-800/60 rounded-lg p-3 border border-yellow-500/40 group-hover:border-yellow-400/70 transition-colors animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-yellow-300 text-xs">Indicações</span>
            </div>
            <div className="text-yellow-400 font-bold text-lg animate-bounce">{stats?.active_referrals || 0}</div>
            <div className="text-yellow-300/70 text-xs">Ativos de {stats?.total_referrals || 0} totais</div>
          </div>

          <div className="bg-gray-800/60 rounded-lg p-3 border border-yellow-500/40 group-hover:border-yellow-400/70 transition-colors animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-yellow-300 text-xs">Este Mês</span>
            </div>
            <div className="text-yellow-400 font-bold text-lg animate-bounce">
              ${stats?.this_month_earnings?.toFixed(2) || '0.00'}
            </div>
            <div className="text-yellow-300/70 text-xs">Ganhos mensais</div>
          </div>
        </div>

        {/* Comissões Totais */}
        <div className="bg-gradient-to-r from-gray-800/80 to-black/60 rounded-lg p-4 border border-yellow-500/60 group-hover:border-yellow-400/90 transition-colors animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-yellow-300 text-sm font-semibold">Total de Comissões</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-green-400 animate-bounce" />
          </div>
          <div className="text-yellow-400 font-bold text-xl mb-1 animate-pulse">
            ${stats?.total_commissions?.toFixed(2) || '0.00'}
          </div>
          <div className="text-yellow-300/70 text-xs">
            Ganhos acumulados desde o início
          </div>
        </div>

        {/* Sistema de Indicação Info */}
        <div className="bg-gradient-to-r from-black/80 to-gray-900/60 rounded-lg p-3 border border-yellow-500/50 animate-fade-in">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-400 animate-spin" />
            <span className="text-yellow-300 text-sm font-semibold">Como Funciona</span>
          </div>
          <div className="text-yellow-300/80 text-xs space-y-1">
            <div>• Ganhe 10% sobre cada novo cadastro indicado</div>
            <div>• Receba 10% residual dos investimentos</div>
            <div>• Saque disponível conforme regulamento</div>
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-2">
          <Button
            onClick={() => window.location.href = '/referrals'}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/40 animate-pulse"
          >
            <Target className="h-4 w-4 mr-2" />
            Gerenciar Indicações
          </Button>
          
          <Button
            variant="outline"
            onClick={fetchReferralStats}
            className="w-full border-yellow-500 text-yellow-400 hover:text-black hover:bg-yellow-500/90 transition-all duration-300 animate-fade-in"
            size="sm"
          >
            Atualizar Dados
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResidualBalanceBox;