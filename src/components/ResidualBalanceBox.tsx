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
      <Card className="bg-gradient-to-br from-blue-950/50 via-slate-900/50 to-cyan-950/50 border border-blue-500/20 backdrop-blur-sm animate-pulse">
        <CardHeader>
          <div className="w-32 h-6 bg-blue-400/20 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="w-24 h-8 bg-blue-400/20 rounded"></div>
            <div className="w-full h-4 bg-blue-400/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-950/50 via-slate-900/50 to-cyan-950/50 border border-blue-500/20 backdrop-blur-sm hover:border-blue-400/40 transition-all duration-500 animate-fade-in relative overflow-hidden group shadow-lg shadow-blue-500/10">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-radial from-blue-400/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-2 right-2 text-blue-400/60 animate-bounce text-sm" style={{ animationDelay: '0.5s' }}>
          💰
        </div>
        <div className="absolute bottom-2 left-2 text-cyan-300/40 animate-bounce text-sm" style={{ animationDelay: '1.5s' }}>
          ⭐
        </div>
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:shadow-blue-400/50 transition-shadow duration-300">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-blue-400 text-sm font-bold group-hover:text-blue-300 transition-colors">
                Saldo Residual
              </CardTitle>
              <div className="text-xs text-blue-500/80">Sistema de Indicações</div>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white font-bold border-blue-400/50 px-2 py-1 text-xs"
          >
            10%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 relative z-10 pt-2">
        {/* Saldo Principal */}
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4 mr-1 text-cyan-500" />
            {stats?.residual_balance?.toFixed(2) || '0.00'}
          </div>
          <div className="text-blue-300/80 text-xs">Saldo Total</div>
        </div>

        {/* Estatísticas Compactas */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/60 rounded p-2 border border-blue-500/40">
            <div className="flex items-center justify-between mb-1">
              <Users className="h-3 w-3 text-blue-400" />
              <span className="text-blue-300 text-xs">Indicações</span>
            </div>
            <div className="text-blue-400 font-bold">{stats?.active_referrals || 0}</div>
          </div>

          <div className="bg-slate-800/60 rounded p-2 border border-blue-500/40">
            <div className="flex items-center justify-between mb-1">
              <Calendar className="h-3 w-3 text-blue-400" />
              <span className="text-blue-300 text-xs">Este Mês</span>
            </div>
            <div className="text-blue-400 font-bold text-xs">
              ${stats?.this_month_earnings?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>

        {/* Total de Comissões Compacto */}
        <div className="bg-gradient-to-r from-slate-800/80 to-blue-950/60 rounded-lg p-2 border border-blue-500/60">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3 text-blue-400" />
              <span className="text-blue-300 text-xs font-semibold">Total Comissões</span>
            </div>
            <ArrowUpRight className="h-3 w-3 text-green-400" />
          </div>
          <div className="text-blue-400 font-bold text-sm">
            ${stats?.total_commissions?.toFixed(2) || '0.00'}
          </div>
        </div>

        {/* Ações Compactas */}
        <div className="space-y-1">
          <Button
            onClick={() => window.location.href = '/referrals'}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-blue-500/30 text-xs py-1.5"
          >
            <Target className="h-3 w-3 mr-1" />
            Gerenciar
          </Button>
          
          <Button
            variant="outline"
            onClick={fetchReferralStats}
            className="w-full border-blue-500 text-blue-400 hover:text-white hover:bg-blue-500/90 transition-all duration-300 text-xs py-1"
            size="sm"
          >
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResidualBalanceBox;